import supabase from '../../config/supabaseClient.js';
import notificationPolicy from './notificationPolicy.js';
import notificationQueue from './notificationQueue.js';

class NotificationService {
  async processCrisisNotification({ userId, riskLevel, userName = 'User', triggerSource = 'AI_SAFETY_ENGINE' }) {
    console.log(`🔔 Processing Crisis Notification Request for User: ${userId}`);

    // 1. Log Crisis Event
    const { data: crisisEvent, error: crisisErr } = await supabase
      .from('crisis_events')
      .insert([
        {
          user_id: userId,
          risk_level: riskLevel,
          trigger_source: triggerSource,
          status: 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (crisisErr) {
      console.warn('Notice: Crisis event insert notice:', crisisErr.message);
    }

    // 2. Evaluate Policy
    const evaluation = await notificationPolicy.evaluateNotificationRequest({
      userId,
      riskLevel,
      notificationType: 'HIGH_RISK_ALERT',
    });

    if (!evaluation.allowed) {
      console.log(`⛔ Notification Blocked by Policy Engine: ${evaluation.reason}`);

      // Record Blocked Audit Log
      await supabase.from('notifications').insert([
        {
          user_id: userId,
          recipient_type: 'GUARDIAN',
          recipient_id: evaluation.contact?.id || null,
          channel: 'EMAIL',
          notification_type: 'HIGH_RISK_ALERT',
          risk_level: riskLevel,
          status: 'BLOCKED',
          failure_reason: evaluation.reason,
        },
      ]);

      return {
        triggered: false,
        reason: evaluation.reason,
      };
    }

    const contact = evaluation.contact;

    // 3. Create Pending Notification Record in DB
    const { data: notifRecord, error: notifErr } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          recipient_type: 'GUARDIAN',
          recipient_id: contact.id,
          channel: 'EMAIL',
          notification_type: 'HIGH_RISK_ALERT',
          risk_level: riskLevel,
          status: 'PENDING',
          provider: 'SMTP',
        },
      ])
      .select()
      .single();

    const notifId = notifRecord?.id || `notif_${Date.now()}`;

    // Update Crisis Event with Notification ID
    if (crisisEvent?.id) {
      await supabase
        .from('crisis_events')
        .update({ notification_triggered: true, notification_id: notifId })
        .eq('id', crisisEvent.id);
    }

    // 4. Enqueue for Async Background Send
    notificationQueue.enqueue({
      notificationId: notifId,
      userId,
      contact,
      notificationType: 'HIGH_RISK_ALERT',
      userName,
    });

    return {
      triggered: true,
      notificationId: notifId,
      recipientEmail: contact.email,
      message: 'Notification policy approved. Emergency alert queued for delivery.',
    };
  }

  async sendVerificationEmail({ userId, contact, userName, verificationUrl }) {
    const { data: notifRecord } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          recipient_type: 'GUARDIAN',
          recipient_id: contact.id,
          channel: 'EMAIL',
          notification_type: 'GUARDIAN_VERIFICATION',
          risk_level: 'LOW',
          status: 'PENDING',
          provider: 'SMTP',
        },
      ])
      .select()
      .single();

    const notifId = notifRecord?.id || `verif_${Date.now()}`;

    notificationQueue.enqueue({
      notificationId: notifId,
      userId,
      contact,
      notificationType: 'GUARDIAN_VERIFICATION',
      userName,
      verificationUrl,
    });

    return { success: true, notificationId: notifId };
  }
}

export default new NotificationService();

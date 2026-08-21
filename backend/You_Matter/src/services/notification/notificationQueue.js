import supabase from '../../config/supabaseClient.js';
import smtpProvider from '../email/smtpProvider.js';
import { getHighRiskAlertTemplate, getGuardianVerificationTemplate } from '../email/emailTemplates.js';

class NotificationQueueWorker {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async enqueue(job) {
    this.queue.push(job);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await this.executeJob(job);
      } catch (err) {
        console.error('❌ Notification Worker Error:', err);
      }
    }

    this.isProcessing = false;
  }

  async executeJob(job) {
    const { notificationId, userId, contact, notificationType, userName, verificationUrl } = job;
    console.log(`🚀 Executing Notification Job [${notificationId}] for ${contact.email}`);

    // Update status to PROCESSING
    await supabase
      .from('notifications')
      .update({ status: 'PROCESSING', attempt_count: 1, last_attempt_at: new Date().toISOString() })
      .eq('id', notificationId);

    let emailData;
    if (notificationType === 'GUARDIAN_VERIFICATION') {
      emailData = getGuardianVerificationTemplate({
        guardianName: contact.name,
        userName,
        verificationUrl,
      });
    } else {
      emailData = getHighRiskAlertTemplate({
        guardianName: contact.name,
        userName,
        timestamp: Date.now(),
      });
    }

    const result = await smtpProvider.sendEmail({
      to: contact.email,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (result.success) {
      await supabase
        .from('notifications')
        .update({
          status: 'SENT',
          sent_at: new Date().toISOString(),
          provider_message_id: result.messageId || 'sent',
        })
        .eq('id', notificationId);

      console.log(`✅ Notification [${notificationId}] delivered via SMTP.`);
    } else {
      await supabase
        .from('notifications')
        .update({
          status: 'FAILED',
          failure_reason: result.error || 'SMTP delivery failed',
        })
        .eq('id', notificationId);

      console.error(`❌ Notification [${notificationId}] failed: ${result.error}`);
    }
  }
}

export default new NotificationQueueWorker();

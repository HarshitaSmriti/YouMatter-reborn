import supabase from '../../config/supabaseClient.js';

class NotificationPolicyEngine {
  async evaluateNotificationRequest({ userId, riskLevel, notificationType = 'HIGH_RISK_ALERT' }) {
    console.log(`Policy Engine Evaluating: User ${userId} | Risk: ${riskLevel} | Type: ${notificationType}`);

    // 1. Only HIGH risk signals trigger guardian notifications
    if (riskLevel !== 'HIGH') {
      return {
        allowed: false,
        reason: `Risk level '${riskLevel}' does not meet the HIGH risk threshold required for guardian alerts.`,
      };
    }

    if (!userId) {
      return {
        allowed: false,
        reason: 'User is unauthenticated or guest session.',
      };
    }

    // 2. Query active trusted contact for this user from database
    const { data: contacts, error: contactErr } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (contactErr || !contacts || contacts.length === 0) {
      return {
        allowed: false,
        reason: 'No active trusted contact configured for this user.',
      };
    }

    const contact = contacts[0];

    // 3. Check explicit notification consent
    if (!contact.notification_consent) {
      return {
        allowed: false,
        contact,
        reason: 'User has not granted explicit notification consent for trusted contacts.',
      };
    }

    // 4. Check category specific permission
    if (notificationType === 'HIGH_RISK_ALERT' && !contact.high_risk_notification_enabled) {
      return {
        allowed: false,
        contact,
        reason: 'High-risk notification category is toggled off by user.',
      };
    }

    if (notificationType === 'WELLBEING_SUPPORT' && !contact.wellbeing_notification_enabled) {
      return {
        allowed: false,
        contact,
        reason: 'Wellbeing notification category is toggled off by user.',
      };
    }

    // 5. Cooldown check (default 60 minutes)
    const cooldownMinutes = parseInt(process.env.GUARDIAN_NOTIFICATION_COOLDOWN_MINUTES || '60', 10);
    const cooldownCutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000).toISOString();

    const { data: recentSends, error: recentErr } = await supabase
      .from('notifications')
      .select('id, sent_at, created_at')
      .eq('user_id', userId)
      .eq('recipient_id', contact.id)
      .eq('status', 'SENT')
      .gte('created_at', cooldownCutoff);

    if (!recentErr && recentSends && recentSends.length > 0) {
      return {
        allowed: false,
        contact,
        reason: `Notification cooldown active (${cooldownMinutes}m). Last alert sent recently.`,
      };
    }

    // 6. Daily limit check (default 3 alerts per day)
    const maxPerDay = parseInt(process.env.MAX_GUARDIAN_NOTIFICATIONS_PER_DAY || '3', 10);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: dailySends } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('recipient_id', contact.id)
      .eq('status', 'SENT')
      .gte('created_at', startOfDay.toISOString());

    if (dailySends && dailySends.length >= maxPerDay) {
      return {
        allowed: false,
        contact,
        reason: `Daily notification limit reached (${maxPerDay} sends per day).`,
      };
    }

    // APPROVED!
    return {
      allowed: true,
      contact,
      reason: 'All policy, consent, cooldown, and safety criteria passed.',
    };
  }
}

export default new NotificationPolicyEngine();

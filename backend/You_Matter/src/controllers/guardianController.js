import supabase from '../config/supabaseClient.js';
import notificationService from '../services/notification/notificationService.js';
import crypto from 'crypto';

function getUserId(req) {
  return req.user?.id || req.headers['x-user-id'] || 'guest-user-id';
}

// 1. CREATE GUARDIAN / TRUSTED CONTACT
export const createGuardian = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      name,
      relationship,
      email,
      phone,
      notificationConsent = false,
      wellbeingNotificationEnabled = true,
      highRiskNotificationEnabled = true,
      emergencyNotificationEnabled = true,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name and email are required fields.' },
      });
    }

    // Insert into trusted_contacts
    const { data: contact, error } = await supabase
      .from('trusted_contacts')
      .insert([
        {
          user_id: userId,
          name: name.trim(),
          relationship: relationship ? relationship.trim() : 'Trusted Person',
          email: email.trim().toLowerCase(),
          phone: phone ? phone.trim() : null,
          notification_consent: Boolean(notificationConsent),
          wellbeing_notification_enabled: Boolean(wellbeingNotificationEnabled),
          high_risk_notification_enabled: Boolean(highRiskNotificationEnabled),
          emergency_notification_enabled: Boolean(emergencyNotificationEnabled),
          email_verified: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate Verification Token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    await supabase.from('guardian_verifications').insert([
      {
        contact_id: contact.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    ]);

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/guardians/verify?token=${rawToken}&id=${contact.id}`;

    // Send Verification Email
    const userName = req.user?.name || req.headers['x-user-name'] || 'YouMatter User';
    await notificationService.sendVerificationEmail({
      userId,
      contact,
      userName,
      verificationUrl,
    });

    // Audit Log
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: 'GUARDIAN_CREATED',
        details: { contact_id: contact.id, email: contact.email, consent: contact.notification_consent },
        ip_address: req.ip,
      },
    ]);

    return res.status(201).json({
      success: true,
      data: {
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        email: contact.email,
        phone: contact.phone,
        notificationConsent: contact.notification_consent,
        emailVerified: contact.email_verified,
        wellbeingNotificationEnabled: contact.wellbeing_notification_enabled,
        highRiskNotificationEnabled: contact.high_risk_notification_enabled,
        emergencyNotificationEnabled: contact.emergency_notification_enabled,
        createdAt: contact.created_at,
      },
      message: 'Trusted contact created successfully. Verification email sent.',
    });
  } catch (err) {
    console.error('Create Guardian Error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Failed to create trusted contact.' },
    });
  }
};

// 2. GET ALL GUARDIANS FOR ACTIVE USER
export const getGuardians = async (req, res) => {
  try {
    const userId = getUserId(req);

    const { data: contacts, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      data: (contacts || []).map((c) => ({
        id: c.id,
        name: c.name,
        relationship: c.relationship,
        email: c.email,
        phone: c.phone,
        notificationConsent: c.notification_consent,
        emailVerified: c.email_verified,
        phoneVerified: c.phone_verified,
        wellbeingNotificationEnabled: c.wellbeing_notification_enabled,
        highRiskNotificationEnabled: c.high_risk_notification_enabled,
        emergencyNotificationEnabled: c.emergency_notification_enabled,
        createdAt: c.created_at,
      })),
    });
  } catch (err) {
    console.error('Get Guardians Error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message || 'Failed to retrieve trusted contacts.' },
    });
  }
};

// 3. GET SINGLE GUARDIAN
export const getGuardianById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const { data: contact, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('revoked_at', null)
      .single();

    if (error || !contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Trusted contact not found.' },
      });
    }

    return res.json({
      success: true,
      data: {
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        email: contact.email,
        phone: contact.phone,
        notificationConsent: contact.notification_consent,
        emailVerified: contact.email_verified,
        wellbeingNotificationEnabled: contact.wellbeing_notification_enabled,
        highRiskNotificationEnabled: contact.high_risk_notification_enabled,
        emergencyNotificationEnabled: contact.emergency_notification_enabled,
        createdAt: contact.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// 4. UPDATE GUARDIAN / CONSENT TOGGLES
export const updateGuardian = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const {
      name,
      relationship,
      email,
      phone,
      notificationConsent,
      wellbeingNotificationEnabled,
      highRiskNotificationEnabled,
      emergencyNotificationEnabled,
    } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (relationship !== undefined) updates.relationship = relationship.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (notificationConsent !== undefined) updates.notification_consent = Boolean(notificationConsent);
    if (wellbeingNotificationEnabled !== undefined) updates.wellbeing_notification_enabled = Boolean(wellbeingNotificationEnabled);
    if (highRiskNotificationEnabled !== undefined) updates.high_risk_notification_enabled = Boolean(highRiskNotificationEnabled);
    if (emergencyNotificationEnabled !== undefined) updates.emergency_notification_enabled = Boolean(emergencyNotificationEnabled);

    const { data: contact, error } = await supabase
      .from('trusted_contacts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Trusted contact not found or access denied.' },
      });
    }

    // Audit Log
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: updates.notification_consent === false ? 'CONSENT_REVOKED' : 'GUARDIAN_UPDATED',
        details: { contact_id: id, updates },
        ip_address: req.ip,
      },
    ]);

    return res.json({
      success: true,
      data: {
        id: contact.id,
        name: contact.name,
        relationship: contact.relationship,
        email: contact.email,
        phone: contact.phone,
        notificationConsent: contact.notification_consent,
        emailVerified: contact.email_verified,
        wellbeingNotificationEnabled: contact.wellbeing_notification_enabled,
        highRiskNotificationEnabled: contact.high_risk_notification_enabled,
        emergencyNotificationEnabled: contact.emergency_notification_enabled,
        updatedAt: contact.updated_at,
      },
      message: 'Trusted contact updated successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// 5. REVOKE CONSENT & DELETE GUARDIAN
export const deleteGuardian = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const { data: contact, error } = await supabase
      .from('trusted_contacts')
      .update({ revoked_at: new Date().toISOString(), notification_consent: false })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Trusted contact not found or access denied.' },
      });
    }

    // Audit Log
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: 'CONSENT_REVOKED',
        details: { contact_id: id, email: contact.email },
        ip_address: req.ip,
      },
    ]);

    return res.json({
      success: true,
      message: 'Consent revoked and trusted contact removed successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
};

// 6. VERIFY GUARDIAN EMAIL VIA TOKEN
export const verifyGuardianEmail = async (req, res) => {
  try {
    const { token, id } = req.query;

    if (!token || !id) {
      return res.status(400).send('<h3>Invalid verification link. Token and ID are required.</h3>');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const { data: verif, error } = await supabase
      .from('guardian_verifications')
      .select('*')
      .eq('contact_id', id)
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !verif) {
      return res.status(400).send('<h3>Verification link is invalid or expired.</h3>');
    }

    // Mark as used & update trusted_contacts email_verified=true
    await supabase.from('guardian_verifications').update({ used_at: new Date().toISOString() }).eq('id', verif.id);
    await supabase.from('trusted_contacts').update({ email_verified: true, updated_at: new Date().toISOString() }).eq('id', id);

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified - YouMatter</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; text-align: center; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .icon { font-size: 48px; margin-bottom: 16px; }
          h2 { color: #0f172a; margin-top: 0; }
          p { color: #64748b; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">💜</div>
          <h2>Trusted Contact Verified!</h2>
          <p>Thank you for verifying your email address. You are now confirmed as a trusted safety contact on YouMatter.</p>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    return res.status(500).send('<h3>Server error processing verification.</h3>');
  }
};

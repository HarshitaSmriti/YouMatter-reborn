function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getGuardianVerificationTemplate({ guardianName, userName, verificationUrl }) {
  const cleanGuardian = escapeHtml(guardianName || 'Trusted Contact');
  const cleanUser = escapeHtml(userName || 'A user');
  const cleanUrl = escapeHtml(verificationUrl);

  return {
    subject: 'YouMatter - Trusted Contact Verification',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .logo { font-size: 24px; font-weight: 900; color: #8b5cf6; margin-bottom: 24px; }
          .h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; }
          .p { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
          .btn { display: inline-block; background-color: #8b5cf6; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 16px; font-size: 14px; margin-top: 10px; margin-bottom: 20px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">YouMatter</div>
          <h1 class="h1">Verify Your Email Address</h1>
          <p class="p">Hello ${cleanGuardian},</p>
          <p class="p"><strong>${cleanUser}</strong> has listed you as their designated Trusted Contact / Guardian on the <strong>YouMatter</strong> wellness platform.</p>
          <p class="p">To verify your email address and confirm your consent preferences to receive safety alerts if ${cleanUser} experiences a high-stress moment, please click the button below:</p>
          <a href="${cleanUrl}" class="btn" target="_blank">Verify Trusted Contact Email</a>
          <p class="p">If you did not request or expect this invitation, you can safely ignore this email.</p>
          <div class="footer">
            YouMatter Safety & Protection Engine · Automated System Notification
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

export function getHighRiskAlertTemplate({ guardianName, userName, timestamp }) {
  const cleanGuardian = escapeHtml(guardianName || 'Trusted Contact');
  const cleanUser = escapeHtml(userName || 'Your loved one');
  const dateStr = escapeHtml(new Date(timestamp || Date.now()).toLocaleString());

  return {
    subject: `YouMatter Safety Alert: Check in on ${cleanUser}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fcf4f6; color: #0f172a; margin: 0; padding: 20px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; border: 1px solid #fecdd3; box-shadow: 0 4px 24px rgba(225,29,72,0.08); }
          .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
          .badge { background: #ffe4e6; color: #e11d48; font-weight: 800; font-size: 11px; text-transform: uppercase; padding: 6px 12px; border-radius: 12px; letter-spacing: 1px; }
          .h1 { font-size: 22px; font-weight: 900; color: #9f1239; margin-top: 12px; }
          .p { font-size: 15px; line-height: 1.7; color: #475569; margin-bottom: 18px; }
          .box { background-color: #fff1f2; border-left: 4px solid #e11d48; padding: 18px; border-radius: 12px; margin: 20px 0; }
          .box-title { font-weight: 800; color: #9f1239; margin-bottom: 6px; font-size: 14px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Safety Alert Notification</div>
          <h1 class="h1">Gentle Check-In Recommended for ${cleanUser}</h1>
          <p class="p">Hello ${cleanGuardian},</p>
          <p class="p">You are receiving this automated safety notification because you are listed as a verified Trusted Contact for <strong>${cleanUser}</strong> on YouMatter.</p>
          
          <div class="box">
            <div class="box-title">Incident Alert Summary</div>
            <div style="font-size: 13px; color: #475569;">
              Time Detected: <strong>${dateStr}</strong><br>
              Alert Level: <strong>High-Risk Emotional Support Signal</strong>
            </div>
          </div>

          <p class="p">Our AI safety pipeline detected an indicator of severe emotional distress during a check-in. We recommend gently reaching out to ${cleanUser} to offer your support and presence.</p>
          
          <div class="box" style="background-color: #f8fafc; border-left-color: #8b5cf6;">
            <div class="box-title" style="color: #6d28d9;">Immediate Emergency Helplines (India)</div>
            <div style="font-size: 13px; color: #334155; line-height: 1.6;">
              <strong>Tele-MANAS:</strong> 14416 or 1800 891 4416 (24/7 Toll-Free)<br>
              <strong>KIRAN Mental Health Helpline:</strong> 1800-599-0019 (24/7)
            </div>
          </div>

          <p class="p" style="font-size: 13px; color: #64748b;">
            <em>Note: For privacy and confidentiality protection, raw chat transcripts and personal journal notes are never shared in emails.</em>
          </p>

          <div class="footer">
            YouMatter Crisis Safety Engine · Automated Guardian Notification
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

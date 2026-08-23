import nodemailer from 'nodemailer';

class SMTPProvider {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const secure = process.env.SMTP_SECURE === 'true';
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD;

      if (!user || !pass) {
        console.warn('SMTP warning: SMTP_USER or SMTP_PASSWORD not configured. Emails will run in mock mode.');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000,
      });
    }
    return this.transporter;
  }

  async sendEmail({ to, subject, html, text, fromName, fromEmail }) {
    const fromAddress = fromEmail || process.env.SMTP_FROM_EMAIL || 'no-reply@youmatter.app';
    const senderName = fromName || process.env.SMTP_FROM_NAME || 'YouMatter Safety';
    const from = `"${senderName}" <${fromAddress}>`;

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    // Fallback Mock Mode when SMTP credentials are not yet set in .env
    if (!user || !pass) {
      console.log(`[SMTP MOCK DELIVERY] To: ${to} | Subject: "${subject}"`);
      return {
        success: true,
        mock: true,
        messageId: `mock-msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      };
    }

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      });

      return {
        success: true,
        mock: false,
        messageId: info.messageId,
      };
    } catch (err) {
      console.error('SMTP Delivery Error:', err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async healthCheck() {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        return { status: 'mock_active', message: 'SMTP credentials missing, using mock fallback mode' };
      }
      const transporter = this.getTransporter();
      await transporter.verify();
      return { status: 'healthy', message: 'SMTP connection verified' };
    } catch (err) {
      return { status: 'unhealthy', error: err.message };
    }
  }
}

export default new SMTPProvider();

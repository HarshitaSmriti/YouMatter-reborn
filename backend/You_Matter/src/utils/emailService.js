import nodemailer from "nodemailer";
import { resolve4 } from "dns/promises";
import axios from "axios";

const createSmtpTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: { user, pass },
  });
};

const escapeHtml = (value = "") =>
  value
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const sendCrisisEmail = async (
  guardianEmail,
  userName,
  message
) => {
  if (!guardianEmail) {
    throw new Error("Guardian email is missing");
  }

  if (process.env.CRISIS_EMAIL_WEBHOOK_URL) {
    const response = await axios.post(
      process.env.CRISIS_EMAIL_WEBHOOK_URL,
      {
        to: guardianEmail,
        userName,
        message,
        subject: "Urgent Mental Health Alert",
      },
      { timeout: 15000 }
    );

    console.log("Crisis email webhook sent:", response.status);
    return response.data;
  }

  const mailOptions = {
    from: `"YouMatter Support" <${process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@youmatter.ai"}>`,
    to: guardianEmail,
    subject: "Urgent Mental Health Alert",
    html: `
      <h2>Crisis Alert</h2>

      <p>${escapeHtml(userName)} may be experiencing emotional distress.</p>

      <p><strong>Detected Message:</strong></p>

      <blockquote>${escapeHtml(message)}</blockquote>

      <p>Please check on them immediately.</p>
    `,
  };

  const transporter = createSmtpTransporter();
  const info = await transporter.sendMail(mailOptions);
  console.log("Crisis email sent successfully to:", guardianEmail);
  return info;
};

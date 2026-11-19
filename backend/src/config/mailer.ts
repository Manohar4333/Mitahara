import nodemailer from 'nodemailer';
import { ENV } from './env.js';

let transporter: nodemailer.Transporter | null = null;

export const getMailerTransporter = (): nodemailer.Transporter => {
  if (!transporter) {
    if (ENV.SMTP_PASS && ENV.SMTP_PASS.trim() !== '') {
      transporter = nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: ENV.SMTP_PORT === 465,
        auth: {
          user: ENV.SMTP_USER,
          pass: ENV.SMTP_PASS,
        },
      });
      console.log(`Configured Nodemailer with live SMTP server: ${ENV.SMTP_HOST}:${ENV.SMTP_PORT} (${ENV.SMTP_USER})`);
    } else {
      // In development mode when SMTP_PASS is not provided, use a JSON mock transporter
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      console.log(`Nodemailer running in development/safe mode (no SMTP_PASS provided). Emails will be logged to console.`);
    }
  }
  return transporter;
};

export const sendMail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> => {
  try {
    const transport = getMailerTransporter();
    const mailOptions = {
      from: ENV.SMTP_FROM || ENV.SMTP_USER,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    };

    const info = await transport.sendMail(mailOptions);

    if (!ENV.SMTP_PASS || ENV.SMTP_PASS.trim() === '') {
      console.log('----------------------------------------------------');
      console.log(`[EMAIL DISPATCH SIMULATION]`);
      console.log(`To: ${to}`);
      console.log(`From: ${mailOptions.from}`);
      console.log(`Subject: ${subject}`);
      if (text) console.log(`Content:\n${text}`);
      console.log('----------------------------------------------------');
    } else {
      console.log(`Email dispatched to ${to} (MessageID: ${info.messageId})`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};

const nodemailer = require('nodemailer');

let mailer = null;
function getMailer() {
  if (mailer) return mailer;
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return mailer;
}

let twilioClient = null;
function getTwilio() {
  if (twilioClient) return twilioClient;
  if (!process.env.TWILIO_SID || !process.env.TWILIO_TOKEN) return null;
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
  return twilioClient;
}

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER) {
    console.log('[notify:email:skipped]', subject, '->', to);
    return;
  }
  const info = await getMailer().sendMail({
    from: '"Maharshi Medical" <' + process.env.SMTP_USER + '>',
    to: to || process.env.NOTIFY_EMAIL,
    subject, html, text,
  });
  console.log('[notify:email:sent]', info.messageId);
}

async function sendSMS({ to, body }) {
  const client = getTwilio();
  if (!client) {
    console.log('[notify:sms:skipped]', body);
    return;
  }
  const msg = await client.messages.create({
    from: process.env.TWILIO_FROM,
    to: to || process.env.NOTIFY_PHONE,
    body,
  });
  console.log('[notify:sms:sent]', msg.sid);
}

module.exports = { sendEmail, sendSMS };
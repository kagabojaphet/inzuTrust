require('dotenv').config();
const { transporter } = require('./services/emailService');

async function run() {
  try {
    await transporter.verify();
    console.log('SMTP verified — ready to send');

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'inzuTrust Test Email',
      text: 'This is a test email from inzuTrust. If you receive it, SMTP is working.',
    });

    console.log('Email sent:', info && (info.response || info.messageId) );
  } catch (err) {
    console.error('Email test failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

run();

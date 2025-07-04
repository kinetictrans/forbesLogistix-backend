// utils/sendEmailWithPDF.js
const nodemailer = require('nodemailer');

// 📨 hard-coded recipients (comma-separated string or array)
const CLIENT_EMAILS = 'chase.forbes@forbeslogistix.com, recruiting@forbeslogistix.com';

module.exports = async function sendEmailWithPDF(pdfBuffer) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing EMAIL_USER or EMAIL_PASS in environment variables.');
  }
  console.log('📨 Sending email to:', CLIENT_EMAILS);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: CLIENT_EMAILS,        // ← hard-coded
      subject: 'New Driver Application Submission',
      text: 'Attached is the latest driver application form.',
      attachments: [{ filename: 'application.pdf', content: pdfBuffer }],
    });

    console.log('✅ Email sent, ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
// utils/sendEmailWithPDF.js
const nodemailer = require('nodemailer');

module.exports = async function sendEmailWithPDF(pdfBuffer) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error('Missing EMAIL_USER or EMAIL_PASS in environment variables.');
    }
    if (!process.env.CLIENT_RECEIVER_EMAIL) {
          throw new Error('Missing CLIENT_RECEIVER_EMAIL in environment variables.');
    }

    const recipient = process.env.CLIENT_RECEIVER_EMAIL;
    console.log('Sending email to:', recipient);

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
                  to: recipient,
                  subject: 'New Driver Application Submission',
                  text: 'Attached is the latest driver application form.',
                  attachments: [{ filename: 'application.pdf', content: pdfBuffer }],
          });
          console.log('Email sent, ID:', info.messageId);
    } catch (error) {
          console.error('Error sending email:', error);
          throw error;
    }
};

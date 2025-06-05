const nodemailer = require('nodemailer');

module.exports = async function sendEmailWithPDF(pdfBuffer, recipientEmail) {
  // Check for environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing EMAIL_USER or EMAIL_PASS in environment variables.');
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'New Driver Application Submission',
      text: 'Attached is the latest driver application form.',
      attachments: [
        {
          filename: 'application.pdf',
          content: pdfBuffer,
        },
      ],
    });

    console.log('✅ Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
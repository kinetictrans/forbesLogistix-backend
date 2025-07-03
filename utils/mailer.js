const nodemailer = require('nodemailer');

module.exports = async function sendEmailWithPDF(pdfBuffer) {
  // Check for environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.CLIENT_RECEIVER_EMAIL) {
    throw new Error('Missing EMAIL_USER, EMAIL_PASS, or CLIENT_RECEIVER_EMAIL in environment variables.');
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
      to: process.env.CLIENT_RECEIVER_EMAIL, // Can be one or more emails (comma-separated)
      subject: 'New Driver Application Submission',
      text: 'Attached is the latest driver application form.',
      attachments: [
        {
          filename: 'application.pdf',
          content: pdfBuffer,
        },
      ],
    });

    console.log('✅ Email sent to:', process.env.CLIENT_RECEIVER_EMAIL);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
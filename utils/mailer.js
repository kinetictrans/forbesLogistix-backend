const nodemailer = require('nodemailer');

module.exports = async function sendEmailWithPDF(pdfBuffer, recipientEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
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
};
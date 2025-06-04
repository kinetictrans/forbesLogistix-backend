const pdfGenerator = require('../utils/pdfGenerator');
const nodemailer = require('nodemailer');

exports.sendPDF = async (req, res) => {
  try {
    const formData = req.body;

    // generate the PDF (in-memory)
    const pdfBuffer = await pdfGenerator(formData);

    // send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: formData.personalEmail || 'moominaik@gmail.com',
      subject: 'Driver Application Submitted',
      text: 'Attached is the completed application form.',
      attachments: [
        {
          filename: 'Application.pdf',
          content: pdfBuffer
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'PDF generated and email sent successfully.' });

  } catch (error) {
    console.error('Error sending PDF:', error);
    res.status(500).json({ message: 'Failed to generate or send PDF.' });
  }
};
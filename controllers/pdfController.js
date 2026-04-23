const pdfGenerator = require('../utils/pdfGenerator');
const { sendViaGraph } = require('../utils/graphMailer');

exports.sendPDF = async (req, res) => {
  try {
    const formData = req.body;

    if (!formData) {
      return res.status(400).json({ message: 'No form data received.' });
    }

    // Generate the PDF in memory
    const pdfBuffer = await pdfGenerator(formData);

    // Validate required environment variables
    if (!process.env.CLIENT_RECEIVER_EMAIL) {
      return res.status(500).json({ message: 'Missing CLIENT_RECEIVER_EMAIL in environment variables.' });
    }

    // Send the email via Microsoft Graph
    await sendViaGraph({
      to: process.env.CLIENT_RECEIVER_EMAIL,
      subject: 'New Driver Application Submission',
      text: 'Attached is the latest driver application form.',
      attachments: [
        { filename: 'Application.pdf', content: pdfBuffer, contentType: 'application/pdf' }
      ]
    });
    console.log('Email sent to:', process.env.CLIENT_RECEIVER_EMAIL);

    return res.status(200).json({ message: 'PDF generated and email sent successfully.' });
  } catch (error) {
    console.error('Error sending PDF:', error);
    return res.status(500).json({ message: 'Failed to generate or send PDF.', error: error.message });
  }
};

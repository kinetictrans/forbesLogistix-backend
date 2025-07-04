const sendEmailWithPDF = require('../utils/sendEmailWithPDF');

exports.sendPDF = async (req, res) => {
  try {
    const { pdfData } = req.body;

    if (!pdfData) {
      return res.status(400).json({ message: 'PDF data is required' });
    }

    const buffer = Buffer.from(pdfData.split(',')[1], 'base64');

    console.log("✅ CLIENT_RECEIVER_EMAIL from env:", process.env.CLIENT_RECEIVER_EMAIL);

    await sendEmailWithPDF(buffer, process.env.CLIENT_RECEIVER_EMAIL);

    res.status(200).json({ message: 'PDF sent via email successfully' });
  } catch (error) {
    console.error('❌ Failed to send PDF:', error);
    res.status(500).json({ message: 'Failed to send PDF' });
  }
};
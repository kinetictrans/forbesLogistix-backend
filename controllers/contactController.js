const nodemailer = require('nodemailer');

exports.sendContact = async (req, res) => {
    try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: 'Missing email credentials in environment variables.' });
    }
    if (!process.env.CONTACT_RECEIVER_EMAIL) {
      return res.status(500).json({ message: 'Missing CONTACT_RECEIVER_EMAIL in environment variables.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
          },
    });

    const safe = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

    await transporter.sendMail({
            from: `"Forbes Logistix Website" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL,
                    replyTo: email,
                    subject: `New contact form message from ${name}`,
                    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                    html: `<p><strong>Name:</strong> ${safe(name)}</p><p><strong>Email:</strong> ${safe(email)}</p><p><strong>Message:</strong></p><p>${safe(message).replace(/\n/g, '<br>')}</p>`,
      });

    console.log('Contact email sent to:', process.env.CONTACT_RECEIVER_EMAIL);
    return res.status(200).json({ message: 'Message sent successfully.' });
} catch (error) {
    console.error('Error sending contact email:', error);
    return res.status(500).json({ message: 'Failed to send message.', error: error.message });
}
};

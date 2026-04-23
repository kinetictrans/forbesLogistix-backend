const { sendViaGraph } = require('../utils/graphMailer');

// Conservative field length caps for the contact form.
const MAX_NAME = 100;
const MAX_EMAIL = 254; // RFC 5321
const MAX_MESSAGE = 5000;

// Pragmatic email regex -- catches obvious malformed input without being a full RFC parser.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.sendContact = async (req, res) => {
    try {
          const { name, email, message } = req.body || {};

      if (!name || !email || !message) {
              return res.status(400).json({ message: 'Name, email, and message are required.' });
      }

      if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
              return res.status(400).json({ message: 'Invalid field types.' });
      }

      const trimmedName = name.trim();
          const trimmedEmail = email.trim();
          const trimmedMessage = message.trim();

      if (!trimmedName || !trimmedEmail || !trimmedMessage) {
              return res.status(400).json({ message: 'Name, email, and message are required.' });
      }

      if (trimmedName.length > MAX_NAME) {
              return res.status(400).json({ message: `Name must be ${MAX_NAME} characters or fewer.` });
      }
          if (trimmedEmail.length > MAX_EMAIL) {
                  return res.status(400).json({ message: `Email must be ${MAX_EMAIL} characters or fewer.` });
          }
          if (trimmedMessage.length > MAX_MESSAGE) {
                  return res.status(400).json({ message: `Message must be ${MAX_MESSAGE} characters or fewer.` });
          }

      if (!EMAIL_REGEX.test(trimmedEmail)) {
              return res.status(400).json({ message: 'Please provide a valid email address.' });
      }

      if (!process.env.CONTACT_RECEIVER_EMAIL) {
              console.error('Missing CONTACT_RECEIVER_EMAIL in environment variables.');
              return res.status(500).json({ message: 'Server configuration error.' });
      }

      const safe = (s) =>
              String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

      await sendViaGraph({
              to: process.env.CONTACT_RECEIVER_EMAIL,
              replyTo: trimmedEmail,
              subject: `New contact form message from ${trimmedName}`,
              text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`,
              html:
                        `<p><strong>Name:</strong> ${safe(trimmedName)}</p>` +
                        `<p><strong>Email:</strong> ${safe(trimmedEmail)}</p>` +
                        `<p><strong>Message:</strong><br/>${safe(trimmedMessage).replace(/\n/g, '<br/>')}</p>`,
      });

      return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
          console.error('Error sending contact email:', error);
          return res.status(500).json({ message: 'Failed to send message.' });
    }
};

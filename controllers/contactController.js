const { sendViaGraph } = require('../utils/graphMailer');

// Conservative field length caps for the contact form.
const MAX_NAME = 100;
const MAX_EMAIL = 254; // RFC 5321
const MAX_MESSAGE = 5000;

// Pragmatic email regex -- catches obvious malformed input without being a full RFC parser.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Optional Cloudflare Turnstile verification. If TURNSTILE_SECRET is unset, verification
// is skipped so the endpoint stays functional until the site key is provisioned.
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstile(token, remoteIp) {
    if (!TURNSTILE_SECRET) {
        return { ok: true, skipped: true };
    }
    if (!token || typeof token !== 'string') {
        return { ok: false, reason: 'missing-token' };
    }
    try {
        const params = new URLSearchParams();
        params.append('secret', TURNSTILE_SECRET);
        params.append('response', token);
        if (remoteIp) params.append('remoteip', remoteIp);

        const resp = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            body: params,
        });
        const data = await resp.json();
        return { ok: data && data.success === true };
    } catch (err) {
        console.error('Turnstile verification error:', err.message);
        return { ok: false, reason: 'verify-failed' };
    }
}

exports.sendContact = async (req, res) => {
    try {
        const { name, email, message, turnstileToken } = req.body || {};

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

        const verify = await verifyTurnstile(turnstileToken, req.ip);
        if (!verify.ok) {
            return res.status(400).json({ message: 'Verification failed. Please try again.' });
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

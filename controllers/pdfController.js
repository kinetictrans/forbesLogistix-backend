const pdfGenerator = require('../utils/pdfGenerator');
const { sendViaGraph } = require('../utils/graphMailer');

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

exports.sendPDF = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return res.status(400).json({ message: 'Invalid form data.' });
        }

        // Honeypot — bots fill every field including hidden ones.
        if (body.honeypot) {
            return res.status(200).json({ message: 'OK' });
        }

        const { turnstileToken, ...formData } = body;

        const verify = await verifyTurnstile(turnstileToken, req.ip);
        if (!verify.ok) {
            return res.status(400).json({ message: 'Verification failed. Please try again.' });
        }

        if (!process.env.CLIENT_RECEIVER_EMAIL) {
            console.error('Missing CLIENT_RECEIVER_EMAIL in environment variables.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const pdfBuffer = await pdfGenerator(formData);

        await sendViaGraph({
            to: process.env.CLIENT_RECEIVER_EMAIL,
            subject: 'New Driver Application Submission',
            text: 'Attached is the latest driver application form.',
            attachments: [
                { filename: 'Application.pdf', content: pdfBuffer, contentType: 'application/pdf' },
            ],
        });

        return res.status(200).json({ message: 'PDF generated and email sent successfully.' });
    } catch (error) {
        console.error('Error sending PDF:', error);
        return res.status(500).json({ message: 'Failed to generate or send PDF.' });
    }
};

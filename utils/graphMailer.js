// utils/graphMailer.js
// Sends email via Microsoft Graph REST API using OAuth2 client-credentials.
// Uses native fetch (Node 18+) — no extra npm packages required.
//
// Required env vars:
//   GRAPH_TENANT_ID   - Azure AD directory (tenant) ID
//   GRAPH_CLIENT_ID   - Azure AD app (client) ID
//   GRAPH_CLIENT_SECRET - Client secret value
//   GRAPH_SENDER      - UPN of the licensed sender mailbox (e.g. noreply@forbeslogistix.com)

async function getAccessToken() {
  const { GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET } = process.env;
  if (!GRAPH_TENANT_ID || !GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET) {
    throw new Error('Missing Graph credentials: check GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET');
  }

  const url = `https://login.microsoftonline.com/${GRAPH_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: GRAPH_CLIENT_ID,
    client_secret: GRAPH_CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
  });

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Token request failed (${resp.status}): ${err}`);
  }

  const data = await resp.json();
  return data.access_token;
}

/**
 * Send an email via Microsoft Graph as GRAPH_SENDER.
 *
 * @param {Object} opts
 * @param {string|string[]} opts.to       Recipient address(es)
 * @param {string}          opts.subject  Subject line
 * @param {string}          [opts.text]   Plain-text body
 * @param {string}          [opts.html]   HTML body (takes priority over text)
 * @param {string}          [opts.replyTo] Reply-To address
 * @param {Array}           [opts.attachments] [{filename, content, contentType}]
 */
async function sendViaGraph({ to, subject, text, html, replyTo, attachments }) {
  const sender = process.env.GRAPH_SENDER;
  if (!sender) throw new Error('Missing GRAPH_SENDER environment variable');

  const token = await getAccessToken();
  const recipients = Array.isArray(to) ? to : [to];

  const message = {
    subject: subject || '(no subject)',
    body: {
      contentType: html ? 'HTML' : 'Text',
      content: html || text || '',
    },
    toRecipients: recipients.map((addr) => ({ emailAddress: { address: addr } })),
  };

  if (replyTo) {
    message.replyTo = [{ emailAddress: { address: replyTo } }];
  }

  if (Array.isArray(attachments) && attachments.length > 0) {
    message.attachments = attachments.map((a) => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: a.filename,
      contentType: a.contentType || 'application/octet-stream',
      contentBytes: Buffer.isBuffer(a.content)
        ? a.content.toString('base64')
        : Buffer.from(a.content).toString('base64'),
    }));
  }

  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, saveToSentItems: false }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Graph sendMail failed (${resp.status}): ${err}`);
  }
}

module.exports = { sendViaGraph };

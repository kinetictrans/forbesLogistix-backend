// utils/graphMailer.js
// Centralized Microsoft Graph mailer using client-credentials OAuth2.
// Requires:
//   - An Azure AD app registration with Mail.Send (Application) permission granted
//   - Admin consent granted in the tenant
//   - An Application Access Policy scoping the app to the sender mailbox only
//
// Env vars consumed:
//   GRAPH_TENANT_ID      Azure AD tenant (directory) ID
//   GRAPH_CLIENT_ID      Azure AD app (client) ID
//   GRAPH_CLIENT_SECRET  Client secret value for the app
//   GRAPH_SENDER         UPN of the sender mailbox (e.g. noreply@forbeslogistix.com)

const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

let cachedClient = null;

function getGraphClient() {
  if (cachedClient) return cachedClient;

  const { GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET } = process.env;
  if (!GRAPH_TENANT_ID || !GRAPH_CLIENT_ID || !GRAPH_CLIENT_SECRET) {
    throw new Error(
      'Missing Graph credentials. Set GRAPH_TENANT_ID, GRAPH_CLIENT_ID, and GRAPH_CLIENT_SECRET.'
    );
  }

  const credential = new ClientSecretCredential(
    GRAPH_TENANT_ID,
    GRAPH_CLIENT_ID,
    GRAPH_CLIENT_SECRET
  );

  cachedClient = Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      },
    },
  });

  return cachedClient;
}

/**
 * Send an email via Microsoft Graph as the configured sender (GRAPH_SENDER).
 *
 * @param {Object} opts
 * @param {string|string[]} opts.to        One or more recipient addresses
 * @param {string}          opts.subject   Email subject
 * @param {string}          [opts.text]    Plain-text body
 * @param {string}          [opts.html]    HTML body (preferred over text if both given)
 * @param {string}          [opts.replyTo] Reply-To address
 * @param {Array<{filename: string, content: Buffer|string, contentType?: string}>} [opts.attachments]
 */
async function sendViaGraph({ to, subject, text, html, replyTo, attachments }) {
  const sender = process.env.GRAPH_SENDER;
  if (!sender) {
    throw new Error('Missing GRAPH_SENDER environment variable.');
  }

  const client = getGraphClient();
  const recipients = Array.isArray(to) ? to : [to];

  const message = {
    subject: subject || '',
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

  await client
    .api(`/users/${encodeURIComponent(sender)}/sendMail`)
    .post({ message, saveToSentItems: false });
}

module.exports = { sendViaGraph };

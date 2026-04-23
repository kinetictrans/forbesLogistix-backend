// utils/mailer.js
// Retained for backward compatibility — email sending now routes through
// utils/graphMailer.js (Microsoft Graph + OAuth2 client-credentials flow).
const { sendViaGraph } = require('./graphMailer');

module.exports = sendViaGraph;

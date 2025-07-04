// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const { sendPDF } = require('../controllers/pdfController');

// Handle CORS pre-flight requests for this endpoint (optional but tidy)
router.options('/send-pdf', (_req, res) => res.sendStatus(204));

/**
 * POST /api/send-pdf
 * Body: { pdfData: 'data:application/pdf;base64,......' }
 * The controller converts the base64, generates the PDF buffer,
 * and emails it to process.env.CLIENT_RECEIVER_EMAIL.
 */
router.post('/send-pdf', sendPDF);

module.exports = router;
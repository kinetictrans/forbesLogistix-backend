// SCAFFOLDING: not currently called by any frontend form. See
// controllers/pdfController.js for the full note. Reactivated when the
// full DOT driver application form is built.

const express = require('express');
const router = express.Router();
const { sendPDF } = require('../controllers/pdfController');

router.post('/send-pdf', sendPDF);

module.exports = router;

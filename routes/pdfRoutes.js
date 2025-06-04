const express = require('express');
const router = express.Router();
const { sendPDF } = require('../controllers/pdfController');



router.post('/send-pdf', sendPDF);

module.exports = router;
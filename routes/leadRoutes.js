const express = require('express');
const router = express.Router();
const { sendLead } = require('../controllers/leadController');

router.post('/lead', sendLead);

module.exports = router;

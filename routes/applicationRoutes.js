const express = require('express');
const router = express.Router();
const Application = require('../models/application');

// POST /api/applications — Submit form
router.post('/', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully', id: application._id });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications — (Optional for admin retrieval/testing)
router.get('/', async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
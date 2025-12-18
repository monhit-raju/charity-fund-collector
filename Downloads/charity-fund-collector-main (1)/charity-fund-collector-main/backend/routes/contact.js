const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) return res.status(400).json({ message: 'Missing fields' });

  try {
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.json({ ok: true, contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all contacts (admin only)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

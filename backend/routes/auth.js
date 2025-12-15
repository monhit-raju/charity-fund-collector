const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user exists
router.get('/', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    res.send(user ? 'Login' : 'Register');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Register
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ 
      email: email.toLowerCase(), 
      password: hashed,
      logs: [new Date().toLocaleString()]
    });
    await user.save();

    res.json({ message: 'Registration successful', userId: user.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login/Auth
router.post('/auth', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).send('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    // Update login logs
    user.lastLogin = new Date();
    user.logs.push(new Date().toLocaleString());
    await user.save();

    res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user logs
router.get('/getLogs', async (req, res) => {
  const { email } = req.query;
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const authEmail = credentials[0];
    const authPassword = credentials[1];

    const user = await User.findOne({ email: authEmail.toLowerCase() });
    if (!user) return res.status(401).send('Unauthorized');

    const isMatch = await bcrypt.compare(authPassword, user.password);
    if (!isMatch) return res.status(401).send('Unauthorized');

    if (email && email.toLowerCase() === authEmail.toLowerCase()) {
      const lastLogin = user.logs[user.logs.length - 2] || 'First login';
      res.send(lastLogin);
    } else {
      res.status(403).send('Forbidden');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

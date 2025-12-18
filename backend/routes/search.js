const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donation = require('../models/Donation');

// Basic auth middleware
const basicAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const email = credentials[0];
    const password = credentials[1];

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).send('Unauthorized');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Unauthorized');

    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Get all donations summary for admin
router.get('/allDonations', basicAuth, async (req, res) => {
  try {
    const donations = await Donation.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$email',
          orderIds: { $push: '$orderId' },
          amounts: { $push: '$amount' },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get user donations and info
router.get('/donations', basicAuth, async (req, res) => {
  const { email } = req.query;
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send('User not found');

    const donations = await Donation.find({ 
      email: email.toLowerCase(), 
      status: 'completed' 
    }).select('orderId amount date');

    const userInfo = {
      totalAmount: user.totalAmount || 0,
      isEnabled: user.isEnabled !== false,
      logs: user.logs || []
    };

    const response = [userInfo, ...donations];
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Search users by email pattern
router.get('/:query', basicAuth, async (req, res) => {
  const { query } = req.params;
  
  try {
    const users = await User.find({
      email: { $regex: query, $options: 'i' }
    }).select('email').limit(10);
    
    const emails = users.map(user => user.email);
    res.json(emails);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Donation = require('../models/Donation');
const User = require('../models/User');

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

// Get Razorpay key
router.get('/', async (req, res) => {
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

    res.json({ key: process.env.RAZORPAY_KEY_ID || 'test_key' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create payment order
router.post('/pay', async (req, res) => {
  console.log('Donation request received:', req.body);
  const { name, amount } = req.body;
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    console.log('No authorization header');
    return res.status(401).send('Unauthorized');
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const email = credentials[0];
    const password = credentials[1];
    console.log('Authenticating user:', email);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).send('Unauthorized');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).send('Unauthorized');
    }

    console.log('User authenticated, creating donation');
    
    // For testing without Razorpay
    const mockOrder = {
      amount: Number(amount) * 100,
      id: `test_order_${Date.now()}`,
      currency: 'INR'
    };
    
    const donation = new Donation({ 
      name, 
      email: email.toLowerCase(), 
      amount: Number(amount), 
      orderId: mockOrder.id, 
      status: 'completed',
      date: new Date().toLocaleDateString()
    });
    
    await donation.save();
    console.log('Donation saved:', donation);
    
    // Update user's total amount
    user.totalAmount = (user.totalAmount || 0) + Number(amount);
    await user.save();
    console.log('User total updated:', user.totalAmount);
    
    return res.json(mockOrder);
  } catch (err) {
    console.error('Donation error:', err);
    res.status(500).json({ message: 'Could not create order', error: err.message });
  }
});

// Verify payment
router.post('/pay/verify', async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
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

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (generated_signature !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const donation = await Donation.findOne({ orderId });
    if (!donation) return res.status(404).send('Donation not found');

    donation.paymentId = paymentId;
    donation.signature = signature;
    donation.status = 'completed';
    await donation.save();

    // Update user's total donation amount
    user.totalAmount += donation.amount;
    await user.save();

    res.send('updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

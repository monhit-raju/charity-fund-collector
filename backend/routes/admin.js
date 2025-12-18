const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Contact = require('../models/Contact');

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const ADMIN_EMAIL = 'raju@gmail.com';
  const ADMIN_PASSWORD = '12345678';
  
  if (email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
    res.json({ 
      message: 'Admin login successful', 
      admin: { email: ADMIN_EMAIL, role: 'admin' } 
    });
  } else {
    res.status(401).send('Invalid admin credentials');
  }
});

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get user by ID
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { name, isEnabled, totalAmount } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, isEnabled, totalAmount },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).send('User not found');
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send('User not found');
    
    // Also delete user's donations
    await Donation.deleteMany({ email: user.email });
    
    res.json({ message: 'User and associated donations deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Enable/Disable user
router.patch('/users/:id/toggle', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    
    user.isEnabled = !user.isEnabled;
    await user.save();
    
    res.json({ 
      message: `User ${user.isEnabled ? 'enabled' : 'disabled'} successfully`, 
      user: { id: user._id, email: user.email, isEnabled: user.isEnabled }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ===== DONATION MANAGEMENT =====

// Get all donations
router.get('/donations', adminAuth, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get donation by ID
router.get('/donations/:id', adminAuth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).send('Donation not found');
    res.json(donation);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update donation status
router.patch('/donations/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).send('Invalid status');
    }
    
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!donation) return res.status(404).send('Donation not found');
    res.json({ message: 'Donation status updated successfully', donation });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete donation
router.delete('/donations/:id', adminAuth, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).send('Donation not found');
    
    // Update user's total amount if donation was completed
    if (donation.status === 'completed') {
      await User.findOneAndUpdate(
        { email: donation.email },
        { $inc: { totalAmount: -donation.amount } }
      );
    }
    
    res.json({ message: 'Donation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ===== CONTACT MANAGEMENT =====

// Get all contacts
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get contact by ID
router.get('/contacts/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete contact
router.delete('/contacts/:id', adminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).send('Contact not found');
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Mark contact as read/unread
router.patch('/contacts/:id/read', adminAuth, async (req, res) => {
  try {
    const { isRead } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );
    
    if (!contact) return res.status(404).send('Contact not found');
    res.json({ message: 'Contact status updated successfully', contact });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ===== ANALYTICS & REPORTS =====

// Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isEnabled: true });
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalContacts = await Contact.countDocuments();
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    
    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      donations: {
        total: totalDonations,
        pending: pendingDonations,
        totalAmount: totalAmount[0]?.total || 0
      },
      contacts: {
        total: totalContacts
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Get recent activities
router.get('/activities', adminAuth, async (req, res) => {
  try {
    const recentDonations = await Donation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email amount status createdAt');
    
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject createdAt');
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email name createdAt');
    
    res.json({
      recentDonations,
      recentContacts,
      recentUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Bulk operations
router.post('/bulk/delete-users', adminAuth, async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
      return res.status(400).send('userIds must be an array');
    }
    
    const users = await User.find({ _id: { $in: userIds } });
    const emails = users.map(user => user.email);
    
    await User.deleteMany({ _id: { $in: userIds } });
    await Donation.deleteMany({ email: { $in: emails } });
    
    res.json({ message: `${userIds.length} users and their donations deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
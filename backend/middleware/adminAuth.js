const bcrypt = require('bcryptjs');

// Admin credentials - only one admin allowed
const ADMIN_EMAIL = 'raju@gmail.com';
const ADMIN_PASSWORD = '12345678';

const adminAuth = async (req, res, next) => {
  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    return res.status(401).send('Unauthorized - Admin access required');
  }

  try {
    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
    const email = credentials[0];
    const password = credentials[1];

    // Check if credentials match admin
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return res.status(403).send('Forbidden - Invalid admin credentials');
    }

    req.admin = { email: ADMIN_EMAIL };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = adminAuth;
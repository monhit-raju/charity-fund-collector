require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const contactRoutes = require('./routes/contact');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

// API routes matching frontend expectations
app.use('/api/v1/registration', authRoutes);
app.use('/api/v1/donate', donationRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

if (process.env.MONGO_URI) {
  // log host part for debugging (mask credentials)
  try {
    const uri = process.env.MONGO_URI;
    const masked = uri.replace(/:(.*)@/, ':***@');
    console.log('MONGO_URI (masked):', masked);
    const host = (new URL(uri.replace('mongodb+srv://', 'https://'))).host;
    console.log('Parsed host:', host);
  } catch (e) {
    console.warn('Could not parse MONGO_URI for debugging:', e.message);
  }
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error', err);
      // Common resolution hints depending on error
      const msg = (err && err.message) ? err.message : '';
      if (msg.includes('ENOTFOUND') || msg.includes('querySrv')) {
        console.error('Hint: DNS/SRV lookup failed — check MONGO_URI hostname or SRV record, and ensure your password has special characters URL-encoded (e.g., @ → %40).');
      }
      if (msg.includes('whitelist') || msg.includes('ReplicaSetNoPrimary')) {
        console.error('Hint: Atlas may be blocking access from your current IP — add your public IP to the Atlas Project Network Access (IP Access List) or add 0.0.0.0/0 for testing.');
      }
      process.exit(1);
    });
} else {
  console.warn('MONGO_URI not set — running without DB connection');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;

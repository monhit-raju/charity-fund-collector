const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  orderId: { type: String },
  paymentId: { type: String },
  signature: { type: String },
  status: { type: String, default: 'pending' }, // pending, completed, failed
  date: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);

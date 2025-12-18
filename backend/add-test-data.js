require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const User = require('./models/User');
const Donation = require('./models/Donation');
const bcrypt = require('bcryptjs');

async function addTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Add test contacts
    const contacts = [
      {
        name: "John Doe",
        email: "john@example.com",
        subject: "Volunteer Inquiry",
        message: "I would like to volunteer for your charity events."
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        subject: "Donation Question",
        message: "How can I make a monthly donation?"
      },
      {
        name: "Mike Johnson",
        email: "mike@example.com",
        subject: "Partnership",
        message: "Our company wants to partner with your NGO."
      }
    ];

    await Contact.insertMany(contacts);
    console.log('Test contacts added');

    // Add test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testUser = new User({
      email: 'testuser@example.com',
      password: hashedPassword,
      isEnabled: true,
      totalAmount: 500,
      logs: [new Date().toLocaleString()]
    });

    await testUser.save();
    console.log('Test user added');

    // Add test donation
    const testDonation = new Donation({
      name: 'Test User',
      email: 'testuser@example.com',
      amount: 500,
      orderId: 'test_order_123',
      status: 'completed',
      date: new Date().toLocaleDateString()
    });

    await testDonation.save();
    console.log('Test donation added');

    console.log('All test data added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestData();
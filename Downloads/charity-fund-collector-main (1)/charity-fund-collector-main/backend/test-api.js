// Simple API test script
// Run with: node test-api.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAPI() {
  console.log('🧪 Testing Charity NGO Backend API...\n');

  try {
    // Test 1: Check server health
    console.log('1. Testing server health...');
    const health = await axios.get('http://localhost:5000/');
    console.log('✅ Server is running:', health.data);

    // Test 2: Check if user exists
    console.log('\n2. Testing user existence check...');
    const userCheck = await axios.get(`${BASE_URL}/registration?email=test@example.com`);
    console.log('✅ User check response:', userCheck.data);

    // Test 3: Register new user
    console.log('\n3. Testing user registration...');
    try {
      const register = await axios.post(`${BASE_URL}/registration`, {
        email: 'test@example.com',
        password: 'testpassword123'
      });
      console.log('✅ Registration successful:', register.data);
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('ℹ️ User already exists (expected if running multiple times)');
      } else {
        throw err;
      }
    }

    // Test 4: User login
    console.log('\n4. Testing user login...');
    const login = await axios.post(`${BASE_URL}/registration/auth`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Login successful:', login.data);

    // Test 5: Submit contact form
    console.log('\n5. Testing contact form...');
    const contact = await axios.post(`${BASE_URL}/contact`, {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message'
    });
    console.log('✅ Contact form submitted:', contact.data);

    console.log('\n🎉 All basic tests passed!');
    console.log('\nNote: Payment and admin tests require proper authentication and Razorpay setup.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
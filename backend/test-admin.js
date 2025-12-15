// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:5000/api/v1/admin';
const ADMIN_EMAIL = 'raju@gmail.com';
const ADMIN_PASSWORD = '12345678';

// Create Basic Auth header
const auth = Buffer.from(`${ADMIN_EMAIL}:${ADMIN_PASSWORD}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Content-Type': 'application/json'
};

async function testAdmin() {
  try {
    console.log('Testing Admin Login...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login Success:', loginData);

    console.log('\nTesting Admin Stats...');
    const statsResponse = await fetch(`${BASE_URL}/stats`, { headers });
    const statsData = await statsResponse.json();
    console.log('✅ Stats Success:', statsData);

    console.log('\nTesting Get Users...');
    const usersResponse = await fetch(`${BASE_URL}/users`, { headers });
    const usersData = await usersResponse.json();
    console.log('✅ Users Success:', usersData.length, 'users found');

    console.log('\nTesting Get Donations...');
    const donationsResponse = await fetch(`${BASE_URL}/donations`, { headers });
    const donationsData = await donationsResponse.json();
    console.log('✅ Donations Success:', donationsData.length, 'donations found');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdmin();
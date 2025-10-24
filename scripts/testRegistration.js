// Test script to verify registration endpoint
import fetch from 'node-fetch';

const testRegistration = async () => {
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    mobileNo: "1234567890",
    password: "test123",
    role: "Admin"
  };

  try {
    console.log('Testing registration endpoint...');
    console.log('URL: http://localhost:8800/api/auth/register');
    console.log('Data:', testUser);
    
    const response = await fetch('http://localhost:8800/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Registration test successful!');
    } else {
      console.log('❌ Registration test failed!');
    }
  } catch (error) {
    console.error('❌ Error testing registration:', error.message);
  }
};

testRegistration();




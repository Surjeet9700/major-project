const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const sessionId = 'test-email-' + Date.now();

async function setSessionEmail() {
  // Set the session email
  await axios.post(`${BASE_URL}/api/voice/set-email`, {
    sessionId,
    email: 'surjeethkumar4@gmail.com'
  });
  console.log('✅ Session email set');
}

async function completeBooking() {
  // Simulate booking flow
  const bookingDetails = {
    sessionId,
    userInput: 'My name is Surjeet',
    language: 'en'
  };
  await axios.post(`${BASE_URL}/api/voice/conversation-audio`, bookingDetails);
  await axios.post(`${BASE_URL}/api/voice/conversation-audio`, { ...bookingDetails, userInput: 'My phone number is 9876543210' });
  await axios.post(`${BASE_URL}/api/voice/conversation-audio`, { ...bookingDetails, userInput: 'Wedding photography' });
  await axios.post(`${BASE_URL}/api/voice/conversation-audio`, { ...bookingDetails, userInput: '2024-07-01' });
  await axios.post(`${BASE_URL}/api/voice/conversation-audio`, { ...bookingDetails, userInput: '11:00 AM' });
  console.log('✅ Booking flow completed');
}

async function runTest() {
  try {
    await setSessionEmail();
    await completeBooking();
    console.log('✅ Email service test completed. Check backend logs or your inbox.');
  } catch (error) {
    console.error('❌ Email service test failed:', error.message);
  }
}

runTest(); 
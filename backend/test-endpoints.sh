#!/bin/bash

# VoxBiz Backend Testing Script
# Tests all major endpoints and webhook flows

NGROK_URL="https://7ff4-104-28-201-87.ngrok-free.app"

echo "🧪 Starting VoxBiz Backend Tests..."
echo "🌍 Testing URL: $NGROK_URL"
echo ""

# Test 1: Health Check
echo "📊 Test 1: Health Check"
curl -s "$NGROK_URL/health" | jq .
echo ""

# Test 2: Voice Webhook - Incoming Call
echo "📞 Test 2: Voice Webhook - Incoming Call"
curl -s -X POST "$NGROK_URL/api/voice" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B1234567890&To=%2B15077020394"
echo ""
echo ""

# Test 3: Language Selection
echo "🌐 Test 3: Language Selection (English)"
curl -s -X POST "$NGROK_URL/api/language-select" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&SpeechResult=english&Digits=2"
echo ""
echo ""

# Test 4: Create Appointment
echo "📅 Test 4: Create Appointment"
curl -s -X POST "$NGROK_URL/api/appointment" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "phoneNumber": "+9876543210",
    "serviceType": "Technical Support",
    "preferredDate": "2025-06-06",
    "preferredTime": "14:00",
    "notes": "Urgent technical issue"
  }' | jq .
echo ""

# Test 5: Get Services
echo "🛠️  Test 5: Available Services"
curl -s "$NGROK_URL/api/services" | jq .
echo ""

# Test 6: Check Available Slots
echo "⏰ Test 6: Available Time Slots"
curl -s "$NGROK_URL/api/available-slots/2025-06-06" | jq .
echo ""

# Test 7: Order Tracking
echo "📦 Test 7: Order Tracking"
curl -s -X POST "$NGROK_URL/api/track-order" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD123456",
    "phoneNumber": "+9876543210"
  }' | jq .
echo ""

# Test 8: API Status
echo "ℹ️  Test 8: API Status"
curl -s "$NGROK_URL/api/status" | jq .
echo ""

echo "✅ All tests completed!"
echo ""
echo "🔗 Twilio Configuration URLs:"
echo "   Primary Webhook: $NGROK_URL/api/voice"
echo "   Language Select: $NGROK_URL/api/language-select"
echo "   Intent Processing: $NGROK_URL/api/process-intent"
echo "   Booking Handler: $NGROK_URL/api/handle-booking"
echo "   Order Tracking: $NGROK_URL/api/handle-tracking"

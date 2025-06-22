#!/bin/bash

NGROK_URL="https://c778-104-28-201-88.ngrok-free.app"

echo "🔍 Testing Yuva Digital Studio Voice Bot Endpoints..."
echo "=================================================="

echo "1. Testing incoming call endpoint..."
curl -X POST "$NGROK_URL/api/voice" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=CA123456789&From=%2B15551234567" \
  --silent --write-out "\nStatus: %{http_code}\n\n"

echo "2. Testing language selection..."
curl -X POST "$NGROK_URL/api/language-select" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=CA123456789&Digits=1" \
  --silent --write-out "\nStatus: %{http_code}\n\n"

echo "3. Testing business info endpoint..."
curl -X GET "$NGROK_URL/api/business-info" \
  --silent --write-out "\nStatus: %{http_code}\n\n"

echo "4. Testing services endpoint..."
curl -X GET "$NGROK_URL/api/services" \
  --silent --write-out "\nStatus: %{http_code}\n\n"

echo "✅ Test completed!"

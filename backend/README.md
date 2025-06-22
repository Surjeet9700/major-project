# VoxBiz Backend

Voice bot backend for Hindi/English conversational AI with Twilio integration.

## Features

- **Multi-language Support**: Hindi and English voice processing
- **Twilio Integration**: Phone call handling with speech recognition
- **AI/NLP**: Hugging Face integration for intent recognition
- **Business Logic**: Appointment booking and order tracking
- **Database**: MongoDB with Mongoose ODM
- **RESTful API**: Complete API for frontend integration

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Twilio account with phone number
- Hugging Face API token

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, HF_API_TOKEN, etc.

# Build the project
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

```env
PORT=3000
NODE_ENV=development

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_PHONE_NUMBER=your_twilio_number

# OpenRouter AI
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_MODEL=deepseek/deepseek-r1-0528:free
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions

# MongoDB
MONGODB_URI=mongodb://localhost:27017/voxbiz

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key
```

## API Endpoints

### Voice Webhooks (Twilio)
- `POST /api/voice` - Handle incoming calls
- `POST /api/language-select` - Language selection
- `POST /api/process-intent` - Process user intents
- `POST /api/handle-booking` - Appointment booking
- `POST /api/handle-tracking` - Order tracking

### REST API
- `GET /api/appointments/:phone` - Get appointments by phone
- `POST /api/appointment` - Create new appointment
- `GET /api/orders/:phone` - Get orders by phone
- `POST /api/order/track` - Track order
- `GET /api/services` - Get available services
- `GET /api/available-slots/:date` - Get available time slots

### System
- `GET /health` - Health check
- `GET /` - API information

## Voice Flow

1. **Incoming Call** → Welcome message in both languages
2. **Language Selection** → User selects Hindi (1) or English (2)
3. **Main Menu** → Options for booking, tracking, pricing
4. **Intent Processing** → AI processes user speech
5. **Business Logic** → Execute booking/tracking/pricing flows
6. **Response** → Voice response in selected language

## Development

```bash
# Development with auto-restart
npm run dev

# Build TypeScript
npm run build

# Clean build directory
npm run clean
```

## Deployment

1. Set environment variables
2. Run `npm run build`
3. Start with `npm start`
4. Configure Twilio webhooks to your server URL

## Twilio Setup

1. Configure webhook URL: `https://yourdomain.com/api/voice`
2. Set HTTP method: POST
3. Enable speech recognition
4. Configure voice settings

## MongoDB Schema

### Appointments
```javascript
{
  customerName: String,
  phoneNumber: String, 
  serviceType: String,
  appointmentDate: Date,
  status: String,
  createdAt: Date
}
```

### Orders
```javascript
{
  orderNumber: String,
  customerPhone: String,
  items: [String],
  status: String,
  orderDate: Date,
  estimatedDelivery: Date
}
```

## Architecture

```
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── utils/          # Utilities
```

## Technologies

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Voice**: Twilio Voice API
- **AI**: Hugging Face Inference API
- **Languages**: Hindi + English support

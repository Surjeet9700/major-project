import { Router, Request, Response } from 'express';
import { validateTwilioWebhook } from '../middleware/validation';
import { sessionManager } from '../services/sessionManager';
import { asyncHandler } from '../middleware/errorHandler';
import { freeVoiceService } from '../services/freeVoiceService';
import {
  handleIncomingCall,
  handleLanguageSelection,
  handleIntentProcessing,
  handleBooking,
  handleTracking
} from '../controllers/voiceController';

const router = Router();

router.post('/voice', validateTwilioWebhook, handleIncomingCall);
router.post('/language-select', validateTwilioWebhook, handleLanguageSelection);
router.post('/process-intent', validateTwilioWebhook, handleIntentProcessing);
router.post('/handle-booking', validateTwilioWebhook, handleBooking);
router.post('/handle-tracking', validateTwilioWebhook, handleTracking);

// Set email for voice session
router.post('/set-email', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, email } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  console.log('📧 Setting email for session:', { sessionId, email });

  // Store email in free voice service session
  freeVoiceService.setSessionEmail(sessionId, email);

  res.status(200).json({ 
    success: true, 
    message: 'Email set successfully',
    sessionId,
    email: email || 'not provided'
  });
}));

// Voice status callback endpoint
router.post('/voice/status', validateTwilioWebhook, asyncHandler(async (req: Request, res: Response) => {
  const { CallSid, CallStatus, CallDuration, From, To } = req.body;
  
  console.log(`📞 Call Status Update:`, {
    CallSid,
    CallStatus,
    CallDuration,
    From,
    To
  });

  if (CallStatus === 'completed' && CallSid) {
    sessionManager.endSession(CallSid);
  }

  res.status(200).send('OK');
}));

router.get('/status', (req, res) => {
  res.json({
    message: 'Voice API is running',
    endpoints: [
      'POST /api/voice - Handle incoming calls',
      'POST /api/language-select - Handle language selection',
      'POST /api/process-intent - Process user intents',
      'POST /api/handle-booking - Handle appointment booking',
      'POST /api/handle-tracking - Handle order tracking',
      'POST /api/set-email - Set email for voice session'
    ]
  });
});

module.exports = router;
export default router;

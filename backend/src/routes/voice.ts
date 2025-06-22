import { Router, Request, Response } from 'express';
import { validateTwilioWebhook } from '../middleware/validation';
import { sessionManager } from '../services/sessionManager';
import { asyncHandler } from '../middleware/errorHandler';
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
      'POST /api/handle-tracking - Handle order tracking'
    ]
  });
});

module.exports = router;
export default router;

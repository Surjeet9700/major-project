import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const validateTwilioWebhook = (req: Request, res: Response, next: NextFunction) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  
  if (!twilioSignature && config.server.nodeEnv === 'production') {
    return res.status(403).json({ error: 'Forbidden - Invalid Twilio signature' });
  }
  
  next();
};

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
};

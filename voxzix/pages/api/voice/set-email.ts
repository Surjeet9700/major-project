import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, email } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // For now, we'll just log the email and session ID
    // In a real implementation, you would store this in a database
    console.log('📧 Setting email for session:', { sessionId, email });

    // Send the email to the backend for storage
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/voice/set-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        email
      })
    });

    if (backendResponse.ok) {
      console.log('✅ Email stored in backend session');
    } else {
      console.warn('⚠️ Failed to store email in backend:', await backendResponse.text());
    }

    res.status(200).json({ 
      success: true, 
      message: 'Email set successfully',
      sessionId,
      email: email || 'not provided'
    });

  } catch (error) {
    console.error('Error setting email:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 
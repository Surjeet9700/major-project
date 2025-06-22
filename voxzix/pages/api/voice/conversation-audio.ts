import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is required' });
  }

  const { sessionId, userInput } = req.body;

  if (!sessionId || !userInput) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      details: 'sessionId and userInput are required'
    });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('Proxying request to backend:', {
      url: `${backendUrl}/api/voice/conversation-audio`,
      body: req.body,
      method: req.method
    });
    
    const response = await fetch(`${backendUrl}/api/voice/conversation-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    console.log('Backend response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (response.ok) {
      res.json(data);
    } else {
      console.error('Backend error:', data);
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error with conversation-audio:', error);
    res.status(500).json({ 
      error: 'Failed to process conversation with audio',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

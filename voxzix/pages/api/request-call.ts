import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, language = 'en' } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/request-call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        language
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error requesting call:', error);
    res.status(500).json({ 
      error: 'Failed to request call',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

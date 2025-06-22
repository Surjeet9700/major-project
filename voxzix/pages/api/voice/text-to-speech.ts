import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, language = 'en' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/voice/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language
      }),
    });    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(audioBuffer);
    } else {
      const errorData = await response.json();
      res.status(response.status).json(errorData);
    }
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

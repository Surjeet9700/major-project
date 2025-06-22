import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = req.query;

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/audio/${filename}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Audio file not found' });
    }

    // Get the content type from the backend response
    const contentType = response.headers.get('content-type') || 'audio/wav';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Stream the audio file
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.send(buffer);
  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({ 
      error: 'Failed to serve audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

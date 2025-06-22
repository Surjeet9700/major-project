import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = req.query;

  if (!filename || typeof filename !== 'string') {
    return res.status(400).json({ error: 'Filename is required' });
  }
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const audioUrl = `${backendUrl}/api/audio/${filename}`;
    
    const response = await fetch(audioUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Audio file not found' });
    }

    const contentType = response.headers.get('content-type') || 'audio/wav';
    const contentLength = response.headers.get('content-length');
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.status(200).send(buffer);  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to serve audio file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

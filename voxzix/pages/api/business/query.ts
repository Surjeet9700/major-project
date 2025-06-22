import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    
    const response = await fetch(`${backendUrl}/api/business/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('Business query proxy error:', error)
    return res.status(500).json({ 
      error: 'Failed to connect to backend service',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

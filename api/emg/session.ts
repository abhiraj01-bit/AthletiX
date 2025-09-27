import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionData, emgHistory, userId, timestamp } = req.body;
    
    const sessionId = await db.saveEMGSession({
      userId,
      sessionData,
      emgHistory,
      timestamp
    });
    
    res.json({ success: true, sessionId, message: 'EMG session saved to database' });
  } catch (error) {
    console.error('Error saving EMG session:', error);
    res.status(500).json({ error: 'Failed to save EMG session' });
  }
}
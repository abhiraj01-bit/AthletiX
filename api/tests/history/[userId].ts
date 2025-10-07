import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { testType, limit = 20 } = req.query;

    const attempts = await db.getTestHistory(
      userId as string, 
      testType as string, 
      Number(limit)
    );
    
    res.json({ success: true, attempts });

  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
}
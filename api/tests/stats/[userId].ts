import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const stats = await db.getUserStats(userId as string);
    res.json({ success: true, stats });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
}
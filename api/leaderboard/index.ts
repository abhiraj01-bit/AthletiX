import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level = 'national', sport, region, limit = 100 } = req.query;
    
    const leaderboard = await db.getLeaderboard(
      level as 'district' | 'state' | 'national',
      sport as string,
      region as string,
      Number(limit)
    );
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
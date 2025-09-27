import { Request, Response } from 'express';
import { db } from '../lib/database.js';

export const getLeaderboard = async (req: any, res: any) => {
  try {
    const { level = 'district', sport, region, limit = '100' } = req.query;
    
    const leaderboard = await db.getLeaderboard(
      level as 'district' | 'state' | 'national',
      sport as string,
      region as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
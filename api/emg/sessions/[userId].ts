import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const sessions = await db.getEMGSessions(userId as string);
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching EMG sessions:', error);
    res.status(500).json({ error: 'Failed to fetch EMG sessions' });
  }
}
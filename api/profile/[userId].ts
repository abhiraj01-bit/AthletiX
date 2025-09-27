import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const profile = await db.getProfile(userId as string);
      res.json({ success: true, profile });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  } else if (req.method === 'POST') {
    try {
      const profileData = req.body;
      const profile = await db.saveProfile({
        id: userId as string,
        ...profileData
      });
      res.json({ success: true, profile });
    } catch (error) {
      console.error('Save profile error:', error);
      res.status(500).json({ error: 'Failed to save profile' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
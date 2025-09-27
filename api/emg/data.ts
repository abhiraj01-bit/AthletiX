import { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { db } from '../../server/lib/database.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, emgValue, muscleActivity, fatigue, activated } = req.body;
    
    const emgReading = {
      id: randomUUID(),
      userId,
      emgValue,
      muscleActivity,
      fatigueLevel: fatigue,
      activationDetected: activated,
      timestamp: new Date().toISOString()
    };
    
    await db.saveEMGReading(emgReading);
    
    const analysis = {
      performanceLevel: muscleActivity > 70 ? 'High' : muscleActivity > 40 ? 'Medium' : 'Low',
      fatigueWarning: fatigue > 80,
      recommendations: fatigue > 70 ? ['Consider taking a rest break'] : ['Maintain current intensity'],
      injuryRisk: fatigue > 80 && muscleActivity > 80 ? 'High' : 'Low'
    };
    
    res.json({ 
      success: true, 
      data: emgReading,
      analysis 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process EMG data' });
  }
}
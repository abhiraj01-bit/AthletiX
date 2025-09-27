import { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { db } from '../../server/lib/database.js';
import { geminiService } from '../../server/services/geminiService.js';
import { AITrainingService } from '../../server/services/aiTrainingService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  const path = req.url?.split('/').pop();
  
  // Handle EMG data submission
  if (req.method === 'POST' && path === 'data') {
    try {
      const { emgValue, muscleActivity, fatigue, activated } = req.body;
      
      const emgReading = {
        id: randomUUID(),
        userId: userId as string,
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
      
      return res.json({ success: true, data: emgReading, analysis });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to process EMG data' });
    }
  }
  
  // Handle EMG session save
  if (req.method === 'POST' && path === 'session') {
    try {
      const { sessionData, emgHistory, timestamp } = req.body;
      const sessionId = await db.saveEMGSession({ userId: userId as string, sessionData, emgHistory, timestamp });
      return res.json({ success: true, sessionId });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save EMG session' });
    }
  }
  
  // Handle EMG sessions/history fetch
  if (req.method === 'GET') {
    try {
      const sessions = await db.getEMGSessions(userId as string);
      return res.json({ success: true, data: sessions });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch EMG data' });
    }
  }
  
  // Handle training plans
  if (req.method === 'GET' && path === 'training') {
    try {
      const stats = await db.getUserStats(userId as string);
      const attempts = await db.getTestHistory(userId as string, undefined, 10);
      const emgSessions = await db.getEMGSessions(userId as string);
      const userProfile = await db.getProfile(userId as string);
      
      const aiPlan = AITrainingService.generatePersonalizedPlan(attempts, emgSessions, userProfile);
      
      const enhancedPlan = {
        name: 'AI-Enhanced Training Plan',
        difficulty: aiPlan.intensity,
        duration: '4 weeks',
        schedule: aiPlan.frequency,
        focus: aiPlan.focus,
        exercises: aiPlan.recommendedExercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          targetMuscles: ex.targetMuscles,
          emgTarget: `${ex.emgThreshold}% activation`
        }))
      };
      
      return res.json({ success: true, plan: enhancedPlan });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to generate training plans' });
    }
  }
  
  res.status(404).json({ error: 'Endpoint not found' });
}
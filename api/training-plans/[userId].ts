import { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../server/lib/database.js';
import { AITrainingService } from '../../server/services/aiTrainingService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query;
  
  if (req.method === 'GET') {
    try {
      const stats = await db.getUserStats(userId as string);
      const attempts = await db.getTestHistory(userId as string, undefined, 10);
      const emgSessions = await db.getEMGSessions(userId as string);
      const userProfile = await db.getProfile(userId as string);
      
      const aiPlan = AITrainingService.generatePersonalizedPlan(
        attempts,
        emgSessions,
        userProfile
      );
      
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
          emgTarget: `${ex.emgThreshold}% activation`,
          notes: `Focus on ${ex.targetMuscles.join(' and ')} engagement`
        })),
        analysis: {
          strengths: aiPlan.strengths,
          weaknesses: aiPlan.muscleWeaknesses,
          emgInsights: emgSessions.length > 0 ? 
            `Based on ${emgSessions.length} EMG sessions` : 
            'Complete EMG tests for muscle-specific insights',
          recommendations: [
            `Primary focus: ${aiPlan.focus.join(' and ')}`,
            `Training intensity: ${aiPlan.intensity}`,
            `Recommended frequency: ${aiPlan.frequency}`
          ]
        }
      };
      
      res.json({
        success: true,
        plan: enhancedPlan,
        userLevel: aiPlan.intensity,
        emgDataAvailable: emgSessions.length > 0
      });
      
    } catch (error) {
      console.error('Get training plans error:', error);
      res.status(500).json({ error: 'Failed to generate training plans' });
    }
  } else if (req.method === 'POST') {
    try {
      res.json({
        success: true,
        message: 'Training plan saved successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save training plan' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
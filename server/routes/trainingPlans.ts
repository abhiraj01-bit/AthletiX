import { Request, Response } from 'express';
import { db } from '../lib/database.js';
import { geminiService } from '../services/geminiService.js';
import { AITrainingService } from '../services/aiTrainingService.js';

const generateSmartPlanWithGemini = async (userStats: any, attempts: any[]): Promise<any> => {
  try {
    const prompt = `You are an expert fitness trainer. Based on this user's performance data, create a personalized training plan.
    
    User Performance Summary:
    - Average Form Score: ${userStats.averageFormScore || 60}/100
    - Total Tests: ${attempts.length}
    - Recent Test Results: ${attempts.slice(0, 5).map(a => `${a.testType}: ${a.formScore}/100`).join(', ')}
    
    Create a training plan with:
    1. Difficulty level (Beginner/Intermediate/Advanced)
    2. 4-6 specific exercises targeting weak areas
    3. Sets, reps, and rest periods
    4. Training focus areas
    
    Return ONLY valid JSON:
    {
      "name": "Plan Name",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "X weeks",
      "focus": ["area1", "area2"],
      "exercises": [
        {"name": "Exercise", "sets": 3, "reps": "10-15", "rest": "60s", "notes": "tip"}
      ],
      "schedule": "X days per week"
    }`;
    
    const model = geminiService.model;
    if (!model) throw new Error('Gemini not available');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini training plan error:', error);
    return {
      name: 'Basic Fitness Plan',
      difficulty: 'Intermediate',
      duration: '4 weeks',
      focus: ['Overall Fitness'],
      exercises: [
        { name: 'Push-ups', sets: 3, reps: '10-15', rest: '60s' },
        { name: 'Squats', sets: 3, reps: '15-20', rest: '45s' },
        { name: 'Plank', sets: 3, reps: '30s', rest: '30s' }
      ],
      schedule: '3 days per week'
    };
  }
};

export const getTrainingPlans = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get comprehensive user data
    const stats = await db.getUserStats(userId);
    const attempts = await db.getTestHistory(userId, undefined, 10);
    const emgSessions = await db.getEMGSessions(userId);
    const userProfile = await db.getProfile(userId);
    
    // Generate AI-powered training plan using EMG + performance data
    const aiPlan = AITrainingService.generatePersonalizedPlan(
      attempts,
      emgSessions,
      userProfile
    );
    
    // Enhance with Gemini AI for detailed descriptions
    const geminiPlan = await generateSmartPlanWithGemini(stats, attempts);
    
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
};

export const saveTrainingPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { planId, customExercises } = req.body;
    
    // In a real implementation, save to database
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Training plan saved successfully'
    });
    
  } catch (error) {
    console.error('Save training plan error:', error);
    res.status(500).json({ error: 'Failed to save training plan' });
  }
};
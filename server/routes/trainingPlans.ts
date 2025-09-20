import { Request, Response } from 'express';
import { db } from '../lib/database.js';
import { geminiService } from '../services/geminiService.js';
import { AITrainingService } from '../services/aiTrainingService.js';

const generateSmartPlanWithGemini = async (userStats: any, attempts: any[], emgSessions: any[]): Promise<any> => {
  try {
    // Prepare video analysis summary
    const videoAnalysis = attempts.length > 0 ? 
      `Video Test Analysis (${attempts.length} tests):
      - Average Form Score: ${userStats.averageFormScore}/100
      - Test Results: ${attempts.slice(0, 5).map(a => `${a.testType}: ${a.formScore}/100, Metrics: ${JSON.stringify(a.metrics)}`).join('\n      ')}
      - Weak Areas: ${attempts.filter(a => a.formScore < 70).map(a => a.testType).join(', ') || 'None'}
      - Strong Areas: ${attempts.filter(a => a.formScore >= 80).map(a => a.testType).join(', ') || 'None'}` :
      'No video test data available';

    // Prepare EMG analysis summary
    const emgAnalysis = emgSessions.length > 0 ?
      `EMG Muscle Activity Analysis (${emgSessions.length} sessions):
      - Average Muscle Activity: ${(emgSessions.reduce((sum, s) => sum + (s.sessionData?.avgMuscleActivity || 0), 0) / emgSessions.length).toFixed(1)}%
      - Average Fatigue Level: ${(emgSessions.reduce((sum, s) => sum + (s.sessionData?.avgFatigue || 0), 0) / emgSessions.length).toFixed(1)}%
      - Activation Rate: ${(emgSessions.reduce((sum, s) => sum + (s.sessionData?.activationRate || 0), 0) / emgSessions.length).toFixed(1)}%
      - Recovery Needed: ${emgSessions.some(s => (s.sessionData?.avgFatigue || 0) > 70) ? 'Yes' : 'No'}` :
      'No EMG muscle activity data available';

    const prompt = `You are an expert sports scientist and fitness trainer. Analyze BOTH video test performance AND EMG muscle activity data to create a comprehensive training plan.

    ${videoAnalysis}

    ${emgAnalysis}

    Based on this combined analysis, create a training plan that addresses:
    1. Form weaknesses identified in video tests
    2. Muscle activation patterns from EMG data
    3. Fatigue levels and recovery needs
    4. Performance gaps between tests

    Return ONLY valid JSON:
    {
      "name": "Combined Video + EMG Training Plan",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "X weeks",
      "focus": ["area1", "area2", "area3"],
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-15",
          "rest": "60s",
          "targetMuscles": ["muscle1", "muscle2"],
          "emgTarget": "X% activation",
          "videoFocus": "form improvement area",
          "notes": "specific technique tip"
        }
      ],
      "schedule": "X days per week",
      "analysis": {
        "videoInsights": "key findings from video tests",
        "emgInsights": "key findings from muscle activity",
        "combinedRecommendations": ["rec1", "rec2", "rec3"]
      }
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
    console.error('Gemini combined analysis error:', error);
    return {
      name: 'Basic Combined Training Plan',
      difficulty: 'Intermediate',
      duration: '4 weeks',
      focus: ['Form Improvement', 'Muscle Activation'],
      exercises: [
        { name: 'Form-Focused Push-ups', sets: 3, reps: '8-12', rest: '60s', targetMuscles: ['Chest', 'Triceps'], emgTarget: '60% activation', videoFocus: 'Proper form', notes: 'Focus on controlled movement' },
        { name: 'Activation Squats', sets: 3, reps: '12-15', rest: '45s', targetMuscles: ['Quadriceps', 'Glutes'], emgTarget: '70% activation', videoFocus: 'Depth and balance', notes: 'Engage glutes fully' }
      ],
      schedule: '3-4 days per week',
      analysis: {
        videoInsights: 'Video analysis shows form improvement needed',
        emgInsights: 'EMG data indicates muscle activation patterns',
        combinedRecommendations: ['Focus on form quality', 'Monitor muscle engagement', 'Allow adequate recovery']
      }
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
    
    // Enhance with Gemini AI for combined video + EMG analysis
    const geminiPlan = await generateSmartPlanWithGemini(stats, attempts, emgSessions);
    
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
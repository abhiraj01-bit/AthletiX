import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../lib/database.js';

export interface EMGData {
  userId: string;
  emgValue: number;
  muscleActivity: number;
  fatigue: number;
  activated: boolean;
  timestamp: number;
}

export const handleEMGData = async (req: Request, res: Response) => {
  try {
    const { userId, emgValue, muscleActivity, fatigue, activated }: EMGData = req.body;
    
    // Store EMG data (would use Supabase in production)
    const emgReading = {
      id: randomUUID(),
      user_id: userId,
      emg_value: emgValue,
      muscle_activity: muscleActivity,
      fatigue_level: fatigue,
      activation_detected: activated,
      timestamp: new Date().toISOString()
    };
    
    // Analyze EMG data for insights
    const analysis = analyzeEMGData(emgValue, muscleActivity, fatigue);
    
    res.json({ 
      success: true, 
      data: emgReading,
      analysis 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process EMG data' });
  }
};

export const getEMGHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get real EMG sessions from database
    const sessions = await db.getEMGSessions(userId);
    
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch EMG history' });
  }
};

function analyzeEMGData(emgValue: number, muscleActivity: number, fatigue: number) {
  return {
    performanceLevel: muscleActivity > 70 ? 'High' : muscleActivity > 40 ? 'Medium' : 'Low',
    fatigueWarning: fatigue > 80,
    recommendations: generateRecommendations(muscleActivity, fatigue),
    injuryRisk: calculateInjuryRisk(fatigue, muscleActivity)
  };
}

function generateRecommendations(activity: number, fatigue: number): string[] {
  const recommendations = [];
  
  if (fatigue > 70) {
    recommendations.push('Consider taking a rest break');
  }
  if (activity < 30) {
    recommendations.push('Increase muscle engagement');
  }
  if (activity > 90) {
    recommendations.push('Monitor for overexertion');
  }
  
  return recommendations;
}

function calculateInjuryRisk(fatigue: number, activity: number): 'Low' | 'Medium' | 'High' {
  if (fatigue > 80 && activity > 80) return 'High';
  if (fatigue > 60 || activity > 70) return 'Medium';
  return 'Low';
}



export const saveEMGSession = async (req: Request, res: Response) => {
  try {
    const { sessionData, emgHistory, userId, timestamp } = req.body;
    console.log('Saving EMG session summary for user:', userId);
    
    const sessionId = await db.saveEMGSession({
      userId,
      sessionData,
      emgHistory,
      timestamp
    });
    
    console.log('Successfully saved EMG session:', sessionId);
    res.json({ success: true, sessionId, message: 'EMG session saved to database' });
  } catch (error) {
    console.error('Error saving EMG session:', error);
    res.status(500).json({ error: 'Failed to save EMG session' });
  }
};

export const getEMGSessions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const sessions = await db.getEMGSessions(userId);
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching EMG sessions:', error);
    res.status(500).json({ error: 'Failed to fetch EMG sessions' });
  }
};

export const analyzeEMGSession = async (req: Request, res: Response) => {
  try {
    const { analysis, history } = req.body;
    console.log('Generating Gemini AI insights for EMG session');
    
    // Use Gemini AI for analysis
    const { geminiService } = await import('../services/geminiService.js');
    
    if (!geminiService.model) {
      throw new Error('Gemini API not available');
    }
    
    const prompt = `You are an expert sports scientist analyzing EMG (electromyography) muscle activity data. Provide detailed analysis and recommendations.
    
    EMG Session Data:
    - Average Muscle Activity: ${analysis.avgMuscleActivity.toFixed(1)}%
    - Peak Muscle Activity: ${analysis.maxMuscleActivity.toFixed(1)}%
    - Average Fatigue Level: ${analysis.avgFatigue.toFixed(1)}%
    - Activation Rate: ${analysis.activationRate.toFixed(1)}%
    - Session Duration: ${(analysis.totalSessionTime / 60).toFixed(1)} minutes
    - Total Data Points: ${analysis.dataPoints}
    
    Provide comprehensive analysis including:
    1. Session summary with key findings
    2. Performance evaluation (muscle engagement quality)
    3. Fatigue assessment and recovery recommendations
    4. Activation pattern analysis
    5. 3-4 specific training recommendations
    6. Next steps for improvement
    
    Return ONLY valid JSON:
    {
      "summary": "detailed session summary",
      "performance": "performance analysis",
      "fatigue": "fatigue assessment",
      "activationPattern": "activation pattern analysis",
      "recommendations": ["rec1", "rec2", "rec3", "rec4"],
      "nextSteps": ["step1", "step2", "step3"]
    }`;
    
    const result = await geminiService.model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('Gemini EMG analysis response:', responseText.substring(0, 200) + '...');
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    
    const insights = JSON.parse(jsonMatch[0]);
    
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Gemini EMG analysis error:', error);
    
    // Fallback to basic analysis if Gemini fails
    const fallbackInsights = {
      summary: `EMG session: ${analysis.avgMuscleActivity.toFixed(1)}% avg activity over ${(analysis.totalSessionTime / 60).toFixed(1)} minutes`,
      performance: analysis.avgMuscleActivity > 60 ? 'Good muscle engagement' : 'Low muscle activation',
      fatigue: analysis.avgFatigue > 70 ? 'High fatigue - rest needed' : 'Moderate fatigue levels',
      activationPattern: analysis.activationRate > 60 ? 'Consistent activation' : 'Inconsistent activation',
      recommendations: ['Focus on proper muscle activation', 'Monitor fatigue levels', 'Maintain consistent form'],
      nextSteps: ['Practice activation exercises', 'Allow adequate recovery', 'Track progress over time']
    };
    
    res.json({ success: true, insights: fallbackInsights });
  }
};


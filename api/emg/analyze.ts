import { VercelRequest, VercelResponse } from '@vercel/node';
import { geminiService } from '../../server/services/geminiService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysis } = req.body;
    
    if (!geminiService.model) {
      throw new Error('Gemini API not available');
    }
    
    const prompt = `You are an expert sports scientist analyzing EMG (electromyography) muscle activity data. Provide detailed analysis and recommendations.
    
    EMG Session Data:
    - Average Muscle Activity: ${analysis?.avgMuscleActivity?.toFixed(1) || 0}%
    - Peak Muscle Activity: ${analysis?.maxMuscleActivity?.toFixed(1) || 0}%
    - Average Fatigue Level: ${analysis?.avgFatigue?.toFixed(1) || 0}%
    - Activation Rate: ${analysis?.activationRate?.toFixed(1) || 0}%
    - Session Duration: ${((analysis?.totalSessionTime || 0) / 60).toFixed(1)} minutes
    - Total Data Points: ${analysis?.dataPoints || 0}
    
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
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    
    const insights = JSON.parse(jsonMatch[0]);
    
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Gemini EMG analysis error:', error);
    
    const { analysis } = req.body;
    const fallbackInsights = {
      summary: `EMG session: ${analysis?.avgMuscleActivity?.toFixed(1) || 0}% avg activity over ${((analysis?.totalSessionTime || 0) / 60).toFixed(1)} minutes`,
      performance: (analysis?.avgMuscleActivity || 0) > 60 ? 'Good muscle engagement' : 'Low muscle activation',
      fatigue: (analysis?.avgFatigue || 0) > 70 ? 'High fatigue - rest needed' : 'Moderate fatigue levels',
      activationPattern: (analysis?.activationRate || 0) > 60 ? 'Consistent activation' : 'Inconsistent activation',
      recommendations: ['Focus on proper muscle activation', 'Monitor fatigue levels', 'Maintain consistent form'],
      nextSteps: ['Practice activation exercises', 'Allow adequate recovery', 'Track progress over time']
    };
    
    res.json({ success: true, insights: fallbackInsights });
  }
}
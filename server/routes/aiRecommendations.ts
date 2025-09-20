import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService.js';

export const generateAIRecommendations = async (req: Request, res: Response) => {
  try {
    const { attempts, emgSessions } = req.body;
    console.log('Generating Gemini AI recommendations');
    
    if (!geminiService.model) {
      throw new Error('Gemini API not available');
    }
    
    // Prepare data summary
    const testSummary = attempts.length > 0 ? 
      `${attempts.length} fitness tests completed. Average form score: ${(attempts.reduce((sum: number, a: any) => sum + a.formScore, 0) / attempts.length).toFixed(1)}/100. Test types: ${[...new Set(attempts.map((a: any) => a.testType))].join(', ')}` :
      'No fitness test data available';
    
    const emgSummary = emgSessions.length > 0 ?
      `${emgSessions.length} EMG sessions recorded. Average muscle activity: ${(emgSessions.reduce((sum: number, s: any) => sum + (s.sessionData?.avgMuscleActivity || 0), 0) / emgSessions.length).toFixed(1)}%. Average fatigue: ${(emgSessions.reduce((sum: number, s: any) => sum + (s.sessionData?.avgFatigue || 0), 0) / emgSessions.length).toFixed(1)}%` :
      'No EMG muscle activity data available';
    
    const prompt = `You are an expert sports nutritionist, fitness trainer, and sports scientist. Analyze the user's fitness and EMG data to provide comprehensive recommendations.

    User Data Analysis:
    - Fitness Tests: ${testSummary}
    - EMG Muscle Data: ${emgSummary}
    
    Provide detailed recommendations in these areas:
    1. NUTRITION: Personalized meal plan with specific calorie targets, macro ratios, meal suggestions, and supplements based on performance and muscle recovery needs
    2. TRAINING: Exercise recommendations focusing on weak areas identified from tests and EMG data
    3. SAFETY: Injury prevention and recovery recommendations based on fatigue levels and performance patterns
    
    Return ONLY valid JSON:
    {
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "meals": ["meal1", "meal2", "meal3", "meal4", "meal5"],
        "supplements": ["supplement1", "supplement2", "supplement3"]
      },
      "training": {
        "focus": ["area1", "area2"],
        "exercises": ["exercise1", "exercise2", "exercise3"],
        "intensity": "Low|Medium|High",
        "frequency": "X times per week",
        "duration": "X minutes"
      },
      "safety": {
        "injuries": ["risk1", "risk2"],
        "prevention": ["tip1", "tip2", "tip3"],
        "recovery": ["method1", "method2"],
        "warnings": ["warning1", "warning2"]
      }
    }`;
    
    const result = await geminiService.model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('Gemini recommendations response:', responseText.substring(0, 200) + '...');
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');
    
    const recommendations = JSON.parse(jsonMatch[0]);
    
    res.json({ success: true, recommendations });
  } catch (error) {
    console.error('Gemini AI recommendations error:', error);
    
    // Fallback recommendations
    const fallbackRecommendations = {
      nutrition: {
        calories: 2200,
        protein: 1.6,
        carbs: 4,
        fats: 1,
        meals: ["Balanced breakfast with protein", "Lean protein lunch", "Healthy snack", "Nutritious dinner", "Post-workout recovery meal"],
        supplements: ["Multivitamin", "Protein powder", "Omega-3"]
      },
      training: {
        focus: ["General fitness", "Form improvement"],
        exercises: ["Bodyweight exercises", "Cardio training", "Flexibility work"],
        intensity: "Medium",
        frequency: "3-4 times per week",
        duration: "45 minutes"
      },
      safety: {
        injuries: ["Muscle strain risk"],
        prevention: ["Proper warm-up", "Stay hydrated", "Listen to your body"],
        recovery: ["Adequate sleep", "Rest days", "Proper nutrition"],
        warnings: ["Monitor form quality", "Avoid overtraining"]
      }
    };
    
    res.json({ success: true, recommendations: fallbackRecommendations });
  }
};
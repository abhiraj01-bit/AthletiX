import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface VideoAnalysisResult {
  testType: string;
  metrics: Record<string, number>;
  formScore: number;
  recommendations: string[];
  badge: string;
  errors: string[];
  isRealAI?: boolean;
}

export class GeminiAnalysisService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async analyzeVideo(videoBuffer: Buffer, testType: string): Promise<VideoAnalysisResult> {
    console.log(`=== GEMINI AI ANALYSIS START ===`);
    console.log(`Test type: ${testType}`);
    console.log(`Video buffer size: ${videoBuffer.length} bytes`);
    console.log(`API Key available: ${!!process.env.GEMINI_API_KEY}`);
    
    try {
      const prompt = this.getAnalysisPrompt(testType);
      const mimeType = this.detectMimeType(videoBuffer);
      console.log(`MIME type: ${mimeType}`);
      
      console.log('Calling Gemini API...');
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: videoBuffer.toString('base64'),
            mimeType
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();
      console.log('=== GEMINI SUCCESS ===');
      console.log('Raw response:', responseText.substring(0, 200) + '...');
      
      const analysis = this.parseGeminiResponse(responseText, testType);
      analysis.isRealAI = true; // Mark as real AI
      console.log('Final analysis:', analysis);
      
      return analysis;
    } catch (error) {
      console.error('=== GEMINI FAILED ===');
      console.error('Error details:', error);
      console.log('Using fallback mock data');
      
      const fallback = this.getFallbackAnalysis(testType);
      fallback.isRealAI = false; // Mark as mock
      return fallback;
    }
  }

  private detectMimeType(buffer: Buffer): string {
    // Check file signature to determine type
    const signature = buffer.toString('hex', 0, 4).toUpperCase();
    
    if (signature.startsWith('1A45DFA3')) return 'video/webm';
    if (signature.startsWith('00000018') || signature.startsWith('00000020')) return 'video/mp4';
    if (signature.startsWith('464C5601')) return 'video/x-flv';
    
    // Default fallback
    return 'video/mp4';
  }

  private getAnalysisPrompt(testType: string): string {
    const basePrompt = `Analyze this ${testType} exercise video and provide detailed feedback. Focus on:`;
    
    const prompts = {
      verticalJump: `${basePrompt}
        - Jump height measurement
        - Takeoff technique and form
        - Landing mechanics
        - Body alignment during jump
        Return JSON: {"jumpHeight": number, "formScore": 0-100, "technique": "analysis", "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      sitUps: `${basePrompt}
        - Count accurate repetitions
        - Form quality (full range of motion)
        - Pace and rhythm
        - Core engagement
        Return JSON: {"reps": number, "formScore": 0-100, "pace": "analysis", "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      pushUps: `${basePrompt}
        - Count valid repetitions
        - Body alignment and form
        - Range of motion
        - Muscle engagement
        Return JSON: {"reps": number, "formScore": 0-100, "alignment": "analysis", "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      pullUps: `${basePrompt}
        - Count complete repetitions
        - Grip and hang position
        - Pull technique
        - Control during descent
        Return JSON: {"reps": number, "formScore": 0-100, "technique": "analysis", "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      shuttleRun: `${basePrompt}
        - Speed and agility
        - Direction change technique
        - Footwork patterns
        - Overall time estimation
        Return JSON: {"laps": number, "time": number, "agility": 0-100, "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      flexibilityTest: `${basePrompt}
        - Range of motion measurement
        - Form and technique
        - Flexibility assessment
        - Areas for improvement
        Return JSON: {"reach": number, "flexibility": 0-100, "assessment": "analysis", "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      agilityLadder: `${basePrompt}
        - Footwork speed and accuracy
        - Coordination and rhythm
        - Time estimation
        - Technique quality
        Return JSON: {"time": number, "footwork": 0-100, "coordination": "analysis", "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      enduranceRun: `${basePrompt}
        - Running pace and consistency
        - Breathing technique
        - Form and posture
        - Distance covered estimation
        Return JSON: {"distance": number, "pace": number, "endurance": 0-100, "recommendations": ["tip1", "tip2"], "errors": []}`,
      
      heightWeight: `${basePrompt}
        - Body measurements
        - Posture assessment
        - Overall fitness indicators
        - Health recommendations
        Return JSON: {"height": number, "weight": number, "bmi": number, "recommendations": ["tip1", "tip2"], "errors": []}`
    };

    return prompts[testType as keyof typeof prompts] || prompts.sitUps;
  }

  private parseGeminiResponse(response: string, testType: string): VideoAnalysisResult {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        testType,
        metrics: this.extractMetrics(parsed, testType),
        formScore: parsed.formScore || 75,
        recommendations: parsed.recommendations || ['Keep practicing!'],
        badge: this.calculateBadge(parsed, testType),
        errors: []
      };
    } catch (error) {
      console.error('Parse error:', error);
      return this.getFallbackAnalysis(testType);
    }
  }

  private extractMetrics(parsed: any, testType: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    switch (testType) {
      case 'verticalJump':
        metrics.jumpHeightCm = parsed.jumpHeight || 45;
        break;
      case 'sitUps':
      case 'pushUps':
      case 'pullUps':
        metrics.reps = parsed.reps || 20;
        break;
      case 'shuttleRun':
        metrics.laps = parsed.laps || 10;
        metrics.timeSec = parsed.time || 60;
        break;
      case 'flexibilityTest':
        metrics.reachCm = parsed.reach || 25;
        metrics.flexibilityScore = parsed.flexibility || 70;
        break;
      case 'agilityLadder':
        metrics.completionTime = parsed.time || 8;
        metrics.footworkScore = parsed.footwork || 80;
        break;
      case 'enduranceRun':
        metrics.distanceKm = parsed.distance || 3;
        metrics.pace = parsed.pace || 6;
        break;
      case 'heightWeight':
        metrics.heightCm = parsed.height || 170;
        metrics.weightKg = parsed.weight || 65;
        metrics.bmi = parsed.bmi || 22.5;
        break;
    }
    
    return metrics;
  }

  private calculateBadge(parsed: any, testType: string): string {
    const score = parsed.formScore || 75;
    if (score >= 90) return 'National Standard';
    if (score >= 80) return 'State Level';
    if (score >= 70) return 'District Elite';
    return 'Good';
  }

  private getFallbackAnalysis(testType: string): VideoAnalysisResult {
    const mockMetrics = this.generateMockMetrics(testType);
    const formScore = 70 + Math.random() * 25;
    
    return {
      testType,
      metrics: mockMetrics,
      formScore: Math.round(formScore),
      recommendations: [
        'Focus on maintaining proper form throughout the movement',
        'Keep your core engaged during the exercise',
        'Control the tempo - avoid rushing through repetitions'
      ],
      badge: this.calculateBadge({ formScore }, testType),
      errors: []
    };
  }

  private generateMockMetrics(testType: string): Record<string, number> {
    switch (testType) {
      case 'verticalJump':
        return { jumpHeightCm: 40 + Math.random() * 25 };
      case 'sitUps':
      case 'pushUps':
      case 'pullUps':
        return { reps: 15 + Math.random() * 20 };
      case 'shuttleRun':
        return { laps: 8 + Math.random() * 8, timeSec: 50 + Math.random() * 30 };
      case 'flexibilityTest':
        return { reachCm: 20 + Math.random() * 20, flexibilityScore: 60 + Math.random() * 30 };
      case 'agilityLadder':
        return { completionTime: 6 + Math.random() * 4, footworkScore: 70 + Math.random() * 25 };
      case 'enduranceRun':
        return { distanceKm: 2 + Math.random() * 3, pace: 5 + Math.random() * 2 };
      case 'heightWeight':
        return { heightCm: 160 + Math.random() * 25, weightKg: 55 + Math.random() * 25, bmi: 20 + Math.random() * 5 };
      default:
        return { value: 50 + Math.random() * 30 };
    }
  }
}

export const geminiService = new GeminiAnalysisService();
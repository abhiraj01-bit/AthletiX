import { EMGData } from '../lib/database.js';

export interface TrainingAnalysis {
  muscleWeaknesses: string[];
  strengths: string[];
  recommendedExercises: Exercise[];
  intensity: 'Low' | 'Medium' | 'High';
  frequency: string;
  focus: string[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  targetMuscles: string[];
  emgThreshold: number;
}

export class AITrainingService {
  static generatePersonalizedPlan(
    testHistory: any[],
    emgSessions: any[],
    userProfile: any
  ): TrainingAnalysis {
    const muscleAnalysis = this.analyzeMusclePerformance(emgSessions);
    const performanceAnalysis = this.analyzeTestPerformance(testHistory);
    
    return {
      muscleWeaknesses: muscleAnalysis.weakMuscles,
      strengths: performanceAnalysis.strongAreas,
      recommendedExercises: this.generateExercises(muscleAnalysis, performanceAnalysis),
      intensity: this.calculateIntensity(performanceAnalysis.avgScore),
      frequency: this.recommendFrequency(muscleAnalysis.recoveryNeeded),
      focus: this.determineFocus(muscleAnalysis, performanceAnalysis)
    };
  }

  private static analyzeMusclePerformance(emgSessions: any[]) {
    if (!emgSessions.length) {
      return { weakMuscles: [], avgActivation: 0, recoveryNeeded: false };
    }

    const avgActivation = emgSessions.reduce((sum, session) => 
      sum + session.sessionData.avgMuscleActivity, 0) / emgSessions.length;

    const weakMuscles = [];
    if (avgActivation < 40) weakMuscles.push('Core Strength');
    if (avgActivation < 30) weakMuscles.push('Upper Body');

    return {
      weakMuscles,
      avgActivation,
      recoveryNeeded: avgActivation > 80
    };
  }

  private static analyzeTestPerformance(testHistory: any[]) {
    if (!testHistory.length) {
      return { avgScore: 0, strongAreas: [], weakAreas: [] };
    }

    const avgScore = testHistory.reduce((sum, test) => sum + test.formScore, 0) / testHistory.length;
    const testsByType = testHistory.reduce((acc, test) => {
      if (!acc[test.testType]) acc[test.testType] = [];
      acc[test.testType].push(test.formScore);
      return acc;
    }, {});

    const strongAreas = [];
    const weakAreas = [];

    Object.entries(testsByType).forEach(([testType, scores]: [string, number[]]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > 75) strongAreas.push(testType);
      if (avg < 50) weakAreas.push(testType);
    });

    return { avgScore, strongAreas, weakAreas };
  }

  private static generateExercises(muscleAnalysis: any, performanceAnalysis: any): Exercise[] {
    const exercises: Exercise[] = [];

    // EMG-based exercises
    if (muscleAnalysis.avgActivation < 40) {
      exercises.push({
        name: 'EMG-Guided Push-ups',
        sets: 3,
        reps: '8-12',
        rest: '60s',
        targetMuscles: ['Chest', 'Triceps'],
        emgThreshold: 60
      });
    }

    // Performance-based exercises
    if (performanceAnalysis.weakAreas.includes('verticalJump')) {
      exercises.push({
        name: 'Plyometric Squats',
        sets: 4,
        reps: '10',
        rest: '90s',
        targetMuscles: ['Quadriceps', 'Glutes'],
        emgThreshold: 70
      });
    }

    if (performanceAnalysis.weakAreas.includes('flexibility')) {
      exercises.push({
        name: 'Dynamic Stretching',
        sets: 2,
        reps: '30s hold',
        rest: '15s',
        targetMuscles: ['Hip Flexors', 'Hamstrings'],
        emgThreshold: 20
      });
    }

    return exercises.length ? exercises : this.getDefaultExercises();
  }

  private static getDefaultExercises(): Exercise[] {
    return [
      {
        name: 'Bodyweight Squats',
        sets: 3,
        reps: '12-15',
        rest: '60s',
        targetMuscles: ['Quadriceps', 'Glutes'],
        emgThreshold: 50
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: '8-12',
        rest: '60s',
        targetMuscles: ['Chest', 'Triceps'],
        emgThreshold: 60
      },
      {
        name: 'Plank Hold',
        sets: 3,
        reps: '30-45s',
        rest: '30s',
        targetMuscles: ['Core'],
        emgThreshold: 40
      }
    ];
  }

  private static calculateIntensity(avgScore: number): 'Low' | 'Medium' | 'High' {
    if (avgScore > 80) return 'High';
    if (avgScore > 60) return 'Medium';
    return 'Low';
  }

  private static recommendFrequency(recoveryNeeded: boolean): string {
    return recoveryNeeded ? '3-4 times per week' : '4-5 times per week';
  }

  private static determineFocus(muscleAnalysis: any, performanceAnalysis: any): string[] {
    const focus = [];
    
    if (muscleAnalysis.avgActivation < 40) focus.push('Muscle Activation');
    if (performanceAnalysis.weakAreas.includes('enduranceRun')) focus.push('Cardiovascular Endurance');
    if (performanceAnalysis.weakAreas.includes('flexibility')) focus.push('Flexibility');
    if (performanceAnalysis.avgScore < 60) focus.push('Form Improvement');
    
    return focus.length ? focus : ['General Fitness'];
  }
}
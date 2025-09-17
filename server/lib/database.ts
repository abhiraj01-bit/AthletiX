import { createClient } from '@supabase/supabase-js';

// Generic database interface - can be implemented for any database
export interface DatabaseAdapter {
  saveTestAttempt(attempt: TestAttempt): Promise<TestAttempt>;
  getTestHistory(userId: string, testType?: string, limit?: number): Promise<TestAttempt[]>;
  getUserStats(userId: string): Promise<UserStats>;
  saveEMGReading(reading: EMGReading): Promise<void>;
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
}

export interface TestAttempt {
  id: string;
  userId: string;
  testType: string;
  videoUrl?: string;
  analysisResult: any;
  metrics: Record<string, number>;
  formScore: number;
  badge: string;
  recommendations: string[];
  createdAt: string;
}

export interface EMGReading {
  id: string;
  userId: string;
  testAttemptId?: string;
  emgValue: number;
  muscleActivity: number;
  fatigueLevel: number;
  activationDetected: boolean;
  timestamp: string;
}

export interface UserStats {
  totalAttempts: number;
  averageFormScore: number;
  bestPerformances: Record<string, any>;
  recentTrend: 'improving' | 'declining' | 'stable';
  weeklyProgress: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
  district?: string;
  sport?: string;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// In-memory implementation for development/testing
class InMemoryDatabase implements DatabaseAdapter {
  private testAttempts: TestAttempt[] = [];
  private emgReadings: EMGReading[] = [];

  async saveTestAttempt(attempt: TestAttempt): Promise<TestAttempt> {
    this.testAttempts.unshift(attempt);
    return attempt;
  }

  async getTestHistory(userId: string, testType?: string, limit = 20): Promise<TestAttempt[]> {
    let filtered = this.testAttempts.filter(a => a.userId === userId);
    if (testType) filtered = filtered.filter(a => a.testType === testType);
    return filtered.slice(0, limit);
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const attempts = this.testAttempts.filter(a => a.userId === userId);
    
    return {
      totalAttempts: attempts.length,
      averageFormScore: attempts.length > 0 
        ? Math.round(attempts.reduce((sum, a) => sum + a.formScore, 0) / attempts.length)
        : 0,
      bestPerformances: this.calculateBestPerformances(attempts),
      recentTrend: 'stable',
      weeklyProgress: Math.min(attempts.length * 10, 100)
    };
  }

  async saveEMGReading(reading: EMGReading): Promise<void> {
    this.emgReadings.unshift(reading);
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    // Mock implementation for in-memory
    return null;
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    // Mock implementation for in-memory
    return profile;
  }

  private calculateBestPerformances(attempts: TestAttempt[]): Record<string, any> {
    const testGroups = attempts.reduce((groups, attempt) => {
      if (!groups[attempt.testType]) groups[attempt.testType] = [];
      groups[attempt.testType].push(attempt);
      return groups;
    }, {} as Record<string, TestAttempt[]>);

    const best: Record<string, any> = {};
    Object.entries(testGroups).forEach(([testType, testAttempts]) => {
      best[testType] = testAttempts.reduce((best, current) => 
        current.formScore > best.formScore ? current : best
      );
    });

    return best;
  }
}

// Supabase implementation with fallback
class SupabaseDatabase implements DatabaseAdapter {
  private supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  constructor() {
    console.log('Supabase URL:', process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');
    console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
  private fallback = new InMemoryDatabase();

  async saveTestAttempt(attempt: TestAttempt): Promise<TestAttempt> {
    try {
      console.log('Supabase: Attempting to insert test attempt:', {
        user_id: attempt.userId,
        test_type: attempt.testType,
        form_score: attempt.formScore
      });
      
      const { data, error } = await this.supabase
        .from('test_attempts')
        .insert({
          user_id: attempt.userId,
          test_type: attempt.testType,
          video_url: attempt.videoUrl,
          analysis_result: attempt.analysisResult,
          metrics: attempt.metrics,
          form_score: attempt.formScore,
          badge: attempt.badge,
          recommendations: attempt.recommendations
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('Supabase: Successfully inserted:', data.id);
      return this.mapTestAttempt(data);
    } catch (error) {
      console.warn('Supabase unavailable, using fallback:', error);
      return this.fallback.saveTestAttempt(attempt);
    }
  }

  async getTestHistory(userId: string, testType?: string, limit = 20): Promise<TestAttempt[]> {
    try {
      let query = this.supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data?.map(this.mapTestAttempt) || [];
    } catch (error) {
      console.warn('Supabase unavailable, using fallback:', error);
      return this.fallback.getTestHistory(userId, testType, limit);
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const { data: attempts, error } = await this.supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      const mappedAttempts = attempts?.map(this.mapTestAttempt) || [];
      
      return {
        totalAttempts: mappedAttempts.length,
        averageFormScore: mappedAttempts.length > 0 
          ? Math.round(mappedAttempts.reduce((sum, a) => sum + a.formScore, 0) / mappedAttempts.length)
          : 0,
        bestPerformances: this.calculateBestPerformances(mappedAttempts),
        recentTrend: 'stable',
        weeklyProgress: Math.min(mappedAttempts.length * 10, 100)
      };
    } catch (error) {
      console.warn('Supabase unavailable, using fallback:', error);
      return this.fallback.getUserStats(userId);
    }
  }

  async saveEMGReading(reading: EMGReading): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('emg_readings')
        .insert({
          user_id: reading.userId,
          test_attempt_id: reading.testAttemptId,
          emg_value: reading.emgValue,
          muscle_activity: reading.muscleActivity,
          fatigue_level: reading.fatigueLevel,
          activation_detected: reading.activationDetected
        });

      if (error) throw error;
    } catch (error) {
      console.warn('Supabase unavailable, using fallback:', error);
      return this.fallback.saveEMGReading(reading);
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.mapProfile(data) : null;
    } catch (error) {
      console.warn('Supabase profile fetch failed:', error);
      return null;
    }
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          district: profile.district,
          sport: profile.sport,
          photo_url: profile.photo_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapProfile(data);
    } catch (error) {
      console.warn('Supabase profile save failed:', error);
      return profile;
    }
  }

  private mapProfile(data: any): UserProfile {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      age: data.age,
      gender: data.gender,
      district: data.district,
      sport: data.sport,
      photo_url: data.photo_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  private mapTestAttempt(data: any): TestAttempt {
    return {
      id: data.id,
      userId: data.user_id,
      testType: data.test_type,
      videoUrl: data.video_url,
      analysisResult: data.analysis_result,
      metrics: data.metrics,
      formScore: data.form_score,
      badge: data.badge,
      recommendations: data.recommendations,
      createdAt: data.created_at
    };
  }

  private calculateBestPerformances(attempts: TestAttempt[]): Record<string, any> {
    const testGroups = attempts.reduce((groups, attempt) => {
      if (!groups[attempt.testType]) groups[attempt.testType] = [];
      groups[attempt.testType].push(attempt);
      return groups;
    }, {} as Record<string, TestAttempt[]>);

    const best: Record<string, any> = {};
    Object.entries(testGroups).forEach(([testType, testAttempts]) => {
      best[testType] = testAttempts.reduce((best, current) => 
        current.formScore > best.formScore ? current : best
      );
    });

    return best;
  }
}

// Export database instance - use Supabase by default
export const db: DatabaseAdapter = new SupabaseDatabase();
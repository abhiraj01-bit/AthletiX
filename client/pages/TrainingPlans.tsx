import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Target, Zap, CheckCircle, Play } from "lucide-react";
import { generateAIRecommendations } from "@/lib/aiRecommendations";
import APIService from "@/lib/api";

function WorkoutHistory() {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  
  useEffect(() => {
    const loadWorkoutHistory = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 5);
          const workouts = attempts.map(attempt => ({
            date: new Date(attempt.createdAt).toLocaleDateString(),
            workout: attempt.testType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
            duration: "Test completed",
            completed: attempt.formScore >= 50
          }));
          setWorkoutHistory(workouts);
        }
      } catch (error) {
        console.error('Failed to load workout history:', error);
      }
    };
    loadWorkoutHistory();
    
    const handleTestCompleted = () => {
      loadWorkoutHistory();
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);
  
  return (
    <div className="space-y-2">
      {workoutHistory.length === 0 ? (
        <div className="text-muted-foreground text-center py-4">No workout history yet</div>
      ) : (
        workoutHistory.map((session, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded border">
            <div>
              <div className="font-medium">{session.workout}</div>
              <div className="text-sm text-muted-foreground">{session.date} • {session.duration}</div>
            </div>
            <Badge variant={session.completed ? "default" : "secondary"}>
              {session.completed ? "Completed" : "Needs Improvement"}
            </Badge>
          </div>
        ))
      )}
    </div>
  );
}

const generateAIWorkout = (userStats: any) => {
  const workouts = [
    {
      id: "strength-focus",
      name: "Strength Building",
      duration: "45 min",
      difficulty: "Medium",
      focus: ["Upper Body", "Core"],
      exercises: [
        { name: "Push-ups", sets: 3, reps: "12-15", rest: "60s" },
        { name: "Pull-ups", sets: 3, reps: "8-10", rest: "90s" },
        { name: "Plank", sets: 3, reps: "45s", rest: "30s" },
        { name: "Squats", sets: 3, reps: "15-20", rest: "60s" }
      ]
    },
    {
      id: "cardio-endurance",
      name: "Cardio Endurance",
      duration: "30 min",
      difficulty: "High",
      focus: ["Cardiovascular", "Legs"],
      exercises: [
        { name: "Shuttle Runs", sets: 4, reps: "30s", rest: "30s" },
        { name: "Agility Ladder", sets: 3, reps: "2 rounds", rest: "60s" },
        { name: "Jump Squats", sets: 3, reps: "15", rest: "45s" },
        { name: "Mountain Climbers", sets: 3, reps: "30s", rest: "30s" }
      ]
    },
    {
      id: "flexibility-recovery",
      name: "Flexibility & Recovery",
      duration: "25 min",
      difficulty: "Easy",
      focus: ["Flexibility", "Recovery"],
      exercises: [
        { name: "Sit-and-Reach", sets: 3, reps: "30s hold", rest: "15s" },
        { name: "Hip Flexor Stretch", sets: 2, reps: "45s each", rest: "30s" },
        { name: "Shoulder Rolls", sets: 2, reps: "10 each way", rest: "15s" },
        { name: "Deep Breathing", sets: 1, reps: "5 min", rest: "0s" }
      ]
    }
  ];

  return workouts;
};

export default function TrainingPlans() {
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [aiRecommendations, setAiRecommendations] = useState(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const user = await APIService.getCurrentUser();
        if (user) {
          const attempts = await APIService.getTestHistory(user.id, 10);
          if (attempts.length > 0) {
            const recommendations = generateAIRecommendations(attempts);
            setAiRecommendations(recommendations);
          }
        }
      } catch (error) {
        console.error('Failed to load AI recommendations:', error);
      }
    };
    loadRecommendations();
    
    const handleTestCompleted = () => {
      loadRecommendations();
    };
    
    window.addEventListener('testCompleted', handleTestCompleted);
    return () => window.removeEventListener('testCompleted', handleTestCompleted);
  }, []);
  
  const userStats = useMemo(() => {
    return {
      avgPerformance: 75,
      weakAreas: ["Upper Body", "Flexibility"],
      strongAreas: ["Endurance", "Core"]
    };
  }, []);

  const workouts = generateAIWorkout(userStats);

  const toggleExercise = (exerciseId: string) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }
    setCompletedExercises(newCompleted);
  };

  const getWorkoutProgress = (workoutId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return 0;
    const completed = workout.exercises.filter(ex => 
      completedExercises.has(`${workoutId}-${ex.name}`)
    ).length;
    return Math.round((completed / workout.exercises.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Training Plans</h1>
          <p className="text-muted-foreground">Personalized workouts based on your performance</p>
        </div>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-brand-500" />
            AI Training Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Training Focus</div>
                <div className="space-y-1">
                  {aiRecommendations ? (
                    aiRecommendations.training.focus.map((focus, idx) => (
                      <div key={idx} className="text-sm font-medium">• {focus}</div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">• Complete tests for recommendations</div>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Recommended Exercises</div>
                <div className="space-y-1">
                  {aiRecommendations ? (
                    aiRecommendations.training.exercises.slice(0, 3).map((exercise, idx) => (
                      <div key={idx} className="text-sm">• {exercise}</div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">• Complete fitness assessment</div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Frequency</div>
                  <div className="font-semibold">{aiRecommendations?.training.frequency || "Complete tests"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Intensity</div>
                  <div className="font-semibold">{aiRecommendations?.training.intensity || "Complete tests"}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Plans */}
      <div className="grid lg:grid-cols-3 gap-6">
        {workouts.map(workout => (
          <Card key={workout.id} className={activeWorkout === workout.id ? "ring-2 ring-brand-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{workout.name}</span>
                <Badge variant={workout.difficulty === "High" ? "destructive" : workout.difficulty === "Medium" ? "secondary" : "default"}>
                  {workout.difficulty}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {workout.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {workout.focus.join(", ")}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm">{getWorkoutProgress(workout.id)}%</span>
                </div>
                <Progress value={getWorkoutProgress(workout.id)} />
              </div>
              
              <div className="space-y-2">
                {workout.exercises.map((exercise, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExercise(`${workout.id}-${exercise.name}`)}
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          completedExercises.has(`${workout.id}-${exercise.name}`) 
                            ? "bg-green-500 border-green-500" 
                            : "border-gray-300"
                        }`}
                      >
                        {completedExercises.has(`${workout.id}-${exercise.name}`) && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </button>
                      <span className="text-sm font-medium">{exercise.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.sets}x{exercise.reps}
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setActiveWorkout(activeWorkout === workout.id ? null : workout.id)}
                className="w-full gap-2"
                variant={activeWorkout === workout.id ? "secondary" : "default"}
              >
                <Play className="h-4 w-4" />
                {activeWorkout === workout.id ? "Stop Workout" : "Start Workout"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutHistory />
        </CardContent>
      </Card>
    </div>
  );
}
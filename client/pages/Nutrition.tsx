import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Apple, Plus, Target, TrendingUp, Utensils, Zap } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const generateMealPlan = (goals: string, activityLevel: string) => {
  const basePlans = {
    "weight-loss": {
      name: "Weight Loss Plan",
      calories: 1800,
      protein: 135,
      carbs: 180,
      fat: 60,
      meals: [
        { name: "Breakfast", calories: 400, items: ["Oatmeal with berries", "Greek yogurt", "Green tea"] },
        { name: "Lunch", calories: 500, items: ["Grilled chicken salad", "Quinoa", "Olive oil dressing"] },
        { name: "Snack", calories: 200, items: ["Apple with almond butter", "Water"] },
        { name: "Dinner", calories: 450, items: ["Baked salmon", "Steamed vegetables", "Brown rice"] },
        { name: "Post-workout", calories: 250, items: ["Protein shake", "Banana"] }
      ]
    },
    "muscle-gain": {
      name: "Muscle Building Plan",
      calories: 2800,
      protein: 210,
      carbs: 350,
      fat: 93,
      meals: [
        { name: "Breakfast", calories: 600, items: ["Scrambled eggs", "Whole grain toast", "Avocado"] },
        { name: "Lunch", calories: 700, items: ["Chicken breast", "Sweet potato", "Mixed vegetables"] },
        { name: "Snack", calories: 400, items: ["Protein smoothie", "Nuts", "Dates"] },
        { name: "Dinner", calories: 650, items: ["Lean beef", "Quinoa", "Green salad"] },
        { name: "Pre-bed", calories: 450, items: ["Cottage cheese", "Berries", "Almonds"] }
      ]
    },
    "maintenance": {
      name: "Maintenance Plan",
      calories: 2200,
      protein: 165,
      carbs: 275,
      fat: 73,
      meals: [
        { name: "Breakfast", calories: 450, items: ["Greek yogurt parfait", "Granola", "Fresh fruit"] },
        { name: "Lunch", calories: 550, items: ["Turkey sandwich", "Whole grain bread", "Side salad"] },
        { name: "Snack", calories: 300, items: ["Trail mix", "Herbal tea"] },
        { name: "Dinner", calories: 600, items: ["Grilled fish", "Roasted vegetables", "Wild rice"] },
        { name: "Evening", calories: 300, items: ["Dark chocolate", "Chamomile tea"] }
      ]
    }
  };

  return basePlans[goals as keyof typeof basePlans] || basePlans.maintenance;
};

export default function Nutrition() {
  const [selectedGoal, setSelectedGoal] = useState("maintenance");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [todayIntake, setTodayIntake] = useState({
    calories: 1650,
    protein: 120,
    carbs: 180,
    fat: 65
  });

  const mealPlan = useMemo(() => generateMealPlan(selectedGoal, activityLevel), [selectedGoal, activityLevel]);
  
  const macroData = [
    { name: 'Protein', value: todayIntake.protein * 4, color: COLORS[0] },
    { name: 'Carbs', value: todayIntake.carbs * 4, color: COLORS[1] },
    { name: 'Fat', value: todayIntake.fat * 9, color: COLORS[2] }
  ];

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90 && percentage <= 110) return "bg-green-500";
    if (percentage >= 80 && percentage <= 120) return "bg-yellow-500";
    return "bg-red-500";
  };

  const calculateCalorieNeeds = () => {
    // Simplified calculation based on activity level
    const baseCalories = {
      sedentary: 1800,
      light: 2000,
      moderate: 2200,
      active: 2500,
      very_active: 2800
    };
    return baseCalories[activityLevel as keyof typeof baseCalories] || 2200;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracking</h1>
          <p className="text-muted-foreground">AI-powered meal planning and calorie tracking</p>
        </div>
      </div>

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Daily Tracking</TabsTrigger>
          <TabsTrigger value="meal-plans">Meal Plans</TabsTrigger>
          <TabsTrigger value="goals">Goals & Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Daily Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.calories}</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.calories} goal</div>
                <Progress 
                  value={(todayIntake.calories / mealPlan.calories) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Protein</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.protein}g</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.protein}g goal</div>
                <Progress 
                  value={(todayIntake.protein / mealPlan.protein) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.carbs}g</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.carbs}g goal</div>
                <Progress 
                  value={(todayIntake.carbs / mealPlan.carbs) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayIntake.fat}g</div>
                <div className="text-xs text-muted-foreground">/ {mealPlan.fat}g goal</div>
                <Progress 
                  value={(todayIntake.fat / mealPlan.fat) * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Macro Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Macro Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {macroData.map((macro, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: macro.color }}
                        />
                        <span className="text-sm font-medium">{macro.name}</span>
                      </div>
                      <span className="text-sm">{macro.value} cal</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Add Food */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Add Food
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Input placeholder="Food name" />
                <Input placeholder="Calories" type="number" />
                <Input placeholder="Protein (g)" type="number" />
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Food
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meal-plans" className="space-y-6">
          {/* Meal Plan Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Plan: {mealPlan.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-3 rounded border">
                  <div className="text-2xl font-bold">{mealPlan.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>

              <div className="space-y-4">
                {mealPlan.meals.map((meal, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          {meal.name}
                        </span>
                        <Badge variant="outline">{meal.calories} cal</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        {meal.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Goals Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Nutrition Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goal">Primary Goal</Label>
                  <select 
                    id="goal"
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="activity">Activity Level</Label>
                  <select 
                    id="activity"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light Activity</option>
                    <option value="moderate">Moderate Activity</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Current Weight (kg)</Label>
                  <Input id="weight" type="number" placeholder="70" />
                </div>
                <div>
                  <Label htmlFor="target-weight">Target Weight (kg)</Label>
                  <Input id="target-weight" type="number" placeholder="65" />
                </div>
              </div>

              <Button className="gap-2">
                <Target className="h-4 w-4" />
                Update Goals
              </Button>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                AI Nutrition Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded bg-green-50 border border-green-200">
                <div className="font-medium text-green-800">Hydration</div>
                <div className="text-sm text-green-600">Increase water intake to 3L daily for optimal performance</div>
              </div>
              <div className="p-3 rounded bg-blue-50 border border-blue-200">
                <div className="font-medium text-blue-800">Pre-workout</div>
                <div className="text-sm text-blue-600">Add banana 30 minutes before training for better energy</div>
              </div>
              <div className="p-3 rounded bg-yellow-50 border border-yellow-200">
                <div className="font-medium text-yellow-800">Recovery</div>
                <div className="text-sm text-yellow-600">Include protein within 30 minutes post-workout</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
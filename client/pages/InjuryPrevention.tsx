import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { AlertTriangle, Shield, Activity, TrendingUp, Eye } from "lucide-react";
import { getAttempts, getEMGHistory } from "@/lib/storage";

const analyzeInjuryRisk = (attempts: any[], emgData: any[]) => {
  const recentAttempts = attempts.slice(0, 10);
  const avgFatigue = emgData.slice(0, 20).reduce((sum, d) => sum + d.fatigue, 0) / Math.max(emgData.length, 1);
  
  const risks = [];
  
  if (avgFatigue > 70) {
    risks.push({
      type: "High Fatigue",
      severity: "High",
      description: "Elevated muscle fatigue detected",
      recommendation: "Take 2-3 days rest before intense training"
    });
  }
  
  if (recentAttempts.length > 5) {
    const asymmetry = Math.random() * 30; // Mock asymmetry calculation
    if (asymmetry > 15) {
      risks.push({
        type: "Movement Asymmetry",
        severity: "Medium",
        description: `${asymmetry.toFixed(1)}% imbalance detected`,
        recommendation: "Focus on unilateral exercises and stretching"
      });
    }
  }
  
  const overuse = recentAttempts.filter(a => 
    Date.now() - a.timestamp < 24 * 60 * 60 * 1000
  ).length;
  
  if (overuse > 3) {
    risks.push({
      type: "Overuse Pattern",
      severity: "Medium",
      description: "High training frequency detected",
      recommendation: "Incorporate rest days and cross-training"
    });
  }
  
  return risks;
};

const generateMovementAnalysis = () => {
  return {
    posture: {
      score: 78,
      issues: ["Forward head posture", "Rounded shoulders"],
      improvements: ["Strengthen upper back", "Stretch chest muscles"]
    },
    balance: {
      score: 85,
      leftRight: { left: 48, right: 52 },
      stability: "Good"
    },
    mobility: {
      score: 72,
      restrictions: ["Hip flexors", "Ankle dorsiflexion"],
      recommendations: ["Dynamic warm-up", "Targeted stretching"]
    }
  };
};

export default function InjuryPrevention() {
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const attempts = useMemo(() => getAttempts(), []);
  const emgHistory = useMemo(() => getEMGHistory(), []);
  
  const injuryRisks = useMemo(() => analyzeInjuryRisk(attempts, emgHistory), [attempts, emgHistory]);
  const movementAnalysis = useMemo(() => generateMovementAnalysis(), []);
  
  const riskTrendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i + 1}`,
      risk: Math.max(0, 40 + Math.sin(i) * 20 + Math.random() * 10)
    }));
  }, []);

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "default";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Injury Prevention</h1>
          <p className="text-muted-foreground">AI-powered movement analysis and risk assessment</p>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Overall Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {injuryRisks.length === 0 ? "Low" : injuryRisks.some(r => r.severity === "High") ? "High" : "Medium"}
            </div>
            <Badge variant={injuryRisks.length === 0 ? "default" : "destructive"} className="mt-1">
              {injuryRisks.length} Risk{injuryRisks.length !== 1 ? "s" : ""} Found
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Movement Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(movementAnalysis.posture.score)}`}>
              {movementAnalysis.posture.score}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">Posture Analysis</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(movementAnalysis.balance.score)}`}>
              {movementAnalysis.balance.score}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              L/R: {movementAnalysis.balance.leftRight.left}%/{movementAnalysis.balance.leftRight.right}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Mobility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(movementAnalysis.mobility.score)}`}>
              {movementAnalysis.mobility.score}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">Range of Motion</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      {injuryRisks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Risk Factors
          </h2>
          {injuryRisks.map((risk, idx) => (
            <Alert key={idx} className={risk.severity === "High" ? "border-red-500" : "border-yellow-500"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {risk.type}
                      <Badge variant={getRiskColor(risk.severity)}>{risk.severity}</Badge>
                    </div>
                    <div className="text-sm mt-1">{risk.description}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedRisk(selectedRisk === risk.type ? null : risk.type)}
                  >
                    {selectedRisk === risk.type ? "Hide" : "View"} Details
                  </Button>
                </div>
                {selectedRisk === risk.type && (
                  <div className="mt-3 p-3 bg-muted rounded">
                    <div className="font-medium text-sm">Recommendation:</div>
                    <div className="text-sm">{risk.recommendation}</div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Injury Risk Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ risk: { label: "Risk Level", color: "hsl(var(--destructive))" } }}
            className="h-64"
          >
            <AreaChart data={riskTrendData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area 
                dataKey="risk" 
                type="monotone" 
                stroke="hsl(var(--destructive))" 
                fill="hsl(var(--destructive)/.2)" 
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Movement Analysis Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Posture Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Overall Score</span>
              <span className={`font-bold ${getScoreColor(movementAnalysis.posture.score)}`}>
                {movementAnalysis.posture.score}/100
              </span>
            </div>
            <Progress value={movementAnalysis.posture.score} />
            
            <div>
              <div className="text-sm font-medium mb-2">Issues Detected:</div>
              <ul className="text-sm space-y-1">
                {movementAnalysis.posture.issues.map((issue, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Improvements:</div>
              <ul className="text-sm space-y-1">
                {movementAnalysis.posture.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Balance Score</span>
              <span className={`font-bold ${getScoreColor(movementAnalysis.balance.score)}`}>
                {movementAnalysis.balance.score}/100
              </span>
            </div>
            <Progress value={movementAnalysis.balance.score} />
            
            <div>
              <div className="text-sm font-medium mb-2">Left/Right Distribution:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded border">
                  <div className="text-lg font-bold">{movementAnalysis.balance.leftRight.left}%</div>
                  <div className="text-xs text-muted-foreground">Left</div>
                </div>
                <div className="text-center p-2 rounded border">
                  <div className="text-lg font-bold">{movementAnalysis.balance.leftRight.right}%</div>
                  <div className="text-xs text-muted-foreground">Right</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Stability: {movementAnalysis.balance.stability}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobility Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Mobility Score</span>
              <span className={`font-bold ${getScoreColor(movementAnalysis.mobility.score)}`}>
                {movementAnalysis.mobility.score}/100
              </span>
            </div>
            <Progress value={movementAnalysis.mobility.score} />
            
            <div>
              <div className="text-sm font-medium mb-2">Restrictions:</div>
              <ul className="text-sm space-y-1">
                {movementAnalysis.mobility.restrictions.map((restriction, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Recommendations:</div>
              <ul className="text-sm space-y-1">
                {movementAnalysis.mobility.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
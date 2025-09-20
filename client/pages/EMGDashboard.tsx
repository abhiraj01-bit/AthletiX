import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts";
import { useEMG } from "@/hooks/useEMG";
import { Activity, Battery, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function EMGDashboard() {
  const { emgData, emgHistory, device, isConnecting, connectDevice, disconnectDevice } = useEMG();

  const chartData = useMemo(() => {
    return emgHistory.map((reading, index) => ({
      time: index,
      emg: reading.emg,
      muscleActivity: reading.muscleActivity,
      fatigue: reading.fatigue,
      activated: reading.activated ? 100 : 0
    }));
  }, [emgHistory]);

  const getActivityLevel = (activity: number) => {
    if (activity > 70) return { level: "High", color: "bg-red-500" };
    if (activity > 40) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "Low", color: "bg-green-500" };
  };

  const getFatigueStatus = (fatigue: number) => {
    if (fatigue > 70) return { status: "High Risk", variant: "destructive" as const };
    if (fatigue > 40) return { status: "Moderate", variant: "secondary" as const };
    return { status: "Low", variant: "default" as const };
  };

  const activityLevel = getActivityLevel(emgData.muscleActivity);
  const fatigueStatus = getFatigueStatus(emgData.fatigue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">EMG Dashboard</h1>
          <p className="text-muted-foreground">Real-time muscle activity monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/emg-connection">Arduino Setup</Link>
          </Button>
          <Button 
            onClick={device.connected ? disconnectDevice : () => {}}
            variant={device.connected ? "secondary" : "default"}
            disabled={!device.connected}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            {device.connected ? "Disconnect" : "Not Connected"}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Raw EMG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.emg}</div>
            <div className="text-xs text-muted-foreground">0-1023 range</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Muscle Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.muscleActivity.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-2 rounded-full ${activityLevel.color}`} />
              <span className="text-xs text-muted-foreground">{activityLevel.level}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Fatigue Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.fatigue.toFixed(1)}%</div>
            <Badge variant={fatigueStatus.variant} className="mt-1">
              {fatigueStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Activation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emgData.activated ? "ACTIVE" : "REST"}</div>
            <div className={`h-2 w-full rounded-full mt-2 ${emgData.activated ? "bg-green-500" : "bg-gray-300"}`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Device Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{device.connected ? "Connected" : "Offline"}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {device.port || "No port"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Raw EMG Signal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1023]} />
                  <Line 
                    dataKey="emg" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Muscle Activity %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Area 
                    dataKey="muscleActivity" 
                    stroke="#16a34a" 
                    fill="#16a34a"
                    fillOpacity={0.3}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fatigue Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Line 
                    dataKey="fatigue" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Area 
                    dataKey="activated" 
                    stroke="#7c3aed" 
                    fill="#7c3aed"
                    fillOpacity={0.3}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Data Info */}
      <Card>
        <CardHeader>
          <CardTitle>Live Data Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Data Points</div>
              <div className="text-muted-foreground">{emgHistory.length}/50</div>
            </div>
            <div>
              <div className="font-medium">Update Rate</div>
              <div className="text-muted-foreground">10 Hz</div>
            </div>
            <div>
              <div className="font-medium">Last Update</div>
              <div className="text-muted-foreground">
                {new Date(emgData.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <div>
              <div className="font-medium">Connection</div>
              <div className={device.connected ? "text-green-600" : "text-red-600"}>
                {device.connected ? "Active" : "Disconnected"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emgData.fatigue > 70 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
              <div className="font-medium text-red-800 dark:text-red-200">High Fatigue Detected</div>
              <div className="text-sm text-red-600 dark:text-red-300">Consider taking a rest break to prevent injury.</div>
            </div>
          )}
          
          {emgData.muscleActivity < 30 && device.connected && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">Low Muscle Activation</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-300">Check sensor placement or increase exercise intensity.</div>
            </div>
          )}
          
          {emgData.muscleActivity > 80 && emgData.fatigue < 40 && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
              <div className="font-medium text-green-800 dark:text-green-200">Optimal Performance</div>
              <div className="text-sm text-green-600 dark:text-green-300">Great muscle activation with low fatigue. Keep it up!</div>
            </div>
          )}

          {!device.connected && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <div className="font-medium text-blue-800 dark:text-blue-200">Connect Arduino EMG Sensor</div>
              <div className="text-sm text-blue-600 dark:text-blue-300">
                <Link to="/emg-connection" className="underline">Set up your Arduino</Link> to start monitoring muscle activity.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
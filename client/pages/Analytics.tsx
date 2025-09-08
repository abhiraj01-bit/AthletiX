import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getAttempts } from "@/lib/storage";
import { Link } from "react-router-dom";

const TESTS = [
  { key: "verticalJump", label: "Vertical Jump", unit: "cm", field: "jumpHeightCm" },
  { key: "sitUps", label: "Sit-ups", unit: "reps", field: "reps" },
  { key: "shuttleRun", label: "Shuttle Run", unit: "laps", field: "laps" },
  { key: "enduranceRun", label: "Endurance Run", unit: "km", field: "distanceKm" },
] as const;

type TestKey = typeof TESTS[number]["key"];

type Point = { date: string; value: number };

type Bench = { label: string; value: number };

const BENCHMARKS: Record<TestKey, Bench[]> = {
  verticalJump: [
    { label: "Good", value: 35 },
    { label: "District Elite", value: 45 },
    { label: "State Level", value: 55 },
    { label: "National Standard", value: 65 },
  ],
  sitUps: [
    { label: "Good", value: 20 },
    { label: "District Elite", value: 35 },
    { label: "State Level", value: 45 },
    { label: "National Standard", value: 55 },
  ],
  shuttleRun: [
    { label: "Good", value: 8 },
    { label: "District Elite", value: 12 },
    { label: "State Level", value: 16 },
    { label: "National Standard", value: 20 },
  ],
  enduranceRun: [
    { label: "Good", value: 2 },
    { label: "District Elite", value: 3 },
    { label: "State Level", value: 4 },
    { label: "National Standard", value: 5 },
  ],
};

export default function Analytics() {
  const [active, setActive] = useState<TestKey>("verticalJump");
  const attempts = useMemo(() => getAttempts(), []);

  const series = useMemo<Point[]>(() => {
    const meta = TESTS.find((t) => t.key === active)!;
    const points = attempts
      .filter((a) => a.test === active)
      .map((a) => ({
        date: new Date(a.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: Number(a.data?.[meta.field] ?? 0),
      }))
      .filter((d) => !Number.isNaN(d.value) && d.value > 0)
      .reverse();
    if (points.length) return points;
    // Fallback sample data if user has no attempts yet
    return Array.from({ length: 8 }, (_, i) => ({ date: `D${i + 1}`, value: 20 + i * 4 + Math.round(Math.random() * 4) }));
  }, [attempts, active]);

  const meta = TESTS.find((t) => t.key === active)!;
  const last = series.at(-1)?.value ?? 0;
  const best = Math.max(...series.map((p) => p.value));
  const avg7 = Math.round(series.slice(-7).reduce((s, p) => s + p.value, 0) / Math.min(7, series.length));
  const trendSlope = linearSlope(series.map((p, i) => [i, p.value]));
  const projection = Math.round(last + trendSlope * 8); // ~2 months if 1 point/week

  const bench = BENCHMARKS[active];
  const nextTarget = bench.find((b) => b.value > last) ?? bench.at(-1)!;

  const mini = useMemo(() =>
    TESTS.map((t) => ({
      key: t.key,
      label: t.label,
      unit: t.unit,
      data: attempts
        .filter((a) => a.test === t.key)
        .map((a) => ({ x: new Date(a.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }), y: Number(a.data?.[t.field] ?? 0) }))
        .filter((d) => d.y > 0)
        .slice(-6),
    })),
  [attempts]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Athlete Analytics</span>
              <Tabs value={active} onValueChange={(v) => setActive(v as TestKey)}>
                <TabsList className="grid grid-cols-2 md:grid-cols-4">
                  {TESTS.map((t) => (
                    <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <Stat title="Personal Best" value={`${best} ${meta.unit}`} />
            <Stat title="Last Attempt" value={`${last} ${meta.unit}`} />
            <Stat title="7-day Avg" value={`${avg7 || 0} ${meta.unit}`} />
            <Stat title="Projection (8w)" value={`${projection} ${meta.unit}`} />
            <div className="md:col-span-4">
              <ChartContainer config={{ value: { label: meta.label, color: "hsl(var(--brand-500))" } }} className="h-64">
                <AreaChart data={series}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area dataKey="value" type="monotone" stroke="hsl(var(--brand-500))" fill="hsl(var(--brand-500)/.2)" />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benchmark Comparison</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <ChartContainer config={{ you: { label: "You", color: "hsl(var(--brand-500))" } }} className="h-64">
                <BarChart data={bench.map((b) => ({ name: b.label, target: b.value, you: last }))}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="target" fill="hsl(var(--muted-foreground)/.3)" radius={6} />
                  <Bar dataKey="you" fill="hsl(var(--brand-500))" radius={6} />
                </BarChart>
              </ChartContainer>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Next target</div>
              <div className="text-2xl font-semibold">{nextTarget.label}</div>
              <div className="text-sm">Reach {nextTarget.value} {meta.unit}. You're at {last}.</div>
              <Button asChild variant="secondary" className="mt-2"><Link to="/tests">Practice now</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Coach Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Suggestion text="Add 3x plyometric sets (box jumps) twice this week." />
            <Suggestion text="Focus on core bracing; 2-minute planks daily." />
            <Suggestion text="Tempo runs at 80% pace for 15 minutes." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mini Trends</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            {mini.map((m) => (
              <div key={m.key} className="rounded-lg border p-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{m.label}</span>
                  {m.data.length ? <Badge variant="secondary">{m.data.at(-1)!.y} {TESTS.find(t=>t.key===m.key)!.unit}</Badge> : <Badge variant="outline">No data</Badge>}
                </div>
                <ChartContainer config={{ y: { label: m.label, color: "hsl(var(--brand-400))" } }} className="h-20">
                  <AreaChart data={m.data.map((d) => ({ date: d.x, value: d.y }))}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Area dataKey="value" type="monotone" stroke="hsl(var(--brand-400))" fill="hsl(var(--brand-400)/.2)" />
                  </AreaChart>
                </ChartContainer>
              </div>
            ))}
          </CardContent>
        </Card>

        {!attempts.length && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              No attempts yet. Head to Tests to record your first assessment.
              <div className="mt-3"><Button asChild><Link to="/tests">Go to Tests</Link></Button></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function linearSlope(points: Array<[number, number]>): number {
  const n = points.length;
  if (n < 2) return 0;
  const sumX = points.reduce((s, [x]) => s + x, 0);
  const sumY = points.reduce((s, [, y]) => s + y, 0);
  const sumXY = points.reduce((s, [x, y]) => s + x * y, 0);
  const sumXX = points.reduce((s, [x]) => s + x * x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (!denom) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

function Suggestion({ text }: { text: string }) {
  return <div className="rounded-md border p-2">{text}</div>;
}

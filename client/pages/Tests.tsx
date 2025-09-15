import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { saveAttempt } from "@/lib/storage";
import { Camera, Film, Loader2, Play, RefreshCcw, Upload, Watch } from "lucide-react";
import { useI18n } from "@/components/common/LanguageProvider";
import { useEMG } from "@/hooks/useEMG";
import { TestInstructions } from "@/components/TestInstructions";

const tests = [
  { key: "verticalJump", name: "Vertical Jump", setup: "Place phone at knee height, side view." },
  { key: "sitUps", name: "Sit-ups", setup: "Place phone at chest level, front view." },
  { key: "pushUps", name: "Push-ups", setup: "Place phone at side angle, capture full body." },
  { key: "pullUps", name: "Pull-ups", setup: "Mount phone to capture full pull-up motion." },
  { key: "shuttleRun", name: "Shuttle Run", setup: "Keep phone stable, wide view of running lane." },
  { key: "enduranceRun", name: "Endurance Run", setup: "Wear TalentBand for pace. Use outdoor light." },
  { key: "flexibilityTest", name: "Flexibility Test", setup: "Place phone to capture full range of motion." },
  { key: "agilityLadder", name: "Agility Ladder", setup: "Position phone to capture ladder footwork pattern." },
  { key: "heightWeight", name: "Height/Weight", setup: "Enter details manually or scan from device." },
] as const;

type TestKey = typeof tests[number]["key"];

export default function Tests() {
  const { t: translate } = useI18n();
  const [selected, setSelected] = useState<TestKey>("verticalJump");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { emgData, device, isConnecting, connectDevice, disconnectDevice, saveEMGReading } = useEMG();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      setStream(s);
      setVideoURL(null);
      setCountdown(3);
      const v = videoRef.current;
      if (v) v.srcObject = s;
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c === null) return c;
          if (c <= 1) {
            clearInterval(interval);
            beginRecording();
            return null;
          }
          return c - 1;
        });
      }, 1000);
    } catch (e) {
      alert("Camera not available. Grant permission or try Upload.");
    }
  };

  const beginRecording = () => {
    if (!stream) return;
    const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      setRecording(false);
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const onUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoURL(url);
  };

  const analyze = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    const result = mockAI(selected);
    const attemptData = { 
      id: crypto.randomUUID(), 
      test: selected, 
      timestamp: Date.now(), 
      data: result,
      emgData: device.connected ? emgData : undefined
    };
    saveAttempt(attemptData);
    alert(`${translate("results")}: ${JSON.stringify({...result, emg: emgData})}`);
  };

  const mockAI = (key: TestKey) => {
    switch (key) {
      case "verticalJump":
        return { jumpHeightCm: 42 + Math.floor(Math.random() * 20), badge: pickBadge() };
      case "sitUps":
        return { reps: 25 + Math.floor(Math.random() * 20), badge: pickBadge() };
      case "pushUps":
        return { reps: 15 + Math.floor(Math.random() * 25), formScore: 85 + Math.floor(Math.random() * 15), badge: pickBadge() };
      case "pullUps":
        return { reps: 5 + Math.floor(Math.random() * 15), gripStrength: 70 + Math.floor(Math.random() * 30), badge: pickBadge() };
      case "shuttleRun":
        return { laps: 10 + Math.floor(Math.random() * 10), timeSec: 60 + Math.floor(Math.random() * 30), badge: pickBadge() };
      case "enduranceRun":
        return { distanceKm: 2 + Math.random() * 3, pace: (5 + Math.random() * 2).toFixed(2), badge: pickBadge() };
      case "flexibilityTest":
        return { reachCm: 15 + Math.floor(Math.random() * 25), flexibilityScore: 60 + Math.floor(Math.random() * 40), badge: pickBadge() };
      case "agilityLadder":
        return { completionTime: 8 + Math.random() * 4, footworkScore: 75 + Math.floor(Math.random() * 25), badge: pickBadge() };
      case "heightWeight":
        return { heightCm: 165 + Math.floor(Math.random() * 20), weightKg: 50 + Math.floor(Math.random() * 20), badge: pickBadge() };
    }
  };

  const pickBadge = () => {
    const all = ["Good", "District Elite", "State Level", "National Standard"] as const;
    return all[Math.floor(Math.random() * all.length)];
  };

  const pairDevice = async () => {
    try {
      await connectDevice();
    } catch (error) {
      console.error('Failed to pair EMG device:', error);
    }
  };

  const selectedMeta = useMemo(() => tests.find((t) => t.key === selected)!, [selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedMeta.name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Watch className="h-4 w-4" /> 30-90s
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Tabs value={selected} onValueChange={(v) => setSelected(v as TestKey)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 w-full overflow-x-auto">
                {tests.map((test) => (
                  <TabsTrigger key={test.key} value={test.key} className="text-xs whitespace-nowrap">
                    {test.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tests.map((test) => (
                <TabsContent key={test.key} value={test.key}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      {!videoURL ? (
                        <div className="aspect-video rounded-lg bg-gradient-to-br from-brand-900/20 via-brand-700/10 to-transparent border grid place-content-center text-center">
                          <div>
                            <div className="text-sm text-muted-foreground mb-2">Instruction</div>
                            <p className="font-medium">{test.setup}</p>
                            <div className="mt-4 text-xs text-muted-foreground">Animated demo coming soon</div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <video ref={videoRef} src={videoURL || undefined} controls className="w-full rounded-lg border" />
                          <div className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-1 rounded">
                            AthletiX · {new Date().toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="text-sm text-muted-foreground">{translate("startTest")}</div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={startCamera} className="gap-2"><Camera className="h-4 w-4" /> {translate("record")}</Button>
                        <label className="inline-flex">
                          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
                          <Button variant="secondary" className="gap-2" asChild>
                            <span><Upload className="h-4 w-4" /> {translate("upload")}</span>
                          </Button>
                        </label>
                        {recording && (
                          <Button variant="destructive" onClick={stopRecording} className="gap-2"><SquareIcon /> Stop</Button>
                        )}
                        {videoURL && (
                          <Button variant="outline" onClick={() => setVideoURL(null)} className="gap-2"><RefreshCcw className="h-4 w-4" /> Retake</Button>
                        )}
                      </div>

                      {countdown !== null && (
                        <div className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Starting in {countdown}…</div>
                      )}

                      <div className="mt-2">
                        <div className="text-sm mb-1">Quality checks</div>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                          <li>Ensure good lighting</li>
                          <li>Keep full body in frame</li>
                          <li>Stable phone position</li>
                        </ul>
                      </div>

                      <div className="mt-auto flex gap-2">
                        <Button onClick={analyze} className="gap-2"><Play className="h-4 w-4" /> Analyze</Button>
                        <Button variant="ghost" className="gap-2"><Film className="h-4 w-4" /> Highlights</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {["pushUps", "pullUps", "flexibilityTest", "agilityLadder"].includes(selected) && (
          <TestInstructions testKey={selected} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">EMG Coaching</div>
              <ul className="text-sm space-y-2">
                <li>Muscle activation: {emgData.activated ? 'Optimal' : 'Increase engagement'}</li>
                <li>Fatigue level: {emgData.fatigue > 70 ? 'High - rest needed' : 'Good to continue'}</li>
                <li>Form analysis: {emgData.muscleActivity > 60 ? 'Strong activation' : 'Focus on muscle engagement'}</li>
              </ul>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Benchmark</div>
              <div className="flex flex-wrap gap-2">
                {["Good", "District Elite", "State Level", "National Standard"].map((b) => (
                  <Badge key={b} variant="secondary">{b}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">EMG Analysis</div>
              <div className="text-sm">
                {emgData.muscleActivity > 80 ? 'High performance detected' : 
                 emgData.muscleActivity > 40 ? 'Normal muscle activity' : 
                 'Low activation - check sensor placement'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>EMG Sensor</span>
              <span className="text-xs text-muted-foreground">{device.connected ? `Battery ${device.battery ?? "--"}%` : "Not paired"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusDot state={device.connected ? "connected" : isConnecting ? "connecting" : "disconnected"} />
              <span className="text-sm">{device.connected ? "Connected" : isConnecting ? "Connecting" : "Disconnected"}</span>
            </div>
            <Button onClick={device.connected ? disconnectDevice : pairDevice} variant={device.connected ? "secondary" : "default"} className="gap-2" disabled={isConnecting}>
              <Watch className="h-4 w-4" /> {device.connected ? "Disconnect" : "Pair"} EMG Sensor
            </Button>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Live Metrics</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Metric label="Muscle Activity" value={`${emgData.muscleActivity.toFixed(1)}%`} />
                <Metric label="Fatigue Level" value={`${emgData.fatigue.toFixed(1)}%`} />
                <Metric label="Status" value={emgData.activated ? "ACTIVE" : "REST"} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Vertical Jump</span>
              <Badge>Good</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Sit-ups</span>
              <Badge variant="secondary">State Level</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Shuttle Run</span>
              <Badge variant="outline">District Elite</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={80} />
            <div className="mt-2 text-xs text-muted-foreground">AI estimates you're ready to beat your PB today</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusDot({ state }: { state: "disconnected" | "connecting" | "connected" }) {
  const color = state === "connected" ? "bg-emerald-400" : state === "connecting" ? "bg-amber-400" : "bg-gray-400";
  return <span className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`} />;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

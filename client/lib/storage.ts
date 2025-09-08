export type Attempt = {
  id: string;
  test: "verticalJump" | "sitUps" | "shuttleRun" | "enduranceRun" | "heightWeight";
  timestamp: number;
  data: Record<string, any>;
};

const KEY = "tt360_attempts";

export function saveAttempt(a: Attempt) {
  const list = getAttempts();
  list.unshift(a);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}

export function getAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getWeeklyCompletion(): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = getAttempts().filter((a) => a.timestamp >= weekAgo);
  const uniqueTests = new Set(recent.map((a) => a.test)).size;
  return Math.min(100, Math.round((uniqueTests / 5) * 100));
}

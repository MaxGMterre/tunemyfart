const LIMITS: Record<string, { max: number; windowMs: number }> = {
  save_recording: { max: 20, windowMs: 3_600_000 },
  supabase_query: { max: 100, windowMs: 60_000 },
  feedback: { max: 3, windowMs: 3_600_000 },
};

export function checkRateLimit(action: string): boolean {
  const limit = LIMITS[action];
  if (!limit) return true;
  const key = `tmf_rl_${action}`;
  const now = Date.now();
  const raw = localStorage.getItem(key);
  const timestamps: number[] = raw ? JSON.parse(raw) : [];
  const recent = timestamps.filter(t => now - t < limit.windowMs);
  if (recent.length >= limit.max) return false;
  recent.push(now);
  localStorage.setItem(key, JSON.stringify(recent));
  return true;
}

export function getRemainingCalls(action: string): number {
  const limit = LIMITS[action];
  if (!limit) return Infinity;
  const key = `tmf_rl_${action}`;
  const now = Date.now();
  const raw = localStorage.getItem(key);
  const timestamps: number[] = raw ? JSON.parse(raw) : [];
  const recent = timestamps.filter(t => now - t < limit.windowMs);
  return Math.max(0, limit.max - recent.length);
}

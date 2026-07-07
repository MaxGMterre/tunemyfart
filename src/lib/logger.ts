import { supabase } from "./supabase";

const LOG_KEY = "tmf_logs_enabled";
const RATE_KEY = "tmf_log_timestamps";
const MAX_PER_MINUTE = 10;

export function isLoggingEnabled(): boolean {
  return localStorage.getItem(LOG_KEY) !== "false";
}
export function setLoggingEnabled(v: boolean) {
  localStorage.setItem(LOG_KEY, String(v));
}

function isRateLimited(): boolean {
  const now = Date.now();
  const raw = localStorage.getItem(RATE_KEY);
  const timestamps: number[] = raw ? JSON.parse(raw) : [];
  const recent = timestamps.filter(t => now - t < 60_000);
  if (recent.length >= MAX_PER_MINUTE) return true;
  recent.push(now);
  localStorage.setItem(RATE_KEY, JSON.stringify(recent));
  return false;
}

export async function logError(message: string, details?: Record<string, unknown>) {
  if (!isLoggingEnabled() || isRateLimited()) return;
  try {
    await supabase.from("client_logs").insert({
      level: "error", message: message.slice(0, 500),
      metadata: details ?? null,
      user_agent: navigator.userAgent.slice(0, 200),
    });
  } catch { /* silent */ }
}

export async function logEvent(event: string, metadata?: Record<string, unknown>) {
  if (!isLoggingEnabled() || isRateLimited()) return;
  try {
    await supabase.from("client_logs").insert({
      level: "info", message: event,
      metadata: metadata ?? null,
      user_agent: null,
    });
  } catch { /* silent */ }
}

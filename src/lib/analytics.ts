import { supabase } from "./supabase";

const ANALYTICS_KEY = "tmf_analytics_enabled";
const SESSION_ID = Math.random().toString(36).slice(2, 10);

export type AnalyticsEvent =
  | "app_open"
  | "tab_change"
  | "recording_start"
  | "recording_complete"
  | "recording_saved"
  | "mission_unlocked"
  | "share_opened"
  | "settings_opened"
  | "profile_completed"
  | "daily_challenge_claimed"
  | "friend_added"
  | "onboarding_completed";

interface EventPayload {
  event_type: AnalyticsEvent;
  event_data?: Record<string, unknown>;
  session_id: string;
}

const queue: EventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function isEnabled(): boolean {
  return localStorage.getItem(ANALYTICS_KEY) === "true";
}

async function flush() {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  try {
    await supabase.from("analytics_events").insert(batch);
  } catch {
    // Analytics failures are silently ignored
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, 30_000);
}

export function track(event: AnalyticsEvent, data?: Record<string, unknown>) {
  if (!isEnabled()) return;
  queue.push({ event_type: event, event_data: data, session_id: SESSION_ID });
  if (queue.length >= 10) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    flush();
  } else {
    scheduleFlush();
  }
}

export function setAnalyticsEnabled(enabled: boolean) {
  localStorage.setItem(ANALYTICS_KEY, enabled ? "true" : "false");
  if (!enabled) queue.splice(0, queue.length);
}

export function isAnalyticsEnabled(): boolean {
  return isEnabled();
}

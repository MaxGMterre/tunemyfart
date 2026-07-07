const SEEN_KEY = "tmf_seen_tooltips";

function getSeenSet(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]")); }
  catch { return new Set(); }
}
function markSeen(id: string) {
  const s = getSeenSet(); s.add(id);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
}
export function shouldShowTooltip(id: string): boolean {
  return !getSeenSet().has(id);
}
export function dismissTooltip(id: string) { markSeen(id); }
export function resetTooltips() { localStorage.removeItem(SEEN_KEY); }

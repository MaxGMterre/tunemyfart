import { SOUNDS_PREF_KEY } from "./constants";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx || ctx.state === "closed") {
    ctx = new AudioContext();
  }
  return ctx;
}

function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUNDS_PREF_KEY) !== "false";
}

function playTone(
  frequency: number,
  type: OscillatorType,
  durationMs: number,
  gainStart: number,
  gainEnd: number,
  delayMs = 0
): void {
  if (!isSoundEnabled()) return;
  try {
    const ac = getCtx();
    if (ac.state === "suspended") ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delayMs / 1000);

    gain.gain.setValueAtTime(0, ac.currentTime);
    gain.gain.setValueAtTime(gainStart, ac.currentTime + delayMs / 1000);
    gain.gain.linearRampToValueAtTime(
      gainEnd,
      ac.currentTime + (delayMs + durationMs) / 1000
    );

    osc.start(ac.currentTime + delayMs / 1000);
    osc.stop(ac.currentTime + (delayMs + durationMs + 10) / 1000);
  } catch {
    // AudioContext not available (e.g. SSR or restricted env)
  }
}

export const SFX = {
  click(): void {
    playTone(880, "square", 40, 0.12, 0);
  },

  unlock(): void {
    // Rising arpeggio: C5 → E5 → G5
    playTone(523, "sine", 120, 0.25, 0, 0);
    playTone(659, "sine", 120, 0.25, 0, 100);
    playTone(784, "sine", 200, 0.3, 0, 200);
  },

  error(): void {
    // Descending minor — D4 → C4
    playTone(294, "sawtooth", 120, 0.2, 0, 0);
    playTone(261, "sawtooth", 180, 0.18, 0, 100);
  },

  success(): void {
    // Short triumphant chord swell
    playTone(523, "sine", 300, 0.2, 0, 0);
    playTone(659, "sine", 300, 0.15, 0, 0);
    playTone(784, "sine", 300, 0.12, 0, 0);
    playTone(1047, "sine", 400, 0.18, 0, 80);
  },

  mrProutAppear(): void {
    // Whimsical: portamento squeak up
    try {
      if (!isSoundEnabled()) return;
      const ac = getCtx();
      if (ac.state === "suspended") ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.3);
      gain.gain.setValueAtTime(0.18, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.35);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.4);
    } catch {
      // ignore
    }
  },

  recordStart(): void {
    // Low thump
    playTone(80, "sine", 80, 0.3, 0);
    playTone(160, "sine", 60, 0.1, 0, 20);
  },

  recordStop(): void {
    // Click + descend
    playTone(440, "square", 30, 0.15, 0);
    playTone(220, "sine", 80, 0.1, 0, 40);
  },

  noteHit(frequency: number): void {
    try {
      if (!isSoundEnabled()) return;
      const ac = getCtx();
      if (ac.state === "suspended") ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, ac.currentTime);
      gain.gain.setValueAtTime(0.22, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.65);
    } catch {
      // ignore
    }
  },
};

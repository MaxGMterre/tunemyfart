type AmbientLevel = "off" | "subtle" | "immersive";
const AMBIENT_KEY = "tmf_ambient_level";

// ── Singleton AudioContext ────────────────────────────────────────────────────

let ctx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

// ── Interval / source handles ─────────────────────────────────────────────────

let tickInterval: ReturnType<typeof setInterval> | null = null;
let noiseSource: AudioBufferSourceNode | null = null;
let crackleTimeout: ReturnType<typeof setTimeout> | null = null;

// ── Tick (tic-tac) ────────────────────────────────────────────────────────────

function playTick(context: AudioContext): void {
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = "triangle";
  osc.frequency.value = 800;

  gain.gain.setValueAtTime(0.25, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.008);

  osc.connect(gain);
  gain.connect(context.destination);

  osc.start(context.currentTime);
  osc.stop(context.currentTime + 0.008);
}

function startTick(context: AudioContext): void {
  if (tickInterval !== null) return;
  playTick(context);
  tickInterval = setInterval(() => playTick(context), 2000);
}

function stopTick(): void {
  if (tickInterval !== null) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

// ── White noise + bandpass filter (candle crackle) ───────────────────────────

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const sampleRate = context.sampleRate;
  const duration = 2; // seconds
  const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function startNoise(context: AudioContext): void {
  if (noiseSource !== null) return;

  const buffer = createNoiseBuffer(context);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1100; // midpoint of 200-2000 Hz
  filter.Q.value = 0.5;

  const gain = context.createGain();
  gain.gain.value = 0.03;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  source.start();
  noiseSource = source;
}

function stopNoise(): void {
  if (noiseSource !== null) {
    try {
      noiseSource.stop();
    } catch {
      // already stopped
    }
    noiseSource = null;
  }
}

// ── Occasional wood creak ─────────────────────────────────────────────────────

function playWoodCreak(context: AudioContext): void {
  const buffer = context.createBuffer(1, context.sampleRate * 0.3, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * 0.1));
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 200;

  const gain = context.createGain();
  gain.gain.value = 0.08;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  source.start();
}

function scheduleCrackle(context: AudioContext): void {
  const delay = 8000 + Math.random() * 7000; // 8-15 seconds
  crackleTimeout = setTimeout(() => {
    if (ctx && ctx.state === "running") {
      playWoodCreak(context);
      scheduleCrackle(context);
    }
  }, delay);
}

function stopCrackle(): void {
  if (crackleTimeout !== null) {
    clearTimeout(crackleTimeout);
    crackleTimeout = null;
  }
}

// ── Internal start/stop by level ──────────────────────────────────────────────

function applyLevel(level: AmbientLevel): void {
  if (level === "off") {
    stopTick();
    stopNoise();
    stopCrackle();
    if (ctx) {
      ctx.suspend();
    }
    return;
  }

  const context = getContext();
  context.resume().then(() => {
    if (level === "subtle") {
      stopNoise();
      stopCrackle();
      startTick(context);
    } else if (level === "immersive") {
      startTick(context);
      startNoise(context);
      if (crackleTimeout === null) {
        scheduleCrackle(context);
      }
    }
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getAmbientLevel(): AmbientLevel {
  const stored = localStorage.getItem(AMBIENT_KEY);
  if (stored === "subtle" || stored === "immersive") return stored;
  return "off";
}

export function setAmbientLevel(level: AmbientLevel): void {
  localStorage.setItem(AMBIENT_KEY, level);
  // Reset running sounds before applying new level
  stopTick();
  stopNoise();
  stopCrackle();
  applyLevel(level);
}

export function startAmbient(): void {
  const level = getAmbientLevel();
  if (level !== "off") {
    applyLevel(level);
  }
}

export function stopAmbient(): void {
  stopTick();
  stopNoise();
  stopCrackle();
  if (ctx) {
    ctx.suspend();
  }
}

export function handleVisibilityChange(): void {
  if (document.hidden) {
    stopAmbient();
  } else {
    startAmbient();
  }
}

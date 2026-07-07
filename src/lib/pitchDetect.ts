// Coeur d'analyse audio — détection de fréquence fondamentale par autocorrélation
// Pas de dépendance UI : peut être testé/réutilisé indépendamment de l'apparence.

const NOTE_NAMES = [
  "Do",
  "Do#",
  "Ré",
  "Ré#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];

export interface NoteResult {
  frequency: number; // Hz
  note: string; // ex: "La#"
  octave: number;
  midi: number;
  cents: number; // écart en centièmes de ton par rapport à la note exacte
}

/**
 * Détection de fréquence fondamentale par autocorrélation (méthode ACF).
 * Plus robuste que la FFT brute pour un signal court et bruité comme un pet.
 * Retourne 0 si aucun pitch fiable n'est détecté (signal trop faible/bruité).
 */
export function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number
): number {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return 0; // trop silencieux, pas de pitch fiable

  // Recherche des bornes utiles du signal (ignorer le silence en début/fin)
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmed = buffer.slice(r1, r2);
  const newSize = trimmed.length;

  const c = new Array(newSize).fill(0);
  for (let i = 0; i < newSize; i++) {
    for (let j = 0; j < newSize - i; j++) {
      c[i] += trimmed[j] * trimmed[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }

  if (maxPos <= 0) return 0;

  let T0 = maxPos;
  // interpolation parabolique pour affiner la précision
  const x1 = c[T0 - 1] ?? c[T0];
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? c[T0];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  const frequency = sampleRate / T0;

  // borne plausible pour un son humain (grave très bas à aigu très haut)
  if (frequency < 20 || frequency > 4000) return 0;

  return frequency;
}

/** Convertit une fréquence en note de musique (notation française), avec octave et écart en cents. */
export function frequencyToNote(frequency: number): NoteResult | null {
  if (!frequency || frequency <= 0) return null;

  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);

  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;

  return {
    frequency,
    note: NOTE_NAMES[noteIndex],
    octave,
    midi,
    cents,
  };
}

/** Calcule le niveau RMS d'un buffer, puis le convertit en dB relatif (échelle maison, à calibrer). */
export function computeDecibels(buffer: Float32Array): number {
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / buffer.length);
  if (rms === 0) return -100;
  const db = 20 * Math.log10(rms);
  return Math.max(db, -100);
}

/** Réduit un grand tableau d'amplitudes à N points pour stockage/affichage de la courbe. */
export function downsampleWaveform(
  buffer: Float32Array,
  targetPoints = 200
): number[] {
  const blockSize = Math.floor(buffer.length / targetPoints);
  if (blockSize <= 0) return Array.from(buffer);
  const result: number[] = [];
  for (let i = 0; i < targetPoints; i++) {
    const start = i * blockSize;
    let max = 0;
    for (let j = 0; j < blockSize; j++) {
      const v = Math.abs(buffer[start + j] ?? 0);
      if (v > max) max = v;
    }
    result.push(max);
  }
  return result;
}

// ── Enhanced DSP ──────────────────────────────────────────

export type TimbreCategory =
  | "Cristallin"
  | "Boisé"
  | "Métallique"
  | "Terreux"
  | "Aérien"
  | "Nasal"
  | "Rocailleux"
  | "Ombragé";

export type EmotionCategory =
  | "Confiant"
  | "Timide"
  | "Explosif"
  | "Méditatif"
  | "Malicieux"
  | "Solennel";

export interface TimbreResult {
  category: TimbreCategory;
  centroid: number;
  spread: number;
  flatness: number;
}

export interface EmotionResult {
  category: EmotionCategory;
  confidence: number;
}

/** Compte le taux de passage par zéro (zero-crossing rate) d'un buffer. */
export function computeZeroCrossingRate(buffer: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i - 1] >= 0 && buffer[i] < 0) || (buffer[i - 1] < 0 && buffer[i] >= 0)) {
      crossings++;
    }
  }
  return crossings / buffer.length;
}

/** Classifie le timbre à partir des magnitudes FFT. */
export function classifyTimbre(
  fftMagnitudes: Float32Array,
  sampleRate: number
): TimbreResult {
  const binCount = fftMagnitudes.length;
  const binHz = sampleRate / 2 / binCount;

  // Spectral centroid
  let weightedSum = 0;
  let totalMag = 0;
  for (let i = 0; i < binCount; i++) {
    const mag = Math.max(0, fftMagnitudes[i]);
    weightedSum += mag * i * binHz;
    totalMag += mag;
  }
  const centroid = totalMag > 0 ? weightedSum / totalMag : 0;

  // Spectral spread
  let spreadSum = 0;
  for (let i = 0; i < binCount; i++) {
    const mag = Math.max(0, fftMagnitudes[i]);
    const freq = i * binHz;
    spreadSum += mag * (freq - centroid) * (freq - centroid);
  }
  const spread = totalMag > 0 ? Math.sqrt(spreadSum / totalMag) : 0;

  // Spectral flatness (geometric mean / arithmetic mean)
  let logSum = 0;
  let ariSum = 0;
  let validBins = 0;
  for (let i = 0; i < binCount; i++) {
    const mag = Math.max(1e-10, fftMagnitudes[i]);
    logSum += Math.log(mag);
    ariSum += mag;
    validBins++;
  }
  const geoMean = validBins > 0 ? Math.exp(logSum / validBins) : 0;
  const ariMean = validBins > 0 ? ariSum / validBins : 1;
  const flatness = ariMean > 0 ? Math.min(1, geoMean / ariMean) : 0;

  // Energy ratios: low (<300 Hz), mid (300-2000 Hz), hi (>2000 Hz)
  let lowEnergy = 0;
  let midEnergy = 0;
  let hiEnergy = 0;
  for (let i = 0; i < binCount; i++) {
    const mag = Math.max(0, fftMagnitudes[i]);
    const freq = i * binHz;
    if (freq < 300) lowEnergy += mag;
    else if (freq < 2000) midEnergy += mag;
    else hiEnergy += mag;
  }
  const totalEnergy = lowEnergy + midEnergy + hiEnergy || 1;
  const lowRatio = lowEnergy / totalEnergy;
  const midRatio = midEnergy / totalEnergy;
  const hiRatio = hiEnergy / totalEnergy;

  // Classification
  let category: TimbreCategory;
  if (flatness > 0.7 && hiRatio > 0.3) {
    category = "Rocailleux";
  } else if (flatness > 0.7) {
    category = "Aérien";
  } else if (centroid < 300) {
    category = "Terreux";
  } else if (centroid < 800 && lowRatio > 0.5) {
    category = "Boisé";
  } else if (centroid > 2000 && hiRatio > 0.25) {
    category = "Métallique";
  } else if (midRatio > 0.4 && centroid >= 800 && centroid <= 1500) {
    category = "Nasal";
  } else if (flatness < 0.15) {
    category = "Cristallin";
  } else {
    category = "Ombragé";
  }

  return { category, centroid, spread, flatness };
}

/** Prédit l'émotion d'un enregistrement à partir de paramètres audio. */
export function predictEmotion(params: {
  dbMax: number;
  durationMs: number;
  noteCount: number;
  zcr: number;
  spectralCentroid: number;
  spectralFlatness: number;
}): EmotionResult {
  const { dbMax, durationMs, noteCount, zcr, spectralCentroid } = params;

  const scores: Record<EmotionCategory, number> = {
    Confiant: 0,
    Timide: 0,
    Explosif: 0,
    Méditatif: 0,
    Malicieux: 0,
    Solennel: 0,
  };

  // dB rules
  if (dbMax > -10) scores["Explosif"] += 3;
  if (dbMax > -20) scores["Confiant"] += 2;
  if (dbMax < -40) scores["Timide"] += 3;

  // Duration rules
  if (durationMs > 4000) {
    scores["Méditatif"] += 2;
    scores["Solennel"] += 1;
  }
  if (durationMs < 500) {
    scores["Timide"] += 2;
    scores["Malicieux"] += 1;
  }

  // Note count rules
  if (noteCount > 20) scores["Malicieux"] += 2;
  if (noteCount < 3) scores["Solennel"] += 2;

  // ZCR rules
  if (zcr > 0.15) {
    scores["Explosif"] += 1;
    scores["Malicieux"] += 1;
  }
  if (zcr < 0.05) scores["Méditatif"] += 2;

  // Centroid rules
  if (spectralCentroid > 2000) scores["Explosif"] += 1;
  if (spectralCentroid < 400) scores["Solennel"] += 1;

  const entries = Object.entries(scores) as [EmotionCategory, number][];
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  return {
    category: best[0],
    confidence: total > 0 ? best[1] / total : 0,
  };
}

/** Calcule un score de musicalité entre 0 et 100. */
export function scoreMusicality(params: {
  noteCount: number;
  durationMs: number;
  uniqueNotes: number;
  zcr: number;
}): number {
  const { noteCount, durationMs, uniqueNotes, zcr } = params;

  // Up to 30 pts for note count
  const notePts = Math.min(30, noteCount * 2);

  // Up to 20 pts for unique notes
  const uniquePts = Math.min(20, uniqueNotes * 4);

  // Up to 30 pts for duration (sweet spot 1-5 s)
  const durationSec = durationMs / 1000;
  let durationPts = 0;
  if (durationSec >= 1 && durationSec <= 5) {
    durationPts = 30;
  } else if (durationSec < 1) {
    durationPts = Math.round(durationSec * 30);
  } else {
    // > 5s: diminishing returns
    durationPts = Math.max(0, Math.round(30 - (durationSec - 5) * 2));
  }

  // Up to 20 pts for ZCR (moderate ZCR is musical)
  const zcrPts = Math.min(20, Math.round(Math.max(0, 1 - Math.abs(zcr - 0.08) / 0.08) * 20));

  return Math.min(100, notePts + uniquePts + durationPts + zcrPts);
}

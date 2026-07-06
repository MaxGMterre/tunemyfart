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

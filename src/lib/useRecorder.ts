import { useCallback, useEffect, useRef, useState } from "react";
import {
  autoCorrelate,
  computeDecibels,
  downsampleWaveform,
  frequencyToNote,
  classifyTimbre,
  predictEmotion,
  scoreMusicality,
  computeZeroCrossingRate,
} from "../lib/pitchDetect";
import type { NoteResult, TimbreResult, EmotionResult } from "../lib/pitchDetect";

export interface NoteEvent extends NoteResult {
  t: number;
}

export interface RecordingResult {
  blob: Blob;
  url: string;
  durationMs: number;
  dbMax: number;
  dbAvg: number;
  notePrincipale: string | null;
  sequenceNotes: NoteEvent[];
  waveform: number[];
  timbre: TimbreResult | null;
  emotion: EmotionResult | null;
  musicalityScore: number;
  zcr: number;
}

type Status =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "done"
  | "error";

export function useRecorder(
  onLiveFrame?: (buffer: Float32Array, fftData?: Uint8Array) => void,
  maxDurationMs = 30_000
) {
  const [status, setStatus] = useState<Status>("idle");
  const [liveNote, setLiveNote] = useState<NoteResult | null>(null);
  const [liveDb, setLiveDb] = useState<number>(-100);
  const [liveFrequency, setLiveFrequency] = useState<number>(0);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const fftAnalyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const sequenceRef = useRef<NoteEvent[]>([]);
  const dbHistoryRef = useRef<number[]>([]);
  const fullBufferRef = useRef<Float32Array[]>([]);
  const onLiveFrameRef = useRef(onLiveFrame);
  onLiveFrameRef.current = onLiveFrame;

  // maxDuration ref so analyseLoop can read it without stale closure
  const maxDurRef = useRef(maxDurationMs ?? 30_000);

  useEffect(() => {
    maxDurRef.current = maxDurationMs ?? 30_000;
  }, [maxDurationMs]);

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // stop is declared before analyseLoop so analyseLoop can reference it
  const stop = useCallback(async () => {
    stopLoop();
    setStatus("processing");

    const mediaRecorder = mediaRecorderRef.current;
    const durationMs = performance.now() - startTimeRef.current;

    await new Promise<void>((resolve) => {
      if (!mediaRecorder) return resolve();
      mediaRecorder.onstop = () => resolve();
      mediaRecorder.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);

    const dbHistory = dbHistoryRef.current.filter((v) => v > -100);
    const dbMax = dbHistory.length ? Math.max(...dbHistory) : -100;
    const dbAvg = dbHistory.length
      ? dbHistory.reduce((a, b) => a + b, 0) / dbHistory.length
      : -100;

    const sequence = sequenceRef.current;
    const noteCounts: Record<string, number> = {};
    sequence.forEach((n) => {
      noteCounts[n.note] = (noteCounts[n.note] || 0) + 1;
    });
    const notePrincipale =
      Object.entries(noteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const merged = new Float32Array(
      fullBufferRef.current.reduce((acc, b) => acc + b.length, 0)
    );
    let offset = 0;
    fullBufferRef.current.forEach((b) => {
      merged.set(b, offset);
      offset += b.length;
    });
    const waveform = downsampleWaveform(merged, 200);

    // ZCR from last captured frame
    const lastBuf =
      fullBufferRef.current[fullBufferRef.current.length - 1] ??
      new Float32Array(1024);
    const zcr = computeZeroCrossingRate(lastBuf);

    // Timbre from final FFT snapshot
    let timbre: TimbreResult | null = null;
    if (fftAnalyserRef.current) {
      const freqData = new Float32Array(fftAnalyserRef.current.frequencyBinCount);
      fftAnalyserRef.current.getFloatFrequencyData(freqData);
      // Convert dB to linear magnitudes
      const magnitudes = new Float32Array(freqData.length);
      for (let i = 0; i < freqData.length; i++) {
        magnitudes[i] = Math.pow(10, (freqData[i] ?? -100) / 20);
      }
      timbre = classifyTimbre(magnitudes, audioCtxRef.current?.sampleRate ?? 44100);
    }

    const uniqueNotes = Object.keys(noteCounts).length;
    const musicalityScore = scoreMusicality({
      noteCount: sequence.length,
      durationMs,
      uniqueNotes,
      zcr,
    });

    const emotion = predictEmotion({
      dbMax,
      durationMs,
      noteCount: sequence.length,
      zcr,
      spectralCentroid: timbre?.centroid ?? 500,
      spectralFlatness: timbre?.flatness ?? 0.5,
    });

    const finalResult: RecordingResult = {
      blob,
      url,
      durationMs,
      dbMax,
      dbAvg,
      notePrincipale,
      sequenceNotes: sequence,
      waveform,
      timbre,
      emotion,
      musicalityScore,
      zcr,
    };
    setResult(finalResult);
    setStatus("done");
  }, []);

  const analyseLoop = useCallback(() => {
    const analyser = analyserRef.current;
    const ctx = audioCtxRef.current;
    if (!analyser || !ctx) return;

    // Auto-stop if max duration reached
    const elapsed = performance.now() - startTimeRef.current;
    const maxMs = maxDurRef.current;
    if (maxMs > 0 && elapsed >= maxMs) {
      stop();
      return;
    }

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    fullBufferRef.current.push(buffer.slice());

    const freq = autoCorrelate(buffer, ctx.sampleRate);
    const note = frequencyToNote(freq);
    const db = computeDecibels(buffer);

    setLiveDb(db);
    setLiveFrequency(freq > 0 ? freq : 0);
    dbHistoryRef.current.push(db);

    // Get FFT data for spectrogram
    const fftData = fftAnalyserRef.current
      ? new Uint8Array(fftAnalyserRef.current.frequencyBinCount)
      : undefined;
    if (fftAnalyserRef.current && fftData) {
      fftAnalyserRef.current.getByteFrequencyData(fftData);
    }

    onLiveFrameRef.current?.(buffer, fftData);

    if (note) {
      setLiveNote(note);
      sequenceRef.current.push({
        ...note,
        t: performance.now() - startTimeRef.current,
      });
    }

    rafRef.current = requestAnimationFrame(analyseLoop);
  }, [stop]);

  const start = useCallback(async () => {
    setError(null);
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      // Notch filters
      const notch50 = audioCtx.createBiquadFilter();
      notch50.type = "notch";
      notch50.frequency.value = 50;
      notch50.Q.value = 10;
      const notch60 = audioCtx.createBiquadFilter();
      notch60.type = "notch";
      notch60.frequency.value = 60;
      notch60.Q.value = 10;

      // Soft compressor (limiter)
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 6;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      // FFT analyser for spectrogram
      const fftAnalyser = audioCtx.createAnalyser();
      fftAnalyser.fftSize = 1024;
      fftAnalyser.smoothingTimeConstant = 0.7;
      fftAnalyserRef.current = fftAnalyser;

      // Chain: source → notch50 → notch60 → compressor → analyser (time domain)
      //                                                  → fftAnalyser (frequency)
      source.connect(notch50);
      notch50.connect(notch60);
      notch60.connect(compressor);
      compressor.connect(analyser);
      compressor.connect(fftAnalyser);

      chunksRef.current = [];
      sequenceRef.current = [];
      dbHistoryRef.current = [];
      fullBufferRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      startTimeRef.current = performance.now();
      setStatus("recording");
      analyseLoop();
    } catch {
      setError("Le laboratoire n'a pas accès au microphone — autorisations requises.");
      setStatus("error");
    }
  }, [analyseLoop]);

  const reset = useCallback(() => {
    setResult(null);
    setLiveNote(null);
    setLiveDb(-100);
    setLiveFrequency(0);
    setStatus("idle");
  }, []);

  const setMaxDuration = useCallback((ms: number) => {
    maxDurRef.current = ms;
  }, []);

  return {
    status,
    liveNote,
    liveDb,
    liveFrequency,
    result,
    error,
    start,
    stop,
    reset,
    setMaxDuration,
  };
}

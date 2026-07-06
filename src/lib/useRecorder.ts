import { useCallback, useRef, useState } from "react";
import { autoCorrelate, computeDecibels, downsampleWaveform, frequencyToNote } from "../lib/pitchDetect";
import type { NoteResult } from "../lib/pitchDetect";

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
}

type Status = "idle" | "requesting" | "recording" | "processing" | "done" | "error";

export function useRecorder(onLiveFrame?: (buffer: Float32Array) => void) {
  const [status, setStatus] = useState<Status>("idle");
  const [liveNote, setLiveNote] = useState<NoteResult | null>(null);
  const [liveDb, setLiveDb] = useState<number>(-100);
  const [liveFrequency, setLiveFrequency] = useState<number>(0);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
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

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const analyseLoop = useCallback(() => {
    const analyser = analyserRef.current;
    const ctx = audioCtxRef.current;
    if (!analyser || !ctx) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    fullBufferRef.current.push(buffer.slice());

    const freq = autoCorrelate(buffer, ctx.sampleRate);
    const note = frequencyToNote(freq);
    const db = computeDecibels(buffer);

    setLiveDb(db);
    setLiveFrequency(freq > 0 ? freq : 0);
    dbHistoryRef.current.push(db);

    onLiveFrameRef.current?.(buffer);

    if (note) {
      setLiveNote(note);
      sequenceRef.current.push({ ...note, t: performance.now() - startTimeRef.current });
    }

    rafRef.current = requestAnimationFrame(analyseLoop);
  }, []);

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
      source.connect(analyser);
      analyserRef.current = analyser;

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
      setError("Impossible d'accéder au micro. Vérifie les autorisations.");
      setStatus("error");
    }
  }, [analyseLoop]);

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
    const dbAvg = dbHistory.length ? dbHistory.reduce((a, b) => a + b, 0) / dbHistory.length : -100;

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

    const finalResult: RecordingResult = {
      blob,
      url,
      durationMs,
      dbMax,
      dbAvg,
      notePrincipale,
      sequenceNotes: sequence,
      waveform,
    };
    setResult(finalResult);
    setStatus("done");
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setLiveNote(null);
    setLiveDb(-100);
    setLiveFrequency(0);
    setStatus("idle");
  }, []);

  return { status, liveNote, liveDb, liveFrequency, result, error, start, stop, reset };
}

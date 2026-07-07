import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/Toast";
import "./Studio.css";

// ── WAV export helpers ─────────────────────────────────────

async function renderToWav(notes: Array<{ freq: number; duration: number; startTime: number }>): Promise<Blob> {
  const sampleRate = 44100;
  const totalDuration = notes.reduce((max, n) => Math.max(max, n.startTime + n.duration), 0) + 0.5;
  const offCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * totalDuration), sampleRate);

  for (const note of notes) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.connect(gain);
    gain.connect(offCtx.destination);
    osc.frequency.value = note.freq;
    osc.type = "triangle";
    gain.gain.setValueAtTime(0.4, note.startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, note.startTime + note.duration);
    osc.start(note.startTime);
    osc.stop(note.startTime + note.duration);
  }

  const buffer = await offCtx.startRendering();
  return audioBufferToWav(buffer);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  function writeUint32(offset: number, val: number) { view.setUint32(offset, val, true); }
  function writeUint16(offset: number, val: number) { view.setUint16(offset, val, true); }

  writeStr(0, "RIFF"); writeUint32(4, 36 + length);
  writeStr(8, "WAVE"); writeStr(12, "fmt ");
  writeUint32(16, 16); writeUint16(20, 1); writeUint16(22, numChannels);
  writeUint32(24, sampleRate); writeUint32(28, sampleRate * numChannels * 2);
  writeUint16(32, numChannels * 2); writeUint16(34, 16);
  writeStr(36, "data"); writeUint32(40, length);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}

// ── Types ─────────────────────────────────────────────────

interface Sample {
  id: string;
  name: string;
  durationMs: number;
  waveform: number[];
  audioUrl: string | null;
}

interface Clip {
  id: string;
  trackId: string;
  sampleId: string;
  sampleName: string;
  startBeat: number;
  durationBeats: number;
  waveform: number[];
}

interface Track {
  id: string;
  name: string;
  color: string;
  clips: Clip[];
  volume: number;
  muted: boolean;
}

// ── Constants ─────────────────────────────────────────────

const BEAT_WIDTH = 24;
const TOTAL_BEATS = 32;
const TRACK_COLORS = ["#C99A3D", "#D9603B", "#5B8A6E", "#7B5EA7"];

const DEFAULT_TRACKS: Track[] = [
  { id: "t1", name: "Piste A", color: "#C99A3D", clips: [], volume: 0.8, muted: false },
  { id: "t2", name: "Piste B", color: "#D9603B", clips: [], volume: 0.8, muted: false },
];

// ── Waveform mini canvas ───────────────────────────────────

function WaveformCanvas({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const step = data.length / w;
    for (let x = 0; x < w; x++) {
      const idx = Math.floor(x * step);
      const val = data[idx] ?? 0;
      const y = h / 2 - (val * h) / 2;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [data, color]);

  return <canvas ref={canvasRef} width={120} height={36} style={{ width: "100%", height: "100%" }} />;
}

// ── Studio component ───────────────────────────────────────

interface StudioProps {
  onClose: () => void;
}

export function Studio({ onClose }: StudioProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [bpm, setBpm] = useState(120);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [compositionName, setCompositionName] = useState("Ma composition");
  const [composedNotes, setComposedNotes] = useState<Array<{ freq: number; duration: number; startTime: number }>>([]);
  const [exporting, setExporting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const rafRef = useRef<number>(0);
  const playStartTimeRef = useRef<number>(0);
  const playStartBeatRef = useRef<number>(0);

  // ── Fetch samples ──────────────────────────────────────

  useEffect(() => {
    if (!user) return;
    supabase
      .from("recordings")
      .select("id, note_principale, db_max, duree_ms, waveform_data, audio_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!data) return;
        setSamples(
          data.map((r) => ({
            id: r.id,
            name: r.note_principale ?? "—",
            durationMs: r.duree_ms ?? 500,
            waveform: Array.isArray(r.waveform_data) ? r.waveform_data : [],
            audioUrl: r.audio_url ?? null,
          }))
        );
      });
  }, [user]);

  // ── Transport: playback ────────────────────────────────

  const stopAll = useCallback(() => {
    sourcesRef.current.forEach((s) => { try { s.stop(); } catch {} });
    sourcesRef.current = [];
    cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    stopAll();
    setPlayhead(0);
  }, [stopAll]);

  const handleRewind = useCallback(() => {
    stopAll();
    setPlayhead(0);
  }, [stopAll]);

  const handlePlay = useCallback(async () => {
    if (isPlaying) { stopAll(); return; }

    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === "suspended") await audioCtx.resume();

    const beatDuration = 60 / bpm; // seconds per beat
    const startBeat = playhead;
    const ctxStartTime = audioCtx.currentTime;

    playStartTimeRef.current = ctxStartTime;
    playStartBeatRef.current = startBeat;
    setIsPlaying(true);

    // Schedule all clips
    for (const track of tracks) {
      if (track.muted) continue;
      for (const clip of track.clips) {
        if (clip.startBeat < startBeat) continue;
        const sample = samples.find((s) => s.id === clip.sampleId);
        if (!sample?.audioUrl) continue;

        try {
          const response = await fetch(sample.audioUrl);
          const arrayBuf = await response.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(arrayBuf);
          const source = audioCtx.createBufferSource();
          source.buffer = decoded;
          const gainNode = audioCtx.createGain();
          gainNode.gain.value = track.volume;
          source.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          const offsetSecs = (clip.startBeat - startBeat) * beatDuration;
          source.start(ctxStartTime + offsetSecs);
          sourcesRef.current.push(source);
        } catch {}
      }
    }

    // Animate playhead
    const animate = () => {
      const elapsed = audioCtx.currentTime - ctxStartTime;
      const currentBeat = startBeat + elapsed / beatDuration;
      if (currentBeat >= TOTAL_BEATS) {
        setPlayhead(0);
        setIsPlaying(false);
        stopAll();
        return;
      }
      setPlayhead(currentBeat);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [isPlaying, bpm, playhead, tracks, samples, stopAll]);

  // Cleanup on unmount
  useEffect(() => () => { stopAll(); }, [stopAll]);

  // ── Timeline interaction ───────────────────────────────

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, trackId: string) => {
      if (!activeSample) {
        showToast("Sélectionne d'abord un sample dans la bibliothèque", "info");
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const startBeat = Math.floor(x / BEAT_WIDTH);
      if (startBeat >= TOTAL_BEATS) return;

      const sample = samples.find((s) => s.id === activeSample);
      if (!sample) return;

      const durationBeats = Math.max(1, Math.round((sample.durationMs / 1000) * (bpm / 60)));

      const newClip: Clip = {
        id: `${Date.now()}-${Math.random()}`,
        trackId,
        sampleId: sample.id,
        sampleName: sample.name,
        startBeat,
        durationBeats: Math.min(durationBeats, TOTAL_BEATS - startBeat),
        waveform: sample.waveform,
      };

      setTracks((prev) =>
        prev.map((t) =>
          t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
        )
      );
    },
    [activeSample, samples, bpm, showToast]
  );

  const handleClipClick = useCallback(
    (e: React.MouseEvent, trackId: string, clipId: string) => {
      e.stopPropagation();
      setTracks((prev) =>
        prev.map((t) =>
          t.id === trackId
            ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
            : t
        )
      );
    },
    []
  );

  // ── Track controls ────────────────────────────────────

  const toggleMute = (trackId: string) =>
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
    );

  const setVolume = (trackId: string, vol: number) =>
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, volume: vol } : t))
    );

  const addTrack = () => {
    if (tracks.length >= 4) {
      showToast("Maximum 4 pistes", "warning");
      return;
    }
    const idx = tracks.length;
    setTracks((prev) => [
      ...prev,
      {
        id: `t${Date.now()}`,
        name: `Piste ${String.fromCharCode(65 + idx)}`,
        color: TRACK_COLORS[idx] ?? "#888",
        clips: [],
        volume: 0.8,
        muted: false,
      },
    ]);
  };

  // ── Accumulate notes when clips are placed ────────────

  const handleTrackClickWithNotes = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, _trackId: string) => {
      if (!activeSample) {
        showToast("Sélectionne d'abord un sample dans la bibliothèque", "info");
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const startBeat = Math.floor(x / BEAT_WIDTH);
      if (startBeat >= TOTAL_BEATS) return;

      const sample = samples.find((s) => s.id === activeSample);
      if (!sample) return;

      const durationBeats = Math.max(1, Math.round((sample.durationMs / 1000) * (bpm / 60)));
      const beatDuration = 60 / bpm;
      const startTime = startBeat * beatDuration;
      const duration = Math.min(durationBeats, TOTAL_BEATS - startBeat) * beatDuration;

      // Derive a frequency from the sample name (fallback 440 Hz)
      const noteFreqMap: Record<string, number> = {
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
        A4: 440.0, B4: 493.88, C5: 523.25,
      };
      const freq = noteFreqMap[sample.name] ?? 440;

      setComposedNotes((prev) => [...prev, { freq, duration, startTime }]);
    },
    [activeSample, samples, bpm, showToast]
  );

  // ── Export handler ─────────────────────────────────────

  const handleExport = async () => {
    if (!composedNotes || composedNotes.length === 0) return;
    setExporting(true);
    try {
      const blob = await renderToWav(composedNotes);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      a.href = url;
      a.download = `Composition-${date}.wav`;
      a.click();
      URL.revokeObjectURL(url);

      if (navigator.share) {
        await navigator.share({ title: "Composition TuneMyfart", files: [new File([blob], `Composition-${date}.wav`, { type: "audio/wav" })] });
      }
    } catch (err) {
      console.error("Export error", err);
    } finally {
      setExporting(false);
    }
  };

  // ── Save composition ───────────────────────────────────

  const saveStudioComposition = async () => {
    if (!user) { showToast("Connexion requise", "error"); return; }
    const allClips = tracks.flatMap((t) => t.clips);
    if (allClips.length === 0) { showToast("Ajoute des clips avant de sauvegarder", "warning"); return; }
    try {
      await supabase.from("compositions").insert({
        user_id: user.id,
        name: compositionName,
        notes: allClips,
        bpm,
      });
      showToast("Composition sauvegardée !", "success");
    } catch {
      showToast("Erreur lors de la sauvegarde", "error");
    }
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div className="studio-overlay">
      {/* Header */}
      <div className="studio-header">
        <span className="studio-title">Studio — Atelier de composition</span>
        <button className="studio-close" onClick={onClose} aria-label="Fermer le studio">✕</button>
      </div>

      {/* Transport */}
      <div className="studio-transport">
        <button className="transport-btn" onClick={handleRewind} title="Retour au début">⏮</button>
        <button
          className={`transport-btn${isPlaying ? "" : " transport-btn--play"}`}
          onClick={handlePlay}
          title={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="transport-btn" onClick={handleStop} title="Arrêter">⏹</button>

        <div className="bpm-control">
          <label>BPM</label>
          <button className="bpm-btn" onClick={() => setBpm((b) => Math.max(60, b - 1))}>−</button>
          <span className="bpm-value">{bpm}</span>
          <button className="bpm-btn" onClick={() => setBpm((b) => Math.min(200, b + 1))}>+</button>
          <input
            className="bpm-slider"
            type="range"
            min={60}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(+e.target.value)}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="studio-timeline">
        {tracks.map((track) => (
          <div key={track.id} className="track-row">
            {/* Track header */}
            <div className="track-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span className="track-dot" style={{ background: track.color }} />
                <span className="track-name">{track.name}</span>
              </div>
              <button
                className="track-mute-btn"
                onClick={() => toggleMute(track.id)}
                style={track.muted ? { color: "#D9603B", borderColor: "#D9603B" } : {}}
              >
                {track.muted ? "🔇" : "🔊"}
              </button>
              <input
                className="track-vol"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={track.volume}
                onChange={(e) => setVolume(track.id, +e.target.value)}
                title={`Volume: ${Math.round(track.volume * 100)}%`}
              />
            </div>

            {/* Track body */}
            <div
              className="track-body"
              style={{ width: TOTAL_BEATS * BEAT_WIDTH }}
              onClick={(e) => { handleTrackClick(e, track.id); handleTrackClickWithNotes(e, track.id); }}
            >
              {/* Beat grid */}
              <div className="track-grid">
                {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
                  <div
                    key={i}
                    className="track-grid-beat"
                    style={{ width: BEAT_WIDTH }}
                  />
                ))}
              </div>

              {/* Clips */}
              {track.clips.map((clip) => (
                <div
                  key={clip.id}
                  className="clip-block"
                  style={{
                    left: clip.startBeat * BEAT_WIDTH,
                    width: clip.durationBeats * BEAT_WIDTH,
                    background: track.color + "55",
                    borderColor: track.color,
                  }}
                  onClick={(e) => handleClipClick(e, track.id, clip.id)}
                  title={`${clip.sampleName} — Clic pour supprimer`}
                >
                  {clip.waveform.length > 0 && (
                    <WaveformCanvas data={clip.waveform} color={track.color} />
                  )}
                  <span className="clip-label">{clip.sampleName}</span>
                </div>
              ))}

              {/* Playhead */}
              <div
                className="playhead-line"
                style={{ left: playhead * BEAT_WIDTH }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Sample library */}
      <div className="studio-samples">
        <div className="samples-title">Bibliothèque de samples</div>
        <div className="samples-list">
          {samples.length === 0 ? (
            <span className="sample-chip-empty">Aucun enregistrement disponible</span>
          ) : (
            samples.map((s) => (
              <div
                key={s.id}
                className={`sample-chip${activeSample === s.id ? " selected" : ""}`}
                onClick={() => setActiveSample((prev) => (prev === s.id ? null : s.id))}
              >
                <div className="sample-chip-note">{s.name}</div>
                <div className="sample-chip-dur">{(s.durationMs / 1000).toFixed(1)}s</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="studio-actions">
        <button className="add-track-btn" onClick={addTrack}>
          + Piste
        </button>

        {composedNotes.length > 0 && (
          <button className="studio-export-btn" onClick={handleExport} disabled={exporting}>
            {exporting ? "Export…" : "⬇ Exporter .wav"}
          </button>
        )}

        <div className="studio-save-row">
          <input
            className="studio-name-input"
            value={compositionName}
            onChange={(e) => setCompositionName(e.target.value)}
            placeholder="Nom de la composition"
          />
          <button className="studio-action-btn studio-action-btn--primary" onClick={saveStudioComposition}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

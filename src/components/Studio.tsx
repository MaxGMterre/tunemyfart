import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/Toast";
import "./Studio.css";

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
              onClick={(e) => handleTrackClick(e, track.id)}
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

        <button
          className="studio-action-btn"
          onClick={() =>
            showToast("Rendu non disponible en mode web — utilisez l'app native", "info")
          }
        >
          Exporter
        </button>

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

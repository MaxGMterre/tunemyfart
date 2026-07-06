import { useCallback, useEffect, useRef, useState } from "react";
import { useRecorder } from "../lib/useRecorder";
import { saveRecording, uploadAudio } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { ShareCard } from "./ShareCard";

// ── Helpers ──────────────────────────────────────────────

function dbToGaugePercent(db: number) {
  const clamped = Math.max(-60, Math.min(0, db));
  return ((clamped + 60) / 60) * 100;
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function triggerHaptic(type: "light" | "heavy" | "victory") {
  try {
    const pkg = "@capacitor/haptics";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { Haptics, ImpactStyle, NotificationType } = await import(/* @vite-ignore */ pkg as any);
    if (type === "light") await Haptics.impact({ style: ImpactStyle.Light });
    else if (type === "heavy") await Haptics.impact({ style: ImpactStyle.Heavy });
    else await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

// ── Component ────────────────────────────────────────────

export function Recorder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef  = useRef<HTMLAudioElement>(null);

  // Live waveform — vintage ink on cream
  const handleLiveFrame = useCallback((buffer: Float32Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    ctx.fillStyle = "#F2ECE0";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#1B2A41";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const step = buffer.length / w;
    for (let x = 0; x < w; x++) {
      const v = buffer[Math.floor(x * step)] ?? 0;
      const y = mid + v * mid * 0.9;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, []);

  const { status, liveNote, liveDb, liveFrequency, result, error, start, stop, reset } =
    useRecorder(handleLiveFrame);
  const { user } = useAuth();

  const [alimentation, setAlimentation] = useState("");
  const [lieu, setLieu]                 = useState("");
  const [odeur, setOdeur]               = useState("");
  const [saved, setSaved]               = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);
  const [uploading, setUploading]       = useState(false);
  const [showShare, setShowShare]       = useState(false);
  const [noteKey, setNoteKey]           = useState(0);
  const prevNoteRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);

  const isRecording = status === "recording";

  // Note pop animation key
  useEffect(() => {
    const current = liveNote ? `${liveNote.note}${liveNote.octave}` : null;
    if (current !== prevNoteRef.current) {
      prevNoteRef.current = current;
      setNoteKey(k => k + 1);
    }
  }, [liveNote]);

  // Flat idle line on canvas
  useEffect(() => {
    if (status !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#F2ECE0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(27, 42, 65, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [status]);

  // Result waveform — ink trace + brass mirror
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    const step = w / result.waveform.length;
    ctx.fillStyle = "#F2ECE0";
    ctx.fillRect(0, 0, w, h);
    // Brass mirror (bottom)
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#C99A3D";
    ctx.lineWidth = 1;
    ctx.beginPath();
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid + v * mid * 1.35;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Ink main trace (top)
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#1B2A41";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid - v * mid * 1.35;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [result]);

  // Audio player events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false); setCurrentTime(0); setDuration(0);
    const onTime  = () => setCurrentTime(audio.currentTime);
    const onMeta  = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    if (audio.readyState >= 1 && !isNaN(audio.duration)) setDuration(audio.duration);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [result]);

  // Victory haptic
  useEffect(() => {
    if (status !== "done" || !result) return;
    if (result.dbMax > -15 || result.durationMs > 3000) triggerHaptic("victory");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleStart = useCallback(async () => {
    triggerHaptic("light");
    await start();
  }, [start]);

  const handleStop = useCallback(async () => {
    triggerHaptic("heavy");
    await stop();
  }, [stop]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  };

  const handleSave = async () => {
    if (!result) return;
    setSaveError(null);
    let audio_url: string | null = null;
    if (user) {
      setUploading(true);
      try { audio_url = await uploadAudio(result.blob, user.id); } catch {}
      finally { setUploading(false); }
    }
    const freqs = result.sequenceNotes.map(n => n.frequency).filter(f => f > 0 && isFinite(f));
    try {
      await saveRecording({
        audio_url,
        db_max: result.dbMax,
        db_avg: result.dbAvg,
        note_principale: result.notePrincipale,
        sequence_notes: result.sequenceNotes.map(n => ({ note: n.note, frequency: n.frequency, t: n.t })),
        duree_ms: result.durationMs,
        waveform_data: result.waveform,
        alimentation, lieu, odeur,
        user_id: user?.id,
        freq_max: freqs.length ? Math.max(...freqs) : null,
        freq_min: freqs.length ? Math.min(...freqs) : null,
        notes_count: result.sequenceNotes.length,
      });
      setSaved(true);
    } catch {
      setSaveError("Sauvegarde impossible — vérifie ta configuration Supabase (.env) et que tu es connecté.");
    }
  };

  const handleReset = () => {
    reset();
    setSaved(false); setSaveError(null);
    setAlimentation(""); setLieu(""); setOdeur("");
    setShowShare(false);
  };

  return (
    <div className="recorder-panel">

      {/* ── Instrument frame ── */}
      <div className={`instr-frame${isRecording ? " instr-frame--recording" : ""}`}>

        {/* Oscilloscope canvas — live during recording, result waveform after */}
        <canvas ref={canvasRef} className="scope-canvas" width={600} height={100} />

        {/* Horizontal dB gauge */}
        <div className="db-gauge-wrap">
          <div className="db-gauge-header">
            <span className="db-gauge-label">NIVEAU (dB)</span>
            <span className="db-gauge-value">{liveDb > -100 ? liveDb.toFixed(0) : "—"}</span>
          </div>
          <div className="db-gauge-track">
            <div className="db-gauge-fill" style={{ width: `${dbToGaugePercent(liveDb)}%` }} />
          </div>
        </div>

        {/* Note readout */}
        <div className="note-section">
          <span className="note-readout-label">NOTE DÉTECTÉE</span>
          <div className="note-readout-row">
            <span className="note-readout-value" key={noteKey}>
              {liveNote ? `${liveNote.note}${liveNote.octave}` : "—"}
            </span>
            {liveFrequency > 0 && (
              <span className="note-readout-freq">{liveFrequency.toFixed(0)} Hz</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Record / Stop buttons ── */}
      {status === "idle" && (
        <div className="record-btn-wrap">
          <button className="record-btn" onClick={handleStart} aria-label="Démarrer l'analyse">
            ● DÉMARRER{"\n"}L'ANALYSE
          </button>
        </div>
      )}

      {isRecording && (
        <div className="record-btn-wrap">
          <button className="record-btn recording" onClick={handleStop} aria-label="Arrêter l'analyse">
            ■ ARRÊTER{"\n"}L'ANALYSE
          </button>
        </div>
      )}

      {status === "requesting" && <p className="status-text">Autorisation du micro en attente…</p>}
      {status === "processing" && <p className="status-text">Traitement du signal…</p>}
      {status === "error" && error && <p className="error-text">{error}</p>}

      {/* ── Result block ── */}
      {status === "done" && result && (
        <div className="result-block">
          <h3 className="result-title">Rapport d'analyse</h3>

          <div className="result-stats-row">
            <div className="stat-card">
              <span className="stat-card-emoji">💥</span>
              <span className="stat-card-value">{result.dbMax.toFixed(1)}</span>
              <span className="stat-card-label">dB max</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-emoji">⏱️</span>
              <span className="stat-card-value">{(result.durationMs / 1000).toFixed(2)}</span>
              <span className="stat-card-label">secondes</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-emoji">🎵</span>
              <span className="stat-card-value">{result.notePrincipale ?? "—"}</span>
              <span className="stat-card-label">note</span>
            </div>
          </div>

          <div className="result-stats-secondary">
            <div className="stat-secondary">
              <span className="stat-label">Notes captées</span>
              <span className="stat-value">{result.sequenceNotes.length}</span>
            </div>
          </div>

          <audio ref={audioRef} src={result.url} />
          <div className="audio-player-custom">
            <button className="audio-play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Lecture"}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <div className="audio-progress-wrap" onClick={seekTo}>
              <div
                className="audio-progress-bar"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
            <span className="audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          <button className="share-trigger-btn" onClick={() => setShowShare(true)}>
            Partager ce relevé 🦨
          </button>

          {!saved && (
            <div className="tags-form">
              <label className="tags-form-field">
                Alimentation
                <input value={alimentation} onChange={e => setAlimentation(e.target.value)} placeholder="ex: chou-fleur, bière" />
              </label>
              <label className="tags-form-field">
                Lieu
                <input value={lieu} onChange={e => setLieu(e.target.value)} placeholder="ex: salon, bureau" />
              </label>
              <label className="tags-form-field">
                Odeur
                <input value={odeur} onChange={e => setOdeur(e.target.value)} placeholder="ex: discret, dévastateur" />
              </label>
              {uploading && <p className="status-text">Envoi audio…</p>}
              <button className="save-btn" onClick={handleSave} disabled={uploading}>
                {uploading ? "Envoi en cours…" : "Enregistrer dans le classement"}
              </button>
              {saveError && <p className="error-text">{saveError}</p>}
            </div>
          )}

          {saved && (
            <p className="success-text">Enregistré ! Visible dans ton historique et les classements.</p>
          )}

          <button className="reset-btn" onClick={handleReset}>Nouvelle analyse</button>
        </div>
      )}

      {showShare && result && (
        <ShareCard result={result} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

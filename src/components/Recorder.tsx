import { useCallback, useEffect, useRef, useState } from "react";
import { useRecorder } from "../lib/useRecorder";
import { saveRecording, uploadAudio } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { ShareCard } from "./ShareCard";
import type { RecordingResult } from "../lib/useRecorder";

// ── Helpers ──────────────────────────────────────────────

function dbToGaugePercent(db: number) {
  const clamped = Math.max(-60, Math.min(0, db));
  return ((clamped + 60) / 60) * 100;
}

function freqToPercent(hz: number): number {
  if (hz <= 0) return 0;
  const logMin = Math.log10(20);
  const logMax = Math.log10(2000);
  const logHz = Math.log10(Math.max(20, Math.min(2000, hz)));
  return ((logHz - logMin) / (logMax - logMin)) * 100;
}

function formatDuration(ms: number): string {
  const totalSec = ms / 1000;
  const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSec % 60).toString().padStart(2, "0");
  const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, "0");
  return `${m}:${s}.${cs}`;
}

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function generateTitle(result: RecordingResult): string {
  if (result.dbMax > -20) return "⚡ SURCHARGE DÉTECTÉE";
  if (result.durationMs > 3000) return "⏱ ENDURANCE EXCEPTIONNELLE";
  if (result.sequenceNotes.length > 5) return "🎼 COMPLEXITÉ HARMONIQUE";
  if (result.notePrincipale === "Do" || result.notePrincipale === "C") return "♩ FONDAMENTALE PURE";
  const n = (Math.abs(Math.round(result.dbMax * 100 + result.durationMs)) % 9000) + 1000;
  return `◈ RELEVÉ N°${n}`;
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
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleLiveFrame = useCallback((buffer: Float32Array) => {
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#39FF14";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const step = buffer.length / w;
    for (let x = 0; x < w; x++) {
      const v = buffer[Math.floor(x * step)] ?? 0;
      const y = mid + v * mid * 0.82;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  const { status, liveNote, liveDb, liveFrequency, result, error, start, stop, reset } =
    useRecorder(handleLiveFrame);
  const { user } = useAuth();

  const [alimentation, setAlimentation] = useState("");
  const [lieu, setLieu] = useState("");
  const [odeur, setOdeur] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [noteKey, setNoteKey] = useState(0);
  const prevNoteRef = useRef<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startDisplayRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isRecording = status === "recording";

  // Note change key for pop animation
  useEffect(() => {
    const current = liveNote ? `${liveNote.note}${liveNote.octave}` : null;
    if (current !== prevNoteRef.current) {
      prevNoteRef.current = current;
      setNoteKey(k => k + 1);
    }
  }, [liveNote]);

  // Elapsed timer
  useEffect(() => {
    if (status !== "recording") { setElapsedMs(0); return; }
    startDisplayRef.current = performance.now();
    const id = setInterval(() => setElapsedMs(performance.now() - startDisplayRef.current), 33);
    return () => clearInterval(id);
  }, [status]);

  // Flat line when idle
  useEffect(() => {
    if (status !== "idle") return;
    const canvas = liveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(57, 255, 20, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [status]);

  // Result waveform on scope (neon + brass mirror)
  useEffect(() => {
    if (!result || !liveCanvasRef.current) return;
    const canvas = liveCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    const step = w / result.waveform.length;
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = "#C99A3D";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid + v * mid * 0.8;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#39FF14";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid - v * mid * 0.8;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [result]);

  // Thermal section waveform (ink on paper)
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    const step = w / result.waveform.length;
    ctx.fillStyle = "#FAFAF8";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#1B2A41";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid - v * mid * 1.15;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [result]);

  // Audio player events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
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

  // Victory haptic on done
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
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
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
    const freq_max = freqs.length ? Math.max(...freqs) : null;
    const freq_min = freqs.length ? Math.min(...freqs) : null;
    try {
      await saveRecording({
        audio_url,
        db_max: result.dbMax,
        db_avg: result.dbAvg,
        note_principale: result.notePrincipale,
        sequence_notes: result.sequenceNotes.map(n => ({ note: n.note, frequency: n.frequency, t: n.t })),
        duree_ms: result.durationMs,
        waveform_data: result.waveform,
        alimentation,
        lieu,
        odeur,
        user_id: user?.id,
        freq_max,
        freq_min,
        notes_count: result.sequenceNotes.length,
      });
      setSaved(true);
    } catch {
      setSaveError("Sauvegarde impossible — vérifie ta configuration Supabase (.env) et que tu es connecté.");
    }
  };

  const handleReset = () => {
    reset();
    setSaved(false);
    setSaveError(null);
    setAlimentation("");
    setLieu("");
    setOdeur("");
    setShowShare(false);
  };

  const recLevel = isRecording
    ? (liveDb > -20 ? "hot" : liveDb > -40 ? "mid" : "low")
    : "off";

  return (
    <div className="recorder-outer">
      {/* ── Instrument chassis ── */}
      <div className="instr-chassis">
        <div className="screw screw--tl" />
        <div className="screw screw--tr" />
        <div className="screw screw--bl" />
        <div className="screw screw--br" />

        <div className="instr-titlebar">
          <span className="instr-model">L'ANAL-YSER</span>
          <span className="instr-titlebar-right">
            <span className="instr-sub">FREQ. ANALYSIS</span>
            <span className="instr-led" data-on={String(isRecording)} />
          </span>
        </div>

        {/* Oscilloscope screen */}
        <div className="scope-screen">
          <canvas ref={liveCanvasRef} className="scope-canvas" width={600} height={140} />
          <div className="scope-grid" />
        </div>

        {/* 3 VU meters */}
        <div className="vu-row">
          <div className="vu-panel">
            <span className="vu-label">dB SPL</span>
            <div className="vu-track">
              <div className="vu-fill" style={{ height: `${dbToGaugePercent(liveDb)}%` }} />
            </div>
            <span className="vu-readout">{liveDb > -100 ? liveDb.toFixed(0) : "—"}</span>
          </div>

          <div className="vu-panel vu-panel--wide">
            <span className="vu-label">FREQ Hz</span>
            <div className="vu-freq-wrap">
              <div className="vu-freq-bar" style={{ width: `${freqToPercent(liveFrequency)}%` }} />
            </div>
            <span className="vu-readout">{liveFrequency > 0 ? liveFrequency.toFixed(0) : "—"}</span>
          </div>

          <div className="vu-panel">
            <span className="vu-label">NOTE</span>
            <span className="vu-note-big" key={noteKey}>
              {liveNote ? liveNote.note : "—"}
            </span>
            {liveNote && <span className="vu-note-oct">{liveNote.octave}</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="instr-control-row">
          <button
            className="rec-btn"
            data-level={recLevel}
            onClick={handleStart}
            disabled={status !== "idle"}
            aria-label="Enregistrer"
          >
            REC
          </button>
          <span className="rec-timer">{formatDuration(elapsedMs)}</span>
          <button
            className="stop-btn"
            onClick={handleStop}
            disabled={!isRecording}
            aria-label="Arrêter"
          >
            ■
          </button>
        </div>

        {status === "requesting" && <p className="instr-status">AUTORISATION MICRO…</p>}
        {status === "processing" && <p className="instr-status">TRAITEMENT DU SIGNAL…</p>}
        {status === "error" && error && <p className="instr-error">{error}</p>}

        <div className="instr-nameplate">ANAL-YSER MK.I — TUNEMYFART LABS</div>
      </div>

      {/* ── Thermal result ── */}
      {status === "done" && result && (
        <div className="thermal-result">
          <div className="thermal-perfs thermal-perfs--top" />
          <div className="thermal-inner">
            <div className="thermal-header-line">TUNEMYFART LABS — RELEVÉ ACOUSTIQUE</div>
            <div className="thermal-title">{generateTitle(result)}</div>

            <div className="thermal-stats-grid">
              <div className="thermal-stat">
                <span className="thermal-stat-value">{result.dbMax.toFixed(1)}</span>
                <span className="thermal-stat-label">dB MAX</span>
              </div>
              <div className="thermal-stat">
                <span className="thermal-stat-value">{(result.durationMs / 1000).toFixed(2)}s</span>
                <span className="thermal-stat-label">DURÉE</span>
              </div>
              <div className="thermal-stat">
                <span className="thermal-stat-value">{result.notePrincipale ?? "—"}</span>
                <span className="thermal-stat-label">NOTE</span>
              </div>
              <div className="thermal-stat">
                <span className="thermal-stat-value">
                  {result.sequenceNotes[0]?.frequency.toFixed(0) ?? "—"} Hz
                </span>
                <span className="thermal-stat-label">FRÉQUENCE</span>
              </div>
            </div>

            <canvas ref={canvasRef} width={400} height={60} className="waveform-canvas" />

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

            {saved && <p className="success-text">Enregistré ! Visible dans le classement.</p>}
            <button className="reset-btn" onClick={handleReset}>Nouvelle analyse</button>
          </div>
          <div className="thermal-perfs thermal-perfs--bottom" />
        </div>
      )}

      {showShare && result && (
        <ShareCard result={result} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

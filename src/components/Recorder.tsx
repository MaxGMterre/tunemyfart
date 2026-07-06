import { useCallback, useEffect, useRef, useState } from "react";
import { useRecorder } from "../lib/useRecorder";
import { saveRecording, uploadAudio } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { ShareCard } from "./ShareCard";

// ── Helpers ──────────────────────────────────────────────

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
    const { Haptics, ImpactStyle, NotificationType } = await import(
      /* @vite-ignore */ pkg as any
    );
    if (type === "light") await Haptics.impact({ style: ImpactStyle.Light });
    else if (type === "heavy")
      await Haptics.impact({ style: ImpactStyle.Heavy });
    else await Haptics.notification({ type: NotificationType.Success });
  } catch {}
}

// ── Component ────────────────────────────────────────────

export function Recorder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  // Live waveform — phosphor green on dark screen
  const handleLiveFrame = useCallback((buffer: Float32Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = "rgba(57, 255, 20, 0.5)";
    ctx.beginPath();
    const step = buffer.length / w;
    for (let x = 0; x < w; x++) {
      const v = buffer[Math.floor(x * step)] ?? 0;
      const y = mid + v * mid * 0.9;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  const {
    status,
    liveNote,
    liveDb,
    liveFrequency,
    result,
    error,
    start,
    stop,
    reset,
  } = useRecorder(handleLiveFrame);
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isRecording = status === "recording";

  // Needle angle: -60° (silence) → +60° (full signal)
  const needleAngle =
    ((Math.max(-60, Math.min(0, liveDb)) + 60) / 60) * 120 - 60;

  // Note pop animation key
  useEffect(() => {
    const current = liveNote ? `${liveNote.note}${liveNote.octave}` : null;
    if (current !== prevNoteRef.current) {
      prevNoteRef.current = current;
      setNoteKey((k) => k + 1);
    }
  }, [liveNote]);

  // Idle flat line on dark canvas
  useEffect(() => {
    if (status !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(57, 255, 20, 0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [status]);

  // Result waveform — phosphor green on dark screen
  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    const step = w / result.waveform.length;
    ctx.fillStyle = "#0A0F1A";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(57, 255, 20, 0.4)";
    ctx.beginPath();
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid - v * mid * 1.35;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [result]);

  // Audio player events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlayError(null);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => {
      if (!isNaN(audio.duration)) setDuration(audio.duration);
    };
    const onCanPlay = () => {
      if (!isNaN(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("ended", onEnded);
    if (audio.readyState >= 1 && !isNaN(audio.duration))
      setDuration(audio.duration);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("ended", onEnded);
    };
  }, [result]);

  // Victory haptic
  useEffect(() => {
    if (status !== "done" || !result) return;
    if (result.dbMax > -15 || result.durationMs > 3000)
      triggerHaptic("victory");
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
    setPlayError(null);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((e: Error) => {
          setPlayError(
            "Lecture impossible — " + (e?.message ?? "erreur inconnue")
          );
        });
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime =
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  };

  const handleSave = async () => {
    if (!result) return;
    setSaveError(null);
    let audio_url: string | null = null;
    if (user) {
      setUploading(true);
      try {
        audio_url = await uploadAudio(result.blob, user.id);
      } catch {
      } finally {
        setUploading(false);
      }
    }
    const freqs = result.sequenceNotes
      .map((n) => n.frequency)
      .filter((f) => f > 0 && isFinite(f));
    try {
      await saveRecording({
        audio_url,
        db_max: result.dbMax,
        db_avg: result.dbAvg,
        note_principale: result.notePrincipale,
        sequence_notes: result.sequenceNotes.map((n) => ({
          note: n.note,
          frequency: n.frequency,
          t: n.t,
        })),
        duree_ms: result.durationMs,
        waveform_data: result.waveform,
        alimentation,
        lieu,
        odeur,
        user_id: user?.id,
        freq_max: freqs.length ? Math.max(...freqs) : null,
        freq_min: freqs.length ? Math.min(...freqs) : null,
        notes_count: result.sequenceNotes.length,
      });
      setSaved(true);
    } catch {
      setSaveError(
        "Sauvegarde impossible — vérifie ta configuration Supabase (.env) et que tu es connecté."
      );
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
    setPlayError(null);
  };

  return (
    <div className="recorder-panel">
      {/* ── Dark lab instrument frame ── */}
      <div
        className={`instrument-frame${
          isRecording ? " instrument-frame--recording" : ""
        }`}
      >
        {/* Corner screws */}
        <div className="screw screw--tl" />
        <div className="screw screw--tr" />
        <div className="screw screw--bl" />
        <div className="screw screw--br" />

        {/* LED indicator row */}
        <div className="led-row">
          <div className="led-item">
            <div className="led led--power" />
            <span className="led-label">PWR</span>
          </div>
          <div className="led-item">
            <div
              className={`led led--ready${
                status === "idle" || status === "done" ? " led--on-ready" : ""
              }`}
            />
            <span className="led-label">RDY</span>
          </div>
          <div className="led-item">
            <div
              className={`led led--rec${isRecording ? " led--on-rec" : ""}`}
            />
            <span className="led-label">REC</span>
          </div>
          <div className="led-item">
            <div
              className={`led led--sig${liveDb > -40 ? " led--on-sig" : ""}`}
            />
            <span className="led-label">SIG</span>
          </div>
        </div>

        {/* Oscilloscope screen — waveform + note readout */}
        <div className="scope-screen">
          <canvas
            ref={canvasRef}
            className="scope-canvas"
            width={600}
            height={120}
          />
          <div className="scope-scanlines" />
          <div className="note-display">
            <span className="note-value" key={noteKey}>
              {liveNote ? `${liveNote.note}${liveNote.octave}` : "—"}
            </span>
            {liveFrequency > 0 && (
              <span className="note-freq">{liveFrequency.toFixed(0)} Hz</span>
            )}
          </div>
        </div>

        {/* VU meter — needle style */}
        <div className="vu-section">
          <div className="vu-meter">
            <div className="vu-arc-bg" />
            <div className="vu-scale-marks">
              <span className="vu-mark vu-mark--lo">-60</span>
              <span className="vu-mark vu-mark--mid">-30</span>
              <span className="vu-mark vu-mark--hi">0</span>
            </div>
            <div
              className="vu-needle"
              style={{
                transform: `translateX(-50%) rotate(${needleAngle}deg)`,
              }}
            />
            <div className="vu-pivot" />
          </div>
          <span className="vu-label">dB SPL</span>
        </div>

        {/* Decorative cables — behind everything */}
        <svg
          className="cables-svg"
          viewBox="0 0 320 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 15 85 C 70 55, 150 75, 230 45"
            fill="none"
            stroke="#111"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 15 85 C 70 55, 150 75, 230 45"
            fill="none"
            stroke="#C99A3D"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="5 9"
            opacity="0.5"
          />
          <circle cx="15" cy="85" r="5" fill="#C99A3D" opacity="0.7" />
          <circle cx="230" cy="45" r="5" fill="#C99A3D" opacity="0.7" />
          <path
            d="M 260 12 C 285 32, 302 22, 308 52"
            fill="none"
            stroke="#111"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 260 12 C 285 32, 302 22, 308 52"
            fill="none"
            stroke="#C99A3D"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="4 7"
            opacity="0.45"
          />
          <circle cx="260" cy="12" r="4" fill="#C99A3D" opacity="0.65" />
          <circle cx="308" cy="52" r="4" fill="#C99A3D" opacity="0.65" />
        </svg>

        {/* Nameplate */}
        <div className="instr-nameplate">TUNEMYFART LABS — MK.II</div>
      </div>

      {/* ── Record / Stop buttons ── */}
      {status === "idle" && (
        <div className="record-btn-wrap">
          <button
            className="rec-btn"
            onClick={handleStart}
            aria-label="Démarrer l'analyse"
          >
            REC
          </button>
        </div>
      )}

      {isRecording && (
        <div className="record-btn-wrap">
          <button
            className="rec-btn rec-btn--stop"
            onClick={handleStop}
            aria-label="Arrêter l'analyse"
          >
            STOP
          </button>
        </div>
      )}

      {status === "requesting" && (
        <p className="status-text" role="status">
          Autorisation du microphone en attente…
        </p>
      )}
      {status === "processing" && (
        <p className="status-text" role="status">
          Traitement du signal acoustique…
        </p>
      )}
      {status === "error" && error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      {/* ── Result block ── */}
      {status === "done" && result && (
        <div className="result-block">
          <h3 className="result-title">Rapport d'analyse acoustique</h3>

          <div className="result-stats-row">
            <div className="stat-card">
              <span className="stat-card-emoji">💥</span>
              <span className="stat-card-value">{result.dbMax.toFixed(1)}</span>
              <span className="stat-card-label">dB max</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-emoji">⏱️</span>
              <span className="stat-card-value">
                {(result.durationMs / 1000).toFixed(2)}
              </span>
              <span className="stat-card-label">secondes</span>
            </div>
            <div className="stat-card">
              <span className="stat-card-emoji">🎵</span>
              <span className="stat-card-value">
                {result.notePrincipale ?? "—"}
              </span>
              <span className="stat-card-label">note</span>
            </div>
          </div>

          <div className="result-stats-secondary">
            <div className="stat-secondary">
              <span className="stat-label">Événements spectraux</span>
              <span className="stat-value">{result.sequenceNotes.length}</span>
            </div>
          </div>

          <audio ref={audioRef} src={result.url} preload="metadata" />
          <div className="audio-player-custom">
            <button
              className="audio-play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <div className="audio-progress-wrap" onClick={seekTo}>
              <div
                className="audio-progress-bar"
                style={{
                  width: duration ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
            </div>
            <span className="audio-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          {playError && <p className="error-text">{playError}</p>}

          <button
            className="share-trigger-btn"
            onClick={() => setShowShare(true)}
          >
            Diffuser ce spécimen 🦨
          </button>

          {!saved && (
            <div className="tags-form">
              <p className="tags-form-title">Métadonnées du spécimen</p>
              <label className="tags-form-field">
                Alimentation
                <input
                  value={alimentation}
                  onChange={(e) => setAlimentation(e.target.value)}
                  placeholder="ex: chou-fleur, bière"
                />
              </label>
              <label className="tags-form-field">
                Lieu de collecte
                <input
                  value={lieu}
                  onChange={(e) => setLieu(e.target.value)}
                  placeholder="ex: salon, bureau"
                />
              </label>
              <label className="tags-form-field">
                Signature olfactive
                <input
                  value={odeur}
                  onChange={(e) => setOdeur(e.target.value)}
                  placeholder="ex: discret, dévastateur"
                />
              </label>
              {uploading && (
                <p className="status-text">Transmission de l'échantillon…</p>
              )}
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={uploading}
              >
                {uploading ? "Transmission en cours…" : "Certifier le relevé"}
              </button>
              {saveError && <p className="error-text">{saveError}</p>}
            </div>
          )}

          {saved && (
            <p className="success-text">
              Relevé certifié — versé au corpus et aux registres.
            </p>
          )}

          <button className="reset-btn" onClick={handleReset}>
            Nouvelle analyse
          </button>
        </div>
      )}

      {showShare && result && (
        <ShareCard result={result} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

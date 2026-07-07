import { useCallback, useEffect, useRef, useState } from "react";
import { useRecorder } from "../lib/useRecorder";
import { saveRecording, uploadAudio } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { ShareCard } from "./ShareCard";
import { LabTableDecor } from "./LabTableDecor";
import { PutoisMascot } from "./PutoisMascot";
import type { PutoisState } from "./PutoisMascot";
import {
  ProutDialogue,
  useProutDialogue,
  DIALOGUE_IDLE,
  DIALOGUE_RECORDING,
  DIALOGUE_RESULT,
  DIALOGUE_ERROR,
  pickRandom,
} from "./ProutDialogue";
import { SFX } from "../lib/soundEffects";
import "./Recorder.css";

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

const HUMEUR_EMOJIS = ["😊", "😤", "😂", "😴", "🤔", "😐", "🥴", "😌"];

// ── Component ────────────────────────────────────────────

export function Recorder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const pianoRollCanvasRef = useRef<HTMLCanvasElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  // Long recording mode
  const [longMode, setLongMode] = useState(false);

  // Live stats during recording
  const [liveStats, setLiveStats] = useState({
    peakDb: -100,
    peakNote: null as string | null,
    noteCount: 0,
    elapsedMs: 0,
  });
  const liveStatsRef = useRef(liveStats);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef<number>(0);

  // Live waveform — phosphor green on dark screen
  const handleLiveFrame = useCallback(
    (buffer: Float32Array, fftData?: Uint8Array) => {
      // Oscilloscope
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
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
        }
      }

      // Spectrogram waterfall
      const sg = spectrogramCanvasRef.current;
      if (sg && fftData) {
        const ctx2 = sg.getContext("2d");
        if (ctx2) {
          // Shift existing pixels left by 1px
          const imageData = ctx2.getImageData(1, 0, sg.width - 1, sg.height);
          ctx2.putImageData(imageData, 0, 0);
          // Draw new column on right
          const binCount = fftData.length;
          const step = binCount / sg.height;
          for (let y = 0; y < sg.height; y++) {
            const bin = Math.floor((sg.height - 1 - y) * step);
            const v = fftData[bin] ?? 0; // 0-255
            const r =
              v > 192 ? 255 : v > 128 ? Math.floor((v - 128) * 4) : 0;
            const g =
              v > 64 ? Math.min(255, Math.floor((v - 64) * 2.5)) : 0;
            const b =
              v < 128
                ? Math.min(255, v * 2)
                : Math.max(0, 255 - (v - 128) * 4);
            ctx2.fillStyle = `rgb(${r},${g},${b})`;
            ctx2.fillRect(sg.width - 1, y, 1, 1);
          }
        }
      }

      // Piano roll waterfall (uses liveNote from state — captured via ref below)
      const currentNote = liveNoteRef.current;
      const pr = pianoRollCanvasRef.current;
      if (pr) {
        const ctx3 = pr.getContext("2d");
        if (ctx3) {
          const img = ctx3.getImageData(1, 0, pr.width - 1, pr.height);
          ctx3.putImageData(img, 0, 0);
          ctx3.fillStyle = "#0A0F1A";
          ctx3.fillRect(pr.width - 1, 0, 1, pr.height);
          if (currentNote) {
            const midiNorm = Math.max(
              0,
              Math.min(1, (currentNote.midi - 36) / 48)
            );
            const y = Math.floor((1 - midiNorm) * (pr.height - 4));
            const hue = (currentNote.midi % 12) * 30;
            ctx3.fillStyle = `hsl(${hue}, 90%, 60%)`;
            ctx3.fillRect(pr.width - 2, y, 2, 4);
          }
        }
      }
    },
    []
  );

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
    setMaxDuration,
  } = useRecorder(handleLiveFrame);

  // Keep a ref to liveNote so handleLiveFrame (memoized) can access the latest value
  const liveNoteRef = useRef(liveNote);
  useEffect(() => {
    liveNoteRef.current = liveNote;
  }, [liveNote]);
  const { user } = useAuth();

  // Sync long mode → setMaxDuration
  useEffect(() => {
    setMaxDuration(longMode ? 5 * 60 * 1000 : 30_000);
  }, [longMode, setMaxDuration]);

  // Live stats: update peakDb and peakNote when liveDb / liveNote change during recording
  useEffect(() => {
    if (status !== "recording") return;
    setLiveStats((prev) => {
      const next = { ...prev };
      if (liveDb > prev.peakDb) next.peakDb = liveDb;
      if (liveNote) {
        next.peakNote = `${liveNote.note}${liveNote.octave}`;
        next.noteCount = prev.noteCount + 1;
      }
      liveStatsRef.current = next;
      return next;
    });
  }, [liveDb, liveNote, status]);

  // Elapsed timer during recording
  useEffect(() => {
    if (status === "recording") {
      recordStartRef.current = performance.now();
      elapsedTimerRef.current = setInterval(() => {
        setLiveStats((prev) => {
          const next = {
            ...prev,
            elapsedMs: performance.now() - recordStartRef.current,
          };
          liveStatsRef.current = next;
          return next;
        });
      }, 250);
    } else {
      if (elapsedTimerRef.current !== null) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
      if (status === "idle" || status === "done") {
        setLiveStats({ peakDb: -100, peakNote: null, noteCount: 0, elapsedMs: 0 });
      }
    }
    return () => {
      if (elapsedTimerRef.current !== null) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
    };
  }, [status]);

  // Metadata
  const [alimentation, setAlimentation] = useState("");
  const [lieu, setLieu] = useState("");
  const [odeur, setOdeur] = useState("");
  const [humeur, setHumeur] = useState("");
  const [social, setSocial] = useState(false);
  const [chercheurNote, setChercheurNote] = useState("");

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [noteKey, setNoteKey] = useState(0);
  const prevNoteRef = useRef<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Putois mascot & dialogue
  const [putoisState, setPutoisState] = useState<PutoisState>("idle");
  const { dialogue, speak, dismiss } = useProutDialogue();

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

  // Idle flat line
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

  // Result waveform
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

  // Putois + dialogue reactions to status changes
  useEffect(() => {
    if (status === "idle") {
      setPutoisState("idle");
    } else if (status === "recording") {
      setPutoisState("listening");
      speak(pickRandom(DIALOGUE_RECORDING), "center");
    } else if (status === "done") {
      setPutoisState("surprised");
      setTimeout(() => setPutoisState("idle"), 1200);
      speak(pickRandom(DIALOGUE_RESULT), "center");
    } else if (status === "error") {
      speak(pickRandom(DIALOGUE_ERROR), "center");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Idle dialogue on mount
  useEffect(() => {
    const t = setTimeout(() => {
      speak(pickRandom(DIALOGUE_IDLE), "center");
    }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    SFX.recordStart();
    await start();
  }, [start]);

  const handleStop = useCallback(async () => {
    triggerHaptic("heavy");
    SFX.recordStop();
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
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) *
      duration;
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
        humeur: humeur || undefined,
        social,
        chercheur_note: chercheurNote || undefined,
      });
      setSaved(true);
      SFX.success();
      speak("Relevé certifié — versé au corpus.", "center");
    } catch {
      setSaveError(
        "Sauvegarde impossible — vérifie ta configuration Supabase (.env) et que tu es connecté."
      );
      speak(pickRandom(DIALOGUE_ERROR), "center");
    }
  };

  const handleReset = () => {
    if (result && !saved) {
      setResetConfirm(true);
      return;
    }
    doReset();
  };

  const doReset = () => {
    reset();
    setSaved(false);
    setSaveError(null);
    setAlimentation("");
    setLieu("");
    setOdeur("");
    setHumeur("");
    setSocial(false);
    setChercheurNote("");
    setShowShare(false);
    setPlayError(null);
    setResetConfirm(false);
    dismiss();
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

        {/* Oscilloscope screen */}
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

        {/* Spectrogram */}
        <div className="spectrogram-screen">
          <canvas
            ref={spectrogramCanvasRef}
            className="spectrogram-canvas"
            width={320}
            height={80}
          />
        </div>

        {/* Piano roll */}
        <div className="piano-roll-screen">
          <canvas
            ref={pianoRollCanvasRef}
            className="piano-roll-canvas"
            width={320}
            height={60}
          />
        </div>

        {/* VU meter */}
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

        {/* Decorative cables */}
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

        <div className="instr-nameplate">TUNEMYFART LABS — MK.II</div>
      </div>

      {/* ── Lab table decoration ── */}
      <div className="lab-table-wrap" aria-hidden="true">
        <LabTableDecor height={90} />
      </div>

      {/* ── Putois mascot + dialogue ── */}
      <div className="putois-zone">
        <div className="putois-anchor">
          {dialogue && (
            <ProutDialogue
              key={dialogue.key}
              message={dialogue.message}
              align={dialogue.align}
              onDismiss={dismiss}
            />
          )}
          <PutoisMascot state={putoisState} size={64} />
        </div>
      </div>

      {/* ── Record / Stop buttons ── */}
      {status === "idle" && (
        <div className="record-btn-wrap">
          <div className="long-mode-toggle">
            <button
              className={`mode-toggle-btn${longMode ? " active" : ""}`}
              onClick={() => setLongMode((v) => !v)}
            >
              Mode session {longMode ? "ON" : "OFF"}
            </button>
            <span className="mode-toggle-hint">
              {longMode ? "Jusqu'à 5 min" : "30 sec max"}
            </span>
          </div>
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
          {isRecording && (
            <div className="live-stats-panel">
              <div className="live-stat">
                <span className="ls-val">{liveStats.peakDb.toFixed(1)}</span>
                <span className="ls-lbl">dB pic</span>
              </div>
              <div className="live-stat">
                <span className="ls-val">{liveStats.peakNote ?? "—"}</span>
                <span className="ls-lbl">note max</span>
              </div>
              <div className="live-stat">
                <span className="ls-val">{liveStats.noteCount}</span>
                <span className="ls-lbl">événements</span>
              </div>
              <div className="live-stat">
                <span className="ls-val">
                  {formatTime(liveStats.elapsedMs / 1000)}
                </span>
                <span className="ls-lbl">durée</span>
              </div>
            </div>
          )}
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

          {result.timbre && (
            <div className="timbre-emotion-row">
              <div className="timbre-badge">
                <span className="badge-label">Timbre</span>
                <span className="badge-value">{result.timbre.category}</span>
              </div>
              {result.emotion && (
                <div className="emotion-badge">
                  <span className="badge-label">Personnalité</span>
                  <span className="badge-value">{result.emotion.category}</span>
                </div>
              )}
              <div className="musicality-badge">
                <span className="badge-label">Musicalité</span>
                <span className="badge-value">{result.musicalityScore}/100</span>
              </div>
            </div>
          )}

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
                  width: duration
                    ? `${(currentTime / duration) * 100}%`
                    : "0%",
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

              {/* Humeur */}
              <div className="tags-form-field">
                <span className="tags-form-label">Humeur</span>
                <div className="humeur-picker">
                  {HUMEUR_EMOJIS.map((e) => (
                    <button
                      key={e}
                      className={`humeur-btn${humeur === e ? " selected" : ""}`}
                      onClick={() => setHumeur(humeur === e ? "" : e)}
                      aria-label={e}
                      aria-pressed={humeur === e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

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

              {/* Social */}
              <div className="tags-form-field tags-form-field--toggle">
                <div>
                  <span className="tags-form-label">En présence de témoins</span>
                  <span className="tags-form-hint">
                    Collecte socialement contextualisée
                  </span>
                </div>
                <button
                  className={`social-toggle${social ? " on" : ""}`}
                  onClick={() => setSocial((v) => !v)}
                  role="switch"
                  aria-checked={social}
                  aria-label="En présence de témoins"
                >
                  <span className="toggle-knob" />
                </button>
              </div>

              {/* Note du chercheur */}
              <label className="tags-form-field">
                Note du chercheur
                <textarea
                  className="chercheur-note-area"
                  value={chercheurNote}
                  onChange={(e) => setChercheurNote(e.target.value)}
                  placeholder="Observations libres sur ce spécimen…"
                  rows={2}
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

          {/* Confirm before discard */}
          {resetConfirm ? (
            <div className="reset-confirm">
              <p className="reset-confirm-text">
                Ce relevé n'a pas été certifié. L'abandonner ?
              </p>
              <div className="reset-confirm-actions">
                <button className="reset-confirm-cancel" onClick={() => setResetConfirm(false)}>
                  Annuler
                </button>
                <button className="reset-confirm-ok" onClick={doReset}>
                  Abandonner
                </button>
              </div>
            </div>
          ) : (
            <button className="reset-btn" onClick={handleReset}>
              Nouvelle analyse
            </button>
          )}
        </div>
      )}

      {showShare && result && (
        <ShareCard result={result} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

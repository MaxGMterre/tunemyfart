import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";
import { useRecorder } from "../lib/useRecorder";
import { saveRecording, uploadAudio } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { ShareCard } from "./ShareCard";
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
import { generateWeaponFromRecording, saveWeapon } from "../lib/weapons";
import type { Weapon } from "../lib/weapons";
import { useToast } from "./ui/Toast";
import { NewWeaponModal } from "./NewWeaponModal";
import "./Recorder.css";

// ── Helpers ────────────────────────────────────────────────

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

const HUMEUR_EMOJIS = ["😊", "😤", "😂", "😴", "🤔", "😐", "🥴", "😌"];

// ── LED Ampoule ────────────────────────────────────────────

type LedColor = "green" | "blue" | "red" | "yellow";

const LED_CFG: Record<LedColor, { filament: string; fill: string }> = {
  green:  { filament: "#7BC24A", fill: "rgba(90,143,58,0.22)"  },
  blue:   { filament: "#5A9BC2", fill: "rgba(61,107,142,0.20)" },
  red:    { filament: "#E86050", fill: "rgba(196,61,43,0.22)"  },
  yellow: { filament: "#E0A82A", fill: "rgba(200,150,26,0.22)" },
};

function LedAmpoule({ on, color, label }: { on: boolean; color: LedColor; label: string }) {
  const cfg = LED_CFG[color];
  const uid = `${color}`;
  return (
    <div className="ampoule-wrap">
      <div className={`ampoule-halo ampoule-halo--${color}${on ? " on" : ""}`} />
      <svg viewBox="0 0 36 46" width="36" height="46">
        <defs>
          <radialGradient id={`bulb-${uid}`} cx="42%" cy="35%">
            <stop offset="0%" stopColor="#F5EDD5" />
            <stop offset="60%" stopColor="#DED2B0" />
            <stop offset="100%" stopColor="#C4B890" />
          </radialGradient>
          <linearGradient id={`sock-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#D4A94B" />
            <stop offset="50%"  stopColor="#B8862A" />
            <stop offset="100%" stopColor="#8B6519" />
          </linearGradient>
        </defs>

        {/* Verre */}
        <ellipse cx="18" cy="17" rx="11" ry="14"
          fill={`url(#bulb-${uid})`} stroke="#B0A070" strokeWidth="0.8" />

        {/* Overlay allumé */}
        {on && <ellipse cx="18" cy="17" rx="11" ry="14" fill={cfg.fill} />}

        {/* Filament zigzag */}
        <path d="M16 28 Q17 23 15.5 19 Q14 15 17 11 Q20 15 18.5 19 Q17 23 20 28"
          fill="none"
          stroke={on ? cfg.filament : "#8B8070"}
          strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Trait horizontal filament */}
        <line x1="14" y1="19" x2="22" y2="19"
          stroke={on ? cfg.filament : "#8B8070"} strokeWidth="0.6" opacity="0.45" />

        {/* Reflet */}
        <ellipse cx="13" cy="11" rx="2" ry="3.2"
          fill="rgba(255,255,255,0.5)"
          transform="rotate(-25 13 11)"
          opacity={on ? 0.52 : 0.32} />

        {/* Culot brass */}
        <rect x="12" y="30" width="12" height="6" rx="0.8"
          fill={`url(#sock-${uid})`} />
        <line x1="12" y1="31.2" x2="24" y2="31.2" stroke="#6B4E18" strokeWidth="0.8" />
        <line x1="13" y1="33"   x2="23" y2="33"   stroke="rgba(0,0,0,0.28)" strokeWidth="0.5" />
        <line x1="13" y1="34.4" x2="23" y2="34.4" stroke="rgba(0,0,0,0.28)" strokeWidth="0.5" />

        {/* Base */}
        <rect x="14" y="36" width="8" height="3" rx="0.5" fill="#5A3D08" />
        {/* Contact */}
        <rect x="15" y="39" width="6" height="1.5" rx="0.4" fill="#3A2A08" />
      </svg>
      <span className={`ampoule-label${on ? " on" : ""}`}>{label}</span>
    </div>
  );
}

// ── VU-mètre ───────────────────────────────────────────────

function VuMeterInstrument({ db }: { db: number }) {
  const clamped = Math.max(-60, Math.min(0, db ?? -60));
  const norm = (clamped + 60) / 60;
  const targetAngle = -60 + norm * 120;
  const springAngle = useSpring(targetAngle, { stiffness: 160, damping: 15, mass: 0.9 });

  useEffect(() => { springAngle.set(targetAngle); }, [targetAngle, springAngle]);

  const dbLabel = db > -60 ? db.toFixed(1) : "—";

  return (
    <div className="vu-metre-boite">
      <div className="boite-reflet" />
      <svg viewBox="0 0 130 75" width="130" height="75">
        <defs>
          <linearGradient id="vuArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#5A8F3A" />
            <stop offset="55%"  stopColor="#B8862A" />
            <stop offset="80%"  stopColor="#C43D2B" />
            <stop offset="100%" stopColor="#7A1E14" />
          </linearGradient>
          <linearGradient id="pivotGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E4C572" />
            <stop offset="100%" stopColor="#8B6519" />
          </linearGradient>
        </defs>

        {/* Fond ivoire */}
        <path d="M 10 70 A 55 55 0 0 1 120 70" fill="#F0E6C8" />

        {/* Arc coloré principal */}
        <path d="M 10 70 A 55 55 0 0 1 120 70"
          fill="none" stroke="url(#vuArc)" strokeWidth="3.5" opacity="0.92" strokeLinecap="round" />

        {/* Arc encre fin */}
        <path d="M 10 70 A 55 55 0 0 1 120 70"
          fill="none" stroke="#2D2418" strokeWidth="0.7" opacity="0.25" />

        {/* Graduations */}
        {([-60, -50, -40, -30, -20, -10, -5, 0] as const).map((v, i) => {
          const n = (v + 60) / 60;
          const a = (-90 + n * 180) * (Math.PI / 180);
          const long = i % 3 === 0;
          const r1 = long ? 42 : 46;
          return (
            <line key={v}
              x1={65 + Math.sin(a) * 53} y1={70 - Math.cos(a) * 53}
              x2={65 + Math.sin(a) * r1} y2={70 - Math.cos(a) * r1}
              stroke="#2D2418" strokeWidth={long ? "1.1" : "0.65"} />
          );
        })}

        {/* Labels */}
        {([-40, -20, 0] as const).map((v) => {
          const n = (v + 60) / 60;
          const a = (-90 + n * 180) * (Math.PI / 180);
          return (
            <text key={v}
              x={65 + Math.sin(a) * 35} y={70 - Math.cos(a) * 35 + 2}
              textAnchor="middle" fontSize="5" fill="#4A3628" fontFamily="monospace">
              {v}
            </text>
          );
        })}

        {/* Aiguille */}
        <motion.line
          x1="65" y1="70" x2="65" y2="20"
          stroke="#2D2418" strokeWidth="2.2" strokeLinecap="round"
          style={{ rotate: springAngle, transformOrigin: "65px 70px" }}
        />
        <motion.line
          x1="65" y1="70" x2="65" y2="20"
          stroke="#E05040" strokeWidth="1.3" strokeLinecap="round"
          style={{ rotate: springAngle, transformOrigin: "65px 70px" }}
        />

        {/* Pivot */}
        <circle cx="65" cy="70" r="5"   fill="#1A1008" />
        <circle cx="65" cy="70" r="3.8" fill="url(#pivotGrad)" />
        <circle cx="64" cy="69" r="1.1" fill="rgba(255,255,255,0.5)" />
      </svg>
      <span className="instrument-label">{dbLabel} dB SPL</span>
    </div>
  );
}

// ── Cadran fréquence ───────────────────────────────────────

function FreqCadranInstrument({ freq }: { freq: number }) {
  const logMin = Math.log10(20);
  const logMax = Math.log10(20000);
  const logFreq = freq > 0 ? Math.log10(Math.max(20, Math.min(20000, freq))) : logMin;
  const norm = (logFreq - logMin) / (logMax - logMin);
  const angle = -125 + norm * 250;
  const rad = (angle * Math.PI) / 180;
  const nx = 37.5 + Math.sin(rad) * 20;
  const ny = 37.5 - Math.cos(rad) * 20;

  const freqLabel = freq > 0
    ? freq < 1000 ? `${freq.toFixed(0)} Hz` : `${(freq / 1000).toFixed(1)}k Hz`
    : "— Hz";

  return (
    <div className="freq-cadran-boite">
      <div className="boite-reflet" />
      <svg viewBox="0 0 75 75" width="75" height="75">
        <defs>
          <radialGradient id="freqBg" cx="45%" cy="40%">
            <stop offset="0%" stopColor="#F0E6C8" />
            <stop offset="100%" stopColor="#DDD0AA" />
          </radialGradient>
          <radialGradient id="freqPivot" cx="35%" cy="32%">
            <stop offset="0%" stopColor="#E4C572" />
            <stop offset="100%" stopColor="#8B6519" />
          </radialGradient>
        </defs>

        {/* Anneau brass */}
        <circle cx="37.5" cy="37.5" r="35" fill="none" stroke="#B8862A" strokeWidth="5" />

        {/* Fond crème */}
        <circle cx="37.5" cy="37.5" r="30" fill="url(#freqBg)" />
        <circle cx="37.5" cy="37.5" r="30" fill="none" stroke="#8B6519" strokeWidth="0.8" />
        <circle cx="37.5" cy="37.5" r="30" fill="none" stroke="#2D2418" strokeWidth="0.35" opacity="0.25" />

        {/* Graduations log */}
        {[20, 50, 100, 200, 500, 1000, 5000, 20000].map((f) => {
          const lf = Math.log10(f);
          const n = (lf - logMin) / (logMax - logMin);
          const a = (-125 + n * 250) * (Math.PI / 180);
          const big = [20, 200, 20000].includes(f);
          const r1 = big ? 22 : 24;
          return (
            <line key={f}
              x1={37.5 + Math.sin(a) * 28} y1={37.5 - Math.cos(a) * 28}
              x2={37.5 + Math.sin(a) * r1} y2={37.5 - Math.cos(a) * r1}
              stroke="#2D2418" strokeWidth={big ? "1.1" : "0.65"} />
          );
        })}

        {/* Aiguille brass (double trait) */}
        <line x1="37.5" y1="37.5" x2={nx} y2={ny}
          stroke="#8B6519" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="37.5" y1="37.5" x2={nx} y2={ny}
          stroke="#E4C572" strokeWidth="1" strokeLinecap="round" />

        {/* Pivot */}
        <circle cx="37.5" cy="37.5" r="4"   fill="#1A1008" />
        <circle cx="37.5" cy="37.5" r="3"   fill="url(#freqPivot)" />
        <circle cx="36.7" cy="36.7" r="0.9" fill="rgba(255,255,255,0.5)" />
      </svg>
      <span className="instrument-label">{freqLabel}</span>
    </div>
  );
}

// ── Waveform SVG ───────────────────────────────────────────

function WaveformSVG({ waveform }: { waveform: number[] }) {
  if (!waveform.length) return null;
  const W = 300, H = 34, mid = H / 2;
  const step = W / waveform.length;
  let d1 = "", d2 = "";
  waveform.forEach((v, i) => {
    const x = (i * step).toFixed(1);
    const y1 = (mid - v * mid * 1.3).toFixed(1);
    const y2 = (mid + v * mid * 0.9).toFixed(1);
    d1 += i === 0 ? `M${x},${y1}` : `L${x},${y1}`;
    d2 += i === 0 ? `M${x},${y2}` : `L${x},${y2}`;
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      <path d={d2} fill="none" stroke="#B8862A" strokeWidth="0.9" opacity="0.65" />
      <path d={d1} fill="none" stroke="#2D2418" strokeWidth="1.3" />
    </svg>
  );
}

// ── Composant principal ────────────────────────────────────

export function Recorder() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const pianoRollCanvasRef = useRef<HTMLCanvasElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const [longMode, setLongMode] = useState(false);
  const [liveStats, setLiveStats] = useState({
    peakDb: -100, peakNote: null as string | null, noteCount: 0, elapsedMs: 0,
  });
  const liveStatsRef = useRef(liveStats);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef<number>(0);

  const handleLiveFrame = useCallback((buffer: Float32Array, fftData?: Uint8Array) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const w = canvas.width, h = canvas.height, mid = h / 2;
        ctx.fillStyle = "#0A2010";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#7BC24A";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(123,194,74,0.5)";
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
    const sg = spectrogramCanvasRef.current;
    if (sg && fftData) {
      const ctx2 = sg.getContext("2d");
      if (ctx2) {
        const imageData = ctx2.getImageData(1, 0, sg.width - 1, sg.height);
        ctx2.putImageData(imageData, 0, 0);
        const step = fftData.length / sg.height;
        for (let y = 0; y < sg.height; y++) {
          const bin = Math.floor((sg.height - 1 - y) * step);
          const v = fftData[bin] ?? 0;
          const r = v > 192 ? 255 : v > 128 ? Math.floor((v - 128) * 4) : 0;
          const g = v > 64 ? Math.min(255, Math.floor((v - 64) * 2.5)) : 0;
          const b = v < 128 ? Math.min(255, v * 2) : Math.max(0, 255 - (v - 128) * 4);
          ctx2.fillStyle = `rgb(${r},${g},${b})`;
          ctx2.fillRect(sg.width - 1, y, 1, 1);
        }
      }
    }
    const currentNote = liveNoteRef.current;
    const pr = pianoRollCanvasRef.current;
    if (pr) {
      const ctx3 = pr.getContext("2d");
      if (ctx3) {
        const img = ctx3.getImageData(1, 0, pr.width - 1, pr.height);
        ctx3.putImageData(img, 0, 0);
        ctx3.fillStyle = "#0A2010";
        ctx3.fillRect(pr.width - 1, 0, 1, pr.height);
        if (currentNote) {
          const midiNorm = Math.max(0, Math.min(1, (currentNote.midi - 36) / 48));
          const y = Math.floor((1 - midiNorm) * (pr.height - 4));
          ctx3.fillStyle = `hsl(${(currentNote.midi % 12) * 30},90%,60%)`;
          ctx3.fillRect(pr.width - 2, y, 2, 4);
        }
      }
    }
  }, []);

  const {
    status, liveNote, liveDb, liveFrequency, result, error,
    start, stop, reset, setMaxDuration,
  } = useRecorder(handleLiveFrame);

  const liveNoteRef = useRef(liveNote);
  useEffect(() => { liveNoteRef.current = liveNote; }, [liveNote]);

  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    setMaxDuration(longMode ? 5 * 60 * 1000 : 30_000);
  }, [longMode, setMaxDuration]);

  useEffect(() => {
    if (status !== "recording") return;
    setLiveStats((prev) => {
      const next = { ...prev };
      if (liveDb > prev.peakDb) next.peakDb = liveDb;
      if (liveNote) { next.peakNote = `${liveNote.note}${liveNote.octave}`; next.noteCount = prev.noteCount + 1; }
      liveStatsRef.current = next;
      return next;
    });
  }, [liveDb, liveNote, status]);

  useEffect(() => {
    if (status === "recording") {
      recordStartRef.current = performance.now();
      elapsedTimerRef.current = setInterval(() => {
        setLiveStats((prev) => {
          const next = { ...prev, elapsedMs: performance.now() - recordStartRef.current };
          liveStatsRef.current = next;
          return next;
        });
      }, 250);
    } else {
      if (elapsedTimerRef.current !== null) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
      if (status === "idle" || status === "done")
        setLiveStats({ peakDb: -100, peakNote: null, noteCount: 0, elapsedMs: 0 });
    }
    return () => { if (elapsedTimerRef.current !== null) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; } };
  }, [status]);

  const [alimentation, setAlimentation] = useState("");
  const [lieu, setLieu] = useState("");
  const [odeur, setOdeur] = useState("");
  const [humeur, setHumeur] = useState("");
  const [social, setSocial] = useState(false);
  const [chercheurNote, setChercheurNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newWeapon, setNewWeapon] = useState<Weapon | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [noteKey, setNoteKey] = useState(0);
  const prevNoteRef = useRef<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { dialogue, speak, dismiss } = useProutDialogue();

  const isRecording = status === "recording";

  useEffect(() => {
    const current = liveNote ? `${liveNote.note}${liveNote.octave}` : null;
    if (current !== prevNoteRef.current) { prevNoteRef.current = current; setNoteKey((k) => k + 1); }
  }, [liveNote]);

  useEffect(() => {
    if (status !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0A2010";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(123,194,74,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, [status]);

  useEffect(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height, mid = h / 2;
    ctx.fillStyle = "#0A2010";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#7BC24A";
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 5;
    ctx.shadowColor = "rgba(123,194,74,0.4)";
    ctx.beginPath();
    const step = w / result.waveform.length;
    result.waveform.forEach((v, i) => {
      const x = i * step;
      const y = mid - v * mid * 1.35;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [result]);

  useEffect(() => {
    if (status === "recording") speak(pickRandom(DIALOGUE_RECORDING), "center");
    else if (status === "done") speak(pickRandom(DIALOGUE_RESULT), "center");
    else if (status === "error") speak(pickRandom(DIALOGUE_ERROR), "center");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const t = setTimeout(() => { speak(pickRandom(DIALOGUE_IDLE), "center"); }, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsPlaying(false); setCurrentTime(0); setDuration(0); setPlayError(null);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => { if (!isNaN(audio.duration)) setDuration(audio.duration); };
    const onCanPlay = () => { if (!isNaN(audio.duration)) setDuration(audio.duration); };
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("canplaythrough", onCanPlay);
    audio.addEventListener("ended", onEnded);
    if (audio.readyState >= 1 && !isNaN(audio.duration)) setDuration(audio.duration);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("canplaythrough", onCanPlay);
      audio.removeEventListener("ended", onEnded);
    };
  }, [result]);

  useEffect(() => {
    if (status !== "done" || !result) return;
    if (result.dbMax > -15 || result.durationMs > 3000) triggerHaptic("victory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleStart = useCallback(async () => { triggerHaptic("light"); SFX.recordStart(); await start(); }, [start]);
  const handleStop  = useCallback(async () => { triggerHaptic("heavy"); SFX.recordStop();  await stop();  }, [stop]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlayError(null);
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else audio.play().then(() => setIsPlaying(true)).catch((e: Error) => setPlayError("Lecture impossible — " + (e?.message ?? "erreur inconnue")));
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
      try { audio_url = await uploadAudio(result.blob, user.id); } catch {} finally { setUploading(false); }
    }
    const freqs = result.sequenceNotes.map((n) => n.frequency).filter((f) => f > 0 && isFinite(f));
    try {
      const savedData = await saveRecording({
        audio_url, db_max: result.dbMax, db_avg: result.dbAvg,
        note_principale: result.notePrincipale,
        sequence_notes: result.sequenceNotes.map((n) => ({ note: n.note, frequency: n.frequency, t: n.t })),
        duree_ms: result.durationMs, waveform_data: result.waveform,
        alimentation, lieu, odeur, user_id: user?.id,
        freq_max: freqs.length ? Math.max(...freqs) : null,
        freq_min: freqs.length ? Math.min(...freqs) : null,
        notes_count: result.sequenceNotes.length,
        humeur: humeur || undefined, social,
        chercheur_note: chercheurNote || undefined,
      });
      setSaved(true); SFX.success(); speak("Relevé certifié — versé au corpus.", "center");
      if (user) {
        const weapon = generateWeaponFromRecording({
          id: savedData?.id, db_max: result.dbMax, duree_ms: result.durationMs,
          notes_count: result.sequenceNotes?.length ?? 0, note_principale: result.notePrincipale,
        });
        saveWeapon(user.id, weapon).then((savedWeapon) => {
          if (savedWeapon) { showToast(`⚔️ ${savedWeapon.name} (${savedWeapon.rarity})`, "success"); setNewWeapon(savedWeapon); }
        }).catch(() => {});
      }
    } catch {
      setSaveError("Sauvegarde impossible — vérifie ta connexion.");
      speak(pickRandom(DIALOGUE_ERROR), "center");
    }
  };

  const handleReset = () => {
    if (result && !saved) { setResetConfirm(true); return; }
    doReset();
  };

  const doReset = () => {
    reset(); setSaved(false); setSaveError(null); setAlimentation(""); setLieu("");
    setOdeur(""); setHumeur(""); setSocial(false); setChercheurNote("");
    setShowShare(false); setPlayError(null); setResetConfirm(false); dismiss();
  };

  const recLabel = isRecording ? `STOP · ${formatTime(liveStats.elapsedMs / 1000)}` : "REC";

  const statusLabel = isRecording          ? "ENREGISTREMENT EN COURS…"
    : status === "done"                    ? "ANALYSE TERMINÉE"
    : status === "processing"              ? "TRAITEMENT DU SIGNAL…"
    : status === "requesting"              ? "AUTORISATION MICROPHONE…"
    : "PRÊT — APPUYER POUR DÉBUTER L'ANALYSE";

  const ecranIndicateur = isRecording        ? "● RECORDING"
    : status === "processing"               ? "● ANALYSIS"
    : "● READY";

  return (
    <div className="analyser-panel">
      {/* Canvas masqués — logique spectrogram/piano-roll préservée */}
      <canvas ref={spectrogramCanvasRef} width={320} height={60} style={{ display: "none" }} />
      <canvas ref={pianoRollCanvasRef}   width={320} height={40} style={{ display: "none" }} />

      {/* ── 1. Plaque brass ─────────────────────────────── */}
      <div className="plaque-brass">
        <div className="plaque-ornement plaque-ornement--l" />
        <div className="plaque-centre">
          <p className="plaque-titre">L'ANAL-YSER</p>
          <p className="plaque-subtitle">OUTIL D'ANALYSE DE FRÉQUENCE BIOACOUSTIQUE</p>
          <p className="plaque-mention">MODÈLE MK.II · LABORATOIRE PROUT · EST. 1897</p>
        </div>
        <div className="plaque-ornement plaque-ornement--r" />
      </div>

      {/* ── 2. Panneau instrument ────────────────────────── */}
      <div className="panneau-instrument">
        <div className="vis vis--tl" style={{ "--rot": "15deg"  } as React.CSSProperties} />
        <div className="vis vis--tr" style={{ "--rot": "-20deg" } as React.CSSProperties} />
        <div className="vis vis--bl" style={{ "--rot": "30deg"  } as React.CSSProperties} />
        <div className="vis vis--br" style={{ "--rot": "-45deg" } as React.CSSProperties} />

        {/* 2a — Ampoules */}
        <div className="ampoules-rangee">
          <LedAmpoule on={true}                                   color="green"  label="POWER" />
          <LedAmpoule on={status === "idle" || status === "done"} color="blue"   label="READY" />
          <LedAmpoule on={isRecording}                            color="red"    label="REC"   />
          <LedAmpoule on={liveDb > -40}                           color="yellow" label="SIG"   />
        </div>

        {/* 2b — Écran phosphore */}
        <div className="ecran-phosphore">
          <canvas ref={canvasRef} className="ecran-canvas" width={600} height={80} />
          <div className="ecran-scanlines"  aria-hidden="true" />
          <div className="ecran-phosphor-pulse" aria-hidden="true" />
          <div className={`ecran-indicateur${isRecording ? " rec" : ""}`}>
            {ecranIndicateur}
          </div>
          {(liveNote || liveFrequency > 0) && (
            <div className="ecran-note-display">
              <span className="ecran-note" key={noteKey}>
                {liveNote ? `${liveNote.note}${liveNote.octave}` : "—"}
              </span>
              {liveFrequency > 0 && (
                <span className="ecran-freq">{liveFrequency.toFixed(0)} Hz</span>
              )}
            </div>
          )}
        </div>

        {/* 2c — VU-mètre + Cadran fréquence */}
        <div className="instruments-rangee">
          <VuMeterInstrument db={liveDb} />
          <FreqCadranInstrument freq={liveFrequency} />
        </div>
      </div>

      {/* ── 3. Bouton REC ────────────────────────────────── */}
      {status !== "done" && (
        <div className="rec-section">
          {status === "idle" && (
            <button
              className={`mode-session-btn${longMode ? " active" : ""}`}
              onClick={() => setLongMode((v) => !v)}
            >
              Session {longMode ? "5 min" : "30 sec"}
            </button>
          )}

          <div className="rec-halo-zone">
            <div className={`rec-halo${isRecording ? " pulsing" : ""}`} />
            <motion.button
              className={`bouton-rec${isRecording ? " recording" : ""}`}
              onClick={isRecording ? handleStop : handleStart}
              aria-label={isRecording ? "Arrêter l'analyse" : "Démarrer l'analyse"}
              whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 500 } }}
            >
              <div className="rec-vis rec-vis--top"    />
              <div className="rec-vis rec-vis--right"  />
              <div className="rec-vis rec-vis--bottom" />
              <div className="rec-vis rec-vis--left"   />
              <span className="bouton-rec-texte">{recLabel}</span>
            </motion.button>
          </div>

          <p className="rec-statut">{statusLabel}</p>
          {status === "error" && error && <p className="error-text">{error}</p>}
        </div>
      )}

      {/* ── 4. Carte dernier relevé ──────────────────────── */}
      {status === "done" && result && (
        <motion.div
          className="carte-releve"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
        >
          <span className="carte-etiquette">DERNIER RELEVÉ</span>

          <div className="carte-grille">
            <div className="carte-stat">
              <span className="carte-lbl">NOTE</span>
              <span className="carte-val carte-val--note">{result.notePrincipale || "—"}</span>
            </div>
            <div className="carte-stat">
              <span className="carte-lbl">dB MAX</span>
              <span className="carte-val">{result.dbMax.toFixed(1)}</span>
            </div>
            <div className="carte-stat">
              <span className="carte-lbl">DURÉE</span>
              <span className="carte-val">{(result.durationMs / 1000).toFixed(1)}s</span>
            </div>
            <div className="carte-stat">
              <span className="carte-lbl">ÉVÉNEM.</span>
              <span className="carte-val">{result.sequenceNotes.length}</span>
            </div>
          </div>

          <div className="carte-waveform">
            <WaveformSVG waveform={result.waveform} />
          </div>

          <audio ref={audioRef} src={result.url} preload="metadata" />

          <div className="carte-actions">
            <button className="btn-ghost" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Réécouter"}>
              {isPlaying ? "⏸ Pause" : "▶ Réécouter"}
            </button>
            <button className="btn-ghost" onClick={() => setShowShare(true)}>Diffuser</button>
            {!saved ? (
              <button className="btn-primary" onClick={handleSave} disabled={uploading}>
                {uploading ? "Envoi…" : "Certifier"}
              </button>
            ) : (
              <span className="success-text">Certifié ✓</span>
            )}
          </div>

          {isPlaying && (
            <div className="audio-progress-sci" onClick={seekTo}>
              <div className="audio-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }} />
              <span className="audio-time">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          )}
          {playError && <p className="error-text">{playError}</p>}

          <details className="tags-details">
            <summary className="tags-summary">Métadonnées du spécimen</summary>
            <div className="tags-form">
              <div className="tags-form-field">
                <span className="tags-form-label">Humeur</span>
                <div className="humeur-picker">
                  {HUMEUR_EMOJIS.map((e) => (
                    <button key={e}
                      className={`humeur-btn${humeur === e ? " selected" : ""}`}
                      onClick={() => setHumeur(humeur === e ? "" : e)}
                      aria-label={e} aria-pressed={humeur === e}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <label className="tags-form-field">
                Alimentation
                <input value={alimentation} onChange={(e) => setAlimentation(e.target.value)} placeholder="ex: chou-fleur, bière" />
              </label>
              <label className="tags-form-field">
                Lieu de collecte
                <input value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="ex: salon, bureau" />
              </label>
              <label className="tags-form-field">
                Signature olfactive
                <input value={odeur} onChange={(e) => setOdeur(e.target.value)} placeholder="ex: discret, dévastateur" />
              </label>
              <div className="tags-form-field tags-form-field--toggle">
                <span className="tags-form-label">En présence de témoins</span>
                <button className={`social-toggle${social ? " on" : ""}`}
                  onClick={() => setSocial((v) => !v)}
                  role="switch" aria-checked={social} aria-label="En présence de témoins">
                  <span className="toggle-knob" />
                </button>
              </div>
              <label className="tags-form-field">
                Note du chercheur
                <textarea className="chercheur-note-area" value={chercheurNote}
                  onChange={(e) => setChercheurNote(e.target.value)}
                  placeholder="Observations libres…" rows={2} />
              </label>
              {uploading  && <p className="status-text">Transmission…</p>}
              {saveError  && <p className="error-text">{saveError}</p>}
              <button className="save-btn" onClick={handleSave} disabled={uploading}>
                {uploading ? "Transmission…" : "Certifier le relevé"}
              </button>
            </div>
          </details>

          {resetConfirm ? (
            <div className="reset-confirm">
              <p className="reset-confirm-text">Ce relevé n'a pas été certifié. L'abandonner ?</p>
              <div className="reset-confirm-actions">
                <button className="reset-confirm-cancel" onClick={() => setResetConfirm(false)}>Annuler</button>
                <button className="reset-confirm-ok"     onClick={doReset}>Abandonner</button>
              </div>
            </div>
          ) : (
            <button className="reset-btn" onClick={handleReset}>Nouvelle analyse</button>
          )}
        </motion.div>
      )}

      {dialogue && (
        <div className="dialogue-sci">
          <ProutDialogue key={dialogue.key} message={dialogue.message} align={dialogue.align} onDismiss={dismiss} />
        </div>
      )}

      {showShare && result && <ShareCard result={result} onClose={() => setShowShare(false)} />}
      {newWeapon && <NewWeaponModal weapon={newWeapon} onClose={() => setNewWeapon(null)} />}
    </div>
  );
}

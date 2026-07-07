import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase, saveComposition, fetchUserCompositions } from "../lib/supabase";
import type { Composition, CompositionNote } from "../lib/supabase";
import { NoteCircle, CHROMATIC_NOTES } from "./NoteCircle";
import type { ChromaticNote } from "./NoteCircle";
import { SFX } from "../lib/soundEffects";
import { Studio } from "./Studio";

// ── Note tables ───────────────────────────────────────────

const WHITE_NOTES = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"] as const;
const BLACK_NOTE_POSITIONS: { note: string; pos: number }[] = [
  { note: "Do#", pos: 0.67 },
  { note: "Ré#", pos: 1.67 },
  { note: "Fa#", pos: 3.67 },
  { note: "Sol#", pos: 4.67 },
  { note: "La#", pos: 5.67 },
];
const ALL_NOTES_CHROMATIC = [
  "Do", "Do#", "Ré", "Ré#", "Mi", "Fa",
  "Fa#", "Sol", "Sol#", "La", "La#", "Si",
];
const WHITE_KEY_PCT = 100 / 7;
const OCTAVES = [2, 3] as const;

// Equal-temperament frequencies for octave 4 (A4 = 440 Hz)
// MIDI note 60 = C4, formula: 440 × 2^((midi - 69) / 12)
const NOTE_FREQ: Record<ChromaticNote, number> = {
  C:   261.63,
  "C#":277.18,
  D:   293.66,
  "D#":311.13,
  E:   329.63,
  F:   349.23,
  "F#":369.99,
  G:   392.00,
  "G#":415.30,
  A:   440.00,
  "A#":466.16,
  B:   493.88,
};

// French→English for collected-note display on the NoteCircle
const FR_TO_EN: Record<string, ChromaticNote> = {
  Do: "C", "Do#": "C#", Ré: "D", "Ré#": "D#",
  Mi: "E", Fa: "F", "Fa#": "F#", Sol: "G",
  "Sol#": "G#", La: "A", "La#": "A#", Si: "B",
};

// ── Piano key component ───────────────────────────────────

interface PianoKeyProps {
  note: string;
  octave: number;
  isBlack: boolean;
  unlocked: boolean;
  active: boolean;
  style?: React.CSSProperties;
  onPress: () => void;
  onRelease: () => void;
}

function PianoKey({ note, isBlack, unlocked, active, style, onPress, onRelease }: PianoKeyProps) {
  return (
    <button
      className={[
        "piano-key",
        isBlack ? "black-key" : "white-key",
        unlocked ? "unlocked" : "locked",
        active ? "playing" : "",
      ].filter(Boolean).join(" ")}
      style={style}
      title={`${note} — ${unlocked ? "Jouer" : "Non collectée"}`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); onPress(); }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
    >
      <span className="key-icon">{unlocked ? "▶" : "🔒"}</span>
      {!isBlack && <span className="key-label">{note}</span>}
    </button>
  );
}

// ── Duration formatter ────────────────────────────────────

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}

// ── Composer component ────────────────────────────────────

type ViewMode = "piano" | "circle";

export function Composer() {
  const { user } = useAuth();
  const [showStudio, setShowStudio] = useState(false);
  const [collectedNotes, setCollectedNotes] = useState<Set<string>>(new Set());
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("piano");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Composition recording
  const [isComposing, setIsComposing] = useState(false);
  const [compositionNotes, setCompositionNotes] = useState<CompositionNote[]>([]);
  const [compStartMs, setCompStartMs] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Saved compositions
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Load collected notes
  useEffect(() => {
    if (!user) return;
    supabase
      .from("recordings")
      .select("note_principale")
      .eq("user_id", user.id)
      .not("note_principale", "is", null)
      .then(({ data }) => {
        if (data) {
          setCollectedNotes(new Set(data.map((r) => r.note_principale as string)));
        }
      });
  }, [user]);

  // Load saved compositions
  useEffect(() => {
    if (!user) return;
    fetchUserCompositions(user.id)
      .then(setCompositions)
      .catch(() => {});
  }, [user, savedMsg]);

  // Elapsed timer during composition
  useEffect(() => {
    if (isComposing) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - compStartMs);
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isComposing, compStartMs]);

  // ── Audio playback (piano view — from recordings) ──────

  const playFromRecording = async (note: string, octave: number) => {
    if (!user || !collectedNotes.has(note)) return;
    setActiveNote(`${note}${octave}`);
    setTimeout(() => setActiveNote(null), 800);

    try {
      const { data } = await supabase
        .from("recordings")
        .select("audio_url")
        .eq("user_id", user.id)
        .eq("note_principale", note)
        .not("audio_url", "is", null)
        .order("db_max", { ascending: false })
        .limit(1)
        .single();

      if (!data?.audio_url) return;
      const response = await fetch(data.audio_url);
      const buffer = await response.arrayBuffer();
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }
      const decoded = await audioCtxRef.current.decodeAudioData(buffer);
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = decoded;
      source.connect(audioCtxRef.current.destination);
      source.start();
    } catch {}
  };

  // ── Circle note press ──────────────────────────────────

  const handleCirclePress = (note: ChromaticNote) => {
    const freq = NOTE_FREQ[note];
    setActiveNote(note);
    SFX.noteHit(freq);

    if (isComposing) {
      const t = Date.now() - compStartMs;
      setCompositionNotes((prev) => [
        ...prev,
        { note, frequency: freq, duration_ms: 500, t },
      ]);
    }
  };

  const handleCircleRelease = (_note: ChromaticNote) => {
    setActiveNote(null);
  };

  // ── Piano key handlers ──────────────────────────────────

  const handlePianoPress = (note: string, octave: number) => {
    playFromRecording(note, octave);

    if (isComposing) {
      const en = FR_TO_EN[note];
      if (en) {
        const freq = NOTE_FREQ[en];
        const t = Date.now() - compStartMs;
        setCompositionNotes((prev) => [
          ...prev,
          { note: en, frequency: freq, duration_ms: 500, t },
        ]);
      }
    }
  };

  // ── Composition controls ───────────────────────────────

  const startComposition = () => {
    setCompositionNotes([]);
    setCompStartMs(Date.now());
    setElapsed(0);
    setIsComposing(true);
    SFX.recordStart();
  };

  const stopComposition = () => {
    setIsComposing(false);
    SFX.recordStop();
  };

  const saveComp = async () => {
    if (!user || compositionNotes.length === 0) return;
    setSaving(true);
    try {
      await saveComposition({
        user_id: user.id,
        title: `Composition du ${new Date().toLocaleDateString("fr-FR")}`,
        notes: compositionNotes,
        duration_ms: elapsed,
      });
      SFX.success();
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
      setCompositionNotes([]);
    } catch {}
    setSaving(false);
  };

  const discardComposition = () => {
    setCompositionNotes([]);
    setIsComposing(false);
    setElapsed(0);
  };

  const hasFullOctave = ALL_NOTES_CHROMATIC.every((n) => collectedNotes.has(n));

  // Collected notes mapped to English for the NoteCircle
  const collectedInEnglish = new Set(
    [...collectedNotes].map((n) => FR_TO_EN[n]).filter(Boolean)
  );
  const circleActiveNote =
    activeNote && CHROMATIC_NOTES.includes(activeNote as ChromaticNote)
      ? (activeNote as ChromaticNote)
      : null;

  return (
    <div className="composer-panel">
      {showStudio && <Studio onClose={() => setShowStudio(false)} />}

      <button
        className="composer-studio-btn"
        onClick={() => setShowStudio(true)}
        aria-label="Ouvrir le Studio multi-pistes"
      >
        🎛 Ouvrir le Studio
      </button>

      <p className="composer-subtitle">
        {collectedNotes.size} / 12 notes au corpus
      </p>

      {!hasFullOctave && (
        <div className="composer-unlock-hint">
          🎹 Collecte les 12 notes chromatiques pour débloquer le mode composition complet
        </div>
      )}

      {/* View mode toggle */}
      <div className="composer-view-toggle">
        <button
          className={`composer-view-btn${viewMode === "piano" ? " active" : ""}`}
          onClick={() => setViewMode("piano")}
        >
          Piano
        </button>
        <button
          className={`composer-view-btn${viewMode === "circle" ? " active" : ""}`}
          onClick={() => setViewMode("circle")}
        >
          Cercle
        </button>
      </div>

      {/* ── Piano view ── */}
      {viewMode === "piano" && (
        <div className="piano-wrapper">
          <div className="piano-keyboard">
            {OCTAVES.map((octave) => (
              <div key={octave} className="piano-octave-wrap">
                <div className="piano-octave">
                  {WHITE_NOTES.map((note, i) => (
                    <PianoKey
                      key={`${note}${octave}`}
                      note={note}
                      octave={octave}
                      isBlack={false}
                      unlocked={collectedNotes.has(note)}
                      active={activeNote === `${note}${octave}`}
                      style={{ left: `${i * WHITE_KEY_PCT}%`, width: `${WHITE_KEY_PCT}%` }}
                      onPress={() => handlePianoPress(note, octave)}
                      onRelease={() => {}}
                    />
                  ))}
                  {BLACK_NOTE_POSITIONS.map(({ note, pos }) => (
                    <PianoKey
                      key={`${note}${octave}`}
                      note={note}
                      octave={octave}
                      isBlack={true}
                      unlocked={collectedNotes.has(note)}
                      active={activeNote === `${note}${octave}`}
                      style={{ left: `${pos * WHITE_KEY_PCT}%`, width: `${WHITE_KEY_PCT * 0.62}%` }}
                      onPress={() => handlePianoPress(note, octave)}
                      onRelease={() => {}}
                    />
                  ))}
                </div>
                <div className="piano-octave-label">Octave {octave}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Circle view ── */}
      {viewMode === "circle" && (
        <div className="composer-circle-wrap">
          <NoteCircle
            size={220}
            activeNote={circleActiveNote}
            onNotePress={handleCirclePress}
            onNoteRelease={handleCircleRelease}
          />
          {/* Collected overlay legend */}
          <p className="circle-collected-hint">
            {[...collectedInEnglish].length} / 12 notes collectées
          </p>
          <div className="circle-collected-dots">
            {CHROMATIC_NOTES.map((n) => (
              <span
                key={n}
                className={`circle-dot${collectedInEnglish.has(n) ? " collected" : ""}`}
                title={n}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Composition recording controls ── */}
      <div className="composition-controls">
        {!isComposing && compositionNotes.length === 0 && (
          <button
            className={`composer-record-btn${hasFullOctave ? " active" : ""}`}
            disabled={!hasFullOctave}
            onClick={startComposition}
            aria-label="Démarrer l'enregistrement de la composition"
          >
            🎼 Composer une mélodie
          </button>
        )}

        {isComposing && (
          <div className="composition-recording">
            <div className="composition-timer">
              <span className="comp-timer-dot" />
              <span className="comp-timer-value">
                {(elapsed / 1000).toFixed(1)}s
              </span>
              <span className="comp-timer-notes">
                {compositionNotes.length} note{compositionNotes.length !== 1 ? "s" : ""}
              </span>
            </div>
            <button className="composition-stop-btn" onClick={stopComposition}>
              ⏹ Arrêter
            </button>
          </div>
        )}

        {!isComposing && compositionNotes.length > 0 && (
          <div className="composition-preview">
            <p className="composition-preview-title">
              Composition : {compositionNotes.length} notes ·{" "}
              {formatDuration(elapsed)}
            </p>
            <div className="composition-note-sequence">
              {compositionNotes.slice(0, 16).map((n, i) => (
                <span key={i} className="comp-note-chip">{n.note}</span>
              ))}
              {compositionNotes.length > 16 && (
                <span className="comp-note-chip comp-note-more">
                  +{compositionNotes.length - 16}
                </span>
              )}
            </div>
            <div className="composition-actions">
              <button className="composition-discard-btn" onClick={discardComposition}>
                Effacer
              </button>
              <button
                className="composition-save-btn"
                onClick={saveComp}
                disabled={saving}
              >
                {saving ? "Sauvegarde…" : "Certifier la composition"}
              </button>
            </div>
            {savedMsg && (
              <p className="success-text" style={{ textAlign: "center" }}>
                Composition versée au corpus.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Note collection grid ── */}
      <div className="composer-note-grid">
        {ALL_NOTES_CHROMATIC.map((note) => (
          <div
            key={note}
            className={`composer-note-chip${collectedNotes.has(note) ? " collected" : ""}`}
          >
            {collectedNotes.has(note) ? "✓" : "○"} {note}
          </div>
        ))}
      </div>

      {/* ── Recent compositions ── */}
      {compositions.length > 0 && (
        <div className="compositions-list">
          <p className="compositions-list-title">Compositions récentes</p>
          {compositions.slice(0, 5).map((c) => (
            <div key={c.id} className="composition-row">
              <span className="composition-row-title">{c.title}</span>
              <span className="composition-row-meta">
                {c.notes.length} notes · {formatDuration(c.duration_ms)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";

const WHITE_NOTES = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"] as const;
const BLACK_NOTE_POSITIONS: { note: string; pos: number }[] = [
  { note: "Do#", pos: 0.67 },
  { note: "Ré#", pos: 1.67 },
  { note: "Fa#", pos: 3.67 },
  { note: "Sol#", pos: 4.67 },
  { note: "La#", pos: 5.67 },
];
const ALL_NOTES_CHROMATIC = [
  "Do",
  "Do#",
  "Ré",
  "Ré#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];
const WHITE_KEY_PCT = 100 / 7;
const OCTAVES = [2, 3] as const;

interface PianoKeyProps {
  note: string;
  octave: number;
  isBlack: boolean;
  unlocked: boolean;
  active: boolean;
  style?: React.CSSProperties;
  onClick: () => void;
}

function PianoKey({
  note,
  isBlack,
  unlocked,
  active,
  style,
  onClick,
}: PianoKeyProps) {
  return (
    <button
      className={[
        "piano-key",
        isBlack ? "black-key" : "white-key",
        unlocked ? "unlocked" : "locked",
        active ? "playing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      style={style}
      title={`${note} — ${unlocked ? "Jouer" : "Non collectée"}`}
    >
      <span className="key-icon">{unlocked ? "▶" : "🔒"}</span>
      {!isBlack && <span className="key-label">{note}</span>}
    </button>
  );
}

export function Composer() {
  const { user } = useAuth();
  const [collectedNotes, setCollectedNotes] = useState<Set<string>>(new Set());
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load collected notes from recordings
  useEffect(() => {
    if (!user) return;
    supabase
      .from("recordings")
      .select("note_principale")
      .eq("user_id", user.id)
      .not("note_principale", "is", null)
      .then(({ data }) => {
        if (data) {
          setCollectedNotes(
            new Set(data.map((r) => r.note_principale as string))
          );
        }
      });
  }, [user]);

  const playNote = async (note: string, octave: number) => {
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
      const audioCtx = audioCtxRef.current;
      const decoded = await audioCtx.decodeAudioData(buffer);
      const source = audioCtx.createBufferSource();
      source.buffer = decoded;
      source.connect(audioCtx.destination);
      source.start();
    } catch {
      // Recording not yet uploaded or audio unavailable
    }
  };

  const hasFullOctave = ALL_NOTES_CHROMATIC.every((n) => collectedNotes.has(n));

  return (
    <div className="composer-panel">
      <p className="composer-subtitle">
        {collectedNotes.size} / 12 notes au corpus
      </p>

      {!hasFullOctave && (
        <div className="composer-unlock-hint">
          🎹 Collecte les 12 notes chromatiques pour débloquer l'organum complet
        </div>
      )}

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
                    style={{
                      left: `${i * WHITE_KEY_PCT}%`,
                      width: `${WHITE_KEY_PCT}%`,
                    }}
                    onClick={() => playNote(note, octave)}
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
                    style={{
                      left: `${pos * WHITE_KEY_PCT}%`,
                      width: `${WHITE_KEY_PCT * 0.62}%`,
                    }}
                    onClick={() => playNote(note, octave)}
                  />
                ))}
              </div>
              <div className="piano-octave-label">Octave {octave}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className={`composer-record-btn${hasFullOctave ? " active" : ""}`}
        disabled={!hasFullOctave}
        aria-label="Enregistrer la composition"
        title={
          hasFullOctave
            ? "Enregistrer la mélodie"
            : "Collecte d'abord les 12 notes"
        }
      >
        🎼 Enregistrer la composition
      </button>

      <div className="composer-note-grid">
        {ALL_NOTES_CHROMATIC.map((note) => (
          <div
            key={note}
            className={`composer-note-chip${
              collectedNotes.has(note) ? " collected" : ""
            }`}
          >
            {collectedNotes.has(note) ? "✓" : "○"} {note}
          </div>
        ))}
      </div>
    </div>
  );
}

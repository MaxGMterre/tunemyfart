import "./NoteCircle.css";

export const CHROMATIC_NOTES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
] as const;

export type ChromaticNote = (typeof CHROMATIC_NOTES)[number];

const NOTE_COLORS: Record<ChromaticNote, string> = {
  C: "#C99A3D",
  "C#": "#B8873A",
  D: "#D9603B",
  "D#": "#C4502F",
  E: "#9b59b6",
  F: "#8344a0",
  "F#": "#3498db",
  G: "#2980b9",
  "G#": "#2ecc71",
  A: "#27ae60",
  "A#": "#1B2A41",
  B: "#34495e",
};

interface NoteCircleProps {
  size?: number;
  activeNote?: ChromaticNote | null;
  onNotePress?: (note: ChromaticNote) => void;
  onNoteRelease?: (note: ChromaticNote) => void;
}

const COUNT = CHROMATIC_NOTES.length;
const ANGLE_PER_SECTOR = (2 * Math.PI) / COUNT;
const GAP_ANGLE = 0.03;

function sectorPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
): string {
  const s = startAngle + GAP_ANGLE;
  const e = endAngle - GAP_ANGLE;
  const x1 = cx + outerR * Math.cos(s);
  const y1 = cy + outerR * Math.sin(s);
  const x2 = cx + outerR * Math.cos(e);
  const y2 = cy + outerR * Math.sin(e);
  const x3 = cx + innerR * Math.cos(e);
  const y3 = cy + innerR * Math.sin(e);
  const x4 = cx + innerR * Math.cos(s);
  const y4 = cy + innerR * Math.sin(s);
  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;
}

export function NoteCircle({
  size = 240,
  activeNote = null,
  onNotePress,
  onNoteRelease,
}: NoteCircleProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.42;
  const labelR = (outerR + innerR) / 2;
  // Offset so C is at top
  const startOffset = -Math.PI / 2 - ANGLE_PER_SECTOR / 2;

  return (
    <div className="note-circle-wrapper" style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        aria-label="Cercle chromatique"
        role="group"
      >
        {/* Center hole label */}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="var(--color-paper-dark)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fontSize={innerR * 0.3}
          fontFamily="var(--font-display)"
          fill="var(--color-ink)"
          opacity="0.5"
        >
          {activeNote ?? "∿"}
        </text>

        {CHROMATIC_NOTES.map((note, i) => {
          const angle = startOffset + i * ANGLE_PER_SECTOR;
          const nextAngle = angle + ANGLE_PER_SECTOR;
          const midAngle = angle + ANGLE_PER_SECTOR / 2;
          const isActive = note === activeNote;
          const isSharp = note.includes("#");
          const baseColor = NOTE_COLORS[note];

          const lx = cx + labelR * Math.cos(midAngle);
          const ly = cy + labelR * Math.sin(midAngle);

          return (
            <g
              key={note}
              className="note-circle-sector"
              aria-label={note}
              role="button"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                onNotePress?.(note);
              }}
              onPointerUp={() => onNoteRelease?.(note)}
              onPointerCancel={() => onNoteRelease?.(note)}
            >
              <path
                d={sectorPath(cx, cy, innerR, outerR, angle, nextAngle)}
                fill={isActive ? baseColor : isSharp ? "var(--color-ink)" : "var(--color-paper-dark)"}
                stroke="var(--color-ink)"
                strokeWidth="1"
                opacity={isActive ? 1 : isSharp ? 0.85 : 1}
              />
              <text
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                fontSize={size * 0.058}
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? "700" : "400"}
                fill={
                  isActive
                    ? "white"
                    : isSharp
                    ? "var(--color-paper)"
                    : "var(--color-ink)"
                }
                pointerEvents="none"
              >
                {note}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

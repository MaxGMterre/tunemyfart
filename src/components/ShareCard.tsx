import { useEffect, useRef, useState } from "react";
import type { RecordingResult } from "../lib/useRecorder";

interface ShareCardProps {
  result: RecordingResult;
  worldRank?: number;
  onClose: () => void;
}

const W = 360;
const H = 540;

function drawCard(
  ctx: CanvasRenderingContext2D,
  result: RecordingResult,
  worldRank?: number
) {
  // Dark background
  ctx.fillStyle = "#1B2A41";
  ctx.fillRect(0, 0, W, H);

  // Double brass border
  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Serial number (top-right)
  const serialNum = String(
    (Math.abs(Math.round(result.dbMax * 100 + result.durationMs)) % 9000) + 1000
  );
  const serial = `TMF-2026-${serialNum}`;
  ctx.font = `8px "IBM Plex Mono", "Courier New", monospace`;
  ctx.fillStyle = "rgba(201, 154, 61, 0.5)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(serial, W - 22, 22);

  // Skunk + header
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "30px serif";
  ctx.fillText("🦨", 26, 24);

  ctx.fillStyle = "#C99A3D";
  ctx.font = `bold 12px "Fraunces", Georgia, serif`;
  ctx.fillText("CERTIFICAT D'ANALYSE ACOUSTIQUE", 68, 26);

  ctx.fillStyle = "rgba(201, 154, 61, 0.55)";
  ctx.font = `8px "IBM Plex Mono", "Courier New", monospace`;
  ctx.fillText("TUNEMYFART LABS", 68, 44);

  // Rule
  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, 72);
  ctx.lineTo(W - 22, 72);
  ctx.stroke();

  // Big note — 6rem (~96px)
  const noteText = result.notePrincipale ?? "—";
  ctx.font = `bold 96px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#C99A3D";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(noteText, W / 2, 168);

  // Frequency
  const bestNote = result.sequenceNotes[0];
  const freqText = bestNote ? `${bestNote.frequency.toFixed(1)} Hz` : "— Hz";
  ctx.font = `16px "IBM Plex Mono", "Courier New", monospace`;
  ctx.fillStyle = "rgba(242, 236, 224, 0.8)";
  ctx.textBaseline = "top";
  ctx.fillText(freqText, W / 2, 254);

  // Stats row
  const stats = [
    { label: "dB MAX", value: `${result.dbMax.toFixed(1)} dB` },
    { label: "DURÉE", value: `${(result.durationMs / 1000).toFixed(2)} s` },
    { label: "NOTES", value: `${result.sequenceNotes.length}` },
  ];
  const colW = (W - 44) / 3;
  stats.forEach((s, i) => {
    const x = 22 + i * colW + colW / 2;
    ctx.font = `bold 14px "IBM Plex Mono", "Courier New", monospace`;
    ctx.fillStyle = "#F2ECE0";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(s.value, x, 298);
    ctx.font = `7px "IBM Plex Mono", "Courier New", monospace`;
    ctx.fillStyle = "rgba(201, 154, 61, 0.6)";
    ctx.fillText(s.label, x, 318);
  });

  // Column dividers
  ctx.strokeStyle = "rgba(201, 154, 61, 0.3)";
  ctx.lineWidth = 1;
  [1, 2].forEach((i) => {
    const x = 22 + i * colW;
    ctx.beginPath();
    ctx.moveTo(x, 294);
    ctx.lineTo(x, 330);
    ctx.stroke();
  });

  // Waveform
  const wy = 352,
    wh = 60,
    wx = 22,
    ww = W - 44;
  const step = ww / result.waveform.length;
  const mid = wy + wh / 2;

  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  result.waveform.forEach((v, i) => {
    const x = wx + i * step;
    const y = mid + v * (wh / 2) * 1.3;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#39FF14";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "#39FF14";
  ctx.shadowBlur = 4;
  ctx.beginPath();
  result.waveform.forEach((v, i) => {
    const x = wx + i * step;
    const y = mid - v * (wh / 2) * 1.3;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "rgba(201, 154, 61, 0.2)";
  ctx.lineWidth = 1;
  ctx.strokeRect(wx - 4, wy - 4, ww + 8, wh + 8);

  // World rank
  if (worldRank) {
    ctx.font = `bold 11px "IBM Plex Mono", "Courier New", monospace`;
    ctx.fillStyle = "#C99A3D";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.globalAlpha = 1;
    ctx.fillText(`CLASSEMENT MONDIAL : #${worldRank}`, W / 2, 432);
  }

  // Date
  const dateStr = new Date().toLocaleDateString("fr-FR");
  ctx.font = `7px "IBM Plex Mono", "Courier New", monospace`;
  ctx.fillStyle = "rgba(201, 154, 61, 0.45)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(dateStr, W / 2, worldRank ? 450 : 434);

  // Bottom rule + URL
  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, H - 38);
  ctx.lineTo(W - 22, H - 38);
  ctx.stroke();

  ctx.font = `8px "IBM Plex Mono", "Courier New", monospace`;
  ctx.fillStyle = "rgba(201, 154, 61, 0.45)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("tunemyfart.app", W / 2, H - 26);
}

export function ShareCard({ result, worldRank, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const canShareFiles = typeof navigator.share !== "undefined";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    document.fonts.ready.then(() => drawCard(ctx, result, worldRank));
  }, [result, worldRank]);

  const getBlob = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvasRef.current?.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
        "image/png"
      );
    });

  const handleShare = async () => {
    setSharing(true);
    try {
      const blob = await getBlob();
      const file = new File([blob], "tunemyfart.png", { type: "image/png" });
      await navigator.share({
        title: "Mon pet analysé 🦨",
        text: `Note : ${result.notePrincipale ?? "—"} | ${result.dbMax.toFixed(
          1
        )} dB | ${(result.durationMs / 1000).toFixed(2)}s`,
        files: [file],
      } as ShareData);
    } catch {
      // User cancelled or API not available
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      const blob = await getBlob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not supported
    }
  };

  return (
    <div
      className="share-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="share-modal">
        <button className="share-close-btn" onClick={onClose}>
          ✕
        </button>
        <canvas ref={canvasRef} className="share-canvas" />
        <div className="share-actions">
          {canShareFiles ? (
            <button
              className="share-action-btn primary"
              onClick={handleShare}
              disabled={sharing}
            >
              {sharing ? "Envoi…" : "Partager 🦨"}
            </button>
          ) : (
            <button className="share-action-btn primary" onClick={handleCopy}>
              {copied ? "Copié !" : "Copier l'image"}
            </button>
          )}
          <button className="share-action-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

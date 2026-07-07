import { useEffect, useRef, useState } from "react";
import type { RecordingResult } from "../lib/useRecorder";

interface ShareCardProps {
  result: RecordingResult;
  worldRank?: number;
  onClose: () => void;
}

type Template = "certificat" | "story" | "poster" | "diplome";

const W = 360;
const H = 540;
const STORY_W = 360;
const STORY_H = 640;

// ── Template: Certificat (original) ─────────────────────────────────────────
function drawCertificat(
  ctx: CanvasRenderingContext2D,
  result: RecordingResult,
  worldRank?: number
) {
  ctx.fillStyle = "#1B2A41";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  const serialNum = String(
    (Math.abs(Math.round(result.dbMax * 100 + result.durationMs)) % 9000) + 1000
  );
  ctx.font = `8px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(201,154,61,0.5)";
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(`TMF-2026-${serialNum}`, W - 22, 22);

  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = "30px serif";
  ctx.fillText("🦨", 26, 24);
  ctx.fillStyle = "#C99A3D";
  ctx.font = `bold 12px "Fraunces", Georgia, serif`;
  ctx.fillText("CERTIFICAT D'ANALYSE ACOUSTIQUE", 68, 26);
  ctx.fillStyle = "rgba(201,154,61,0.55)";
  ctx.font = `8px "IBM Plex Mono", monospace`;
  ctx.fillText("TUNEMYFART LABS", 68, 44);

  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(22, 72); ctx.lineTo(W - 22, 72); ctx.stroke();

  const noteText = result.notePrincipale ?? "—";
  ctx.font = `bold 96px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#C99A3D";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(noteText, W / 2, 168);

  const bestNote = result.sequenceNotes[0];
  ctx.font = `16px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(242,236,224,0.8)";
  ctx.textBaseline = "top";
  ctx.fillText(bestNote ? `${bestNote.frequency.toFixed(1)} Hz` : "— Hz", W / 2, 254);

  const stats = [
    { label: "dB MAX", value: `${result.dbMax.toFixed(1)} dB` },
    { label: "DURÉE", value: `${(result.durationMs / 1000).toFixed(2)} s` },
    { label: "NOTES", value: `${result.sequenceNotes.length}` },
  ];
  const colW = (W - 44) / 3;
  stats.forEach((s, i) => {
    const x = 22 + i * colW + colW / 2;
    ctx.font = `bold 14px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "#F2ECE0";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(s.value, x, 298);
    ctx.font = `7px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "rgba(201,154,61,0.6)";
    ctx.fillText(s.label, x, 318);
  });
  ctx.strokeStyle = "rgba(201,154,61,0.3)";
  ctx.lineWidth = 1;
  [1, 2].forEach((i) => {
    const x = 22 + i * colW;
    ctx.beginPath(); ctx.moveTo(x, 294); ctx.lineTo(x, 330); ctx.stroke();
  });

  const wy = 352, wh = 60, wx = 22, ww = W - 44;
  const step = ww / result.waveform.length;
  const mid = wy + wh / 2;
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = "#C99A3D"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  result.waveform.forEach((v, i) => { const x = wx + i * step; const y = mid + v * (wh / 2) * 1.3; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#39FF14"; ctx.lineWidth = 1.5;
  ctx.shadowColor = "#39FF14"; ctx.shadowBlur = 4;
  ctx.beginPath();
  result.waveform.forEach((v, i) => { const x = wx + i * step; const y = mid - v * (wh / 2) * 1.3; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(201,154,61,0.2)"; ctx.lineWidth = 1;
  ctx.strokeRect(wx - 4, wy - 4, ww + 8, wh + 8);

  if (worldRank) {
    ctx.font = `bold 11px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "#C99A3D";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(`CLASSEMENT MONDIAL : #${worldRank}`, W / 2, 432);
  }
  const dateStr = new Date().toLocaleDateString("fr-FR");
  ctx.font = `7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(201,154,61,0.45)";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText(dateStr, W / 2, worldRank ? 450 : 434);
  ctx.strokeStyle = "#C99A3D"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(22, H - 38); ctx.lineTo(W - 22, H - 38); ctx.stroke();
  ctx.font = `8px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(201,154,61,0.45)";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText("tunemyfart.app", W / 2, H - 26);
}

// ── Template: Story (360×640) ────────────────────────────────────────────────
function drawStory(
  ctx: CanvasRenderingContext2D,
  result: RecordingResult
) {
  const W = STORY_W, H = STORY_H;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#0d1b2a");
  grad.addColorStop(1, "#1e2d40");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative circle behind note
  const radGrad = ctx.createRadialGradient(W / 2, 260, 0, W / 2, 260, 140);
  radGrad.addColorStop(0, "rgba(201,154,61,0.15)");
  radGrad.addColorStop(1, "rgba(201,154,61,0)");
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, W, H);

  // Top bar
  ctx.fillStyle = "rgba(201,154,61,0.12)";
  ctx.fillRect(0, 0, W, 80);
  ctx.strokeStyle = "rgba(201,154,61,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 80); ctx.lineTo(W, 80); ctx.stroke();

  // Header
  ctx.font = "28px serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("🦨", 20, 40);
  ctx.fillStyle = "#C99A3D";
  ctx.font = `bold 14px "Fraunces", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText("TUNEMYFART LABS", W / 2, 32);
  ctx.font = `8px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(201,154,61,0.5)";
  ctx.fillText(new Date().toLocaleDateString("fr-FR"), W / 2, 54);

  // Big note
  const note = result.notePrincipale ?? "?";
  ctx.font = `bold 148px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#C99A3D";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(201,154,61,0.4)";
  ctx.shadowBlur = 30;
  ctx.fillText(note, W / 2, 240);
  ctx.shadowBlur = 0;

  // Frequency
  const freq = result.sequenceNotes[0]?.frequency;
  ctx.font = `22px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(242,236,224,0.7)";
  ctx.textBaseline = "top";
  ctx.fillText(freq ? `${freq.toFixed(1)} Hz` : "— Hz", W / 2, 330);

  // Separator
  ctx.strokeStyle = "rgba(201,154,61,0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 380); ctx.lineTo(W - 40, 380); ctx.stroke();

  // Big stats
  const bigStats = [
    { emoji: "💥", val: `${result.dbMax.toFixed(1)}`, unit: "dB" },
    { emoji: "⏱️", val: `${(result.durationMs / 1000).toFixed(2)}`, unit: "s" },
    { emoji: "🎵", val: `${result.sequenceNotes.length}`, unit: "notes" },
  ];
  bigStats.forEach((s, i) => {
    const x = 60 + i * 120;
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.emoji, x, 416);
    ctx.font = `bold 20px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "#F2ECE0";
    ctx.textBaseline = "top";
    ctx.fillText(s.val, x, 436);
    ctx.font = `9px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "rgba(201,154,61,0.55)";
    ctx.fillText(s.unit, x, 460);
  });

  // Waveform strip
  const wy = 496, wh = 50, wx = 30, ww = W - 60;
  const step = ww / result.waveform.length;
  const mid = wy + wh / 2;
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#C99A3D"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  result.waveform.forEach((v, i) => { const x = wx + i * step; const y = mid + v * wh / 2; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#39FF14"; ctx.lineWidth = 1.5;
  ctx.shadowColor = "#39FF14"; ctx.shadowBlur = 3;
  ctx.beginPath();
  result.waveform.forEach((v, i) => { const x = wx + i * step; const y = mid - v * wh / 2; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Bottom CTA
  ctx.font = `bold 11px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(201,154,61,0.6)";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText("tunemyfart.app • Analyse le tien →", W / 2, H - 16);
}

// ── Template: Poster scientifique (360×540) ──────────────────────────────────
function drawPoster(
  ctx: CanvasRenderingContext2D,
  result: RecordingResult
) {
  // Paper texture background
  ctx.fillStyle = "#F2ECE0";
  ctx.fillRect(0, 0, W, H);

  // Grid lines (blueprint style)
  ctx.strokeStyle = "rgba(27,42,65,0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Header band
  ctx.fillStyle = "#1B2A41";
  ctx.fillRect(0, 0, W, 68);
  ctx.font = "24px serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText("🦨", 16, 34);
  ctx.fillStyle = "#C99A3D";
  ctx.font = `bold 13px "Fraunces", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText("RAPPORT D'ANALYSE ACOUSTIQUE", W / 2, 22);
  ctx.font = `7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(201,154,61,0.6)";
  ctx.fillText(`SPÉCIMEN N° TMF-${String(Math.abs(Math.round(result.dbMax * 100)) % 9000 + 1000)} — ${new Date().toLocaleDateString("fr-FR")}`, W / 2, 44);

  // Note block (left)
  ctx.fillStyle = "#1B2A41";
  ctx.fillRect(20, 86, 100, 100);
  ctx.strokeStyle = "#C99A3D";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 86, 100, 100);
  ctx.font = `bold 64px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#C99A3D";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(result.notePrincipale ?? "—", 70, 136);

  // Note label
  ctx.font = `7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(27,42,65,0.4)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("NOTE FONDAMENTALE", 70, 192);

  // Stats list (right of note block)
  const rightStats = [
    { label: "Intensité maximale", val: `${result.dbMax.toFixed(2)} dB`, icon: "📊" },
    { label: "Intensité moyenne", val: `${result.dbAvg?.toFixed(2) ?? "—"} dB`, icon: "📉" },
    { label: "Durée totale", val: `${(result.durationMs / 1000).toFixed(3)} s`, icon: "⏱️" },
    { label: "Richesse harmonique", val: `${result.sequenceNotes.length} notes`, icon: "🎼" },
  ];
  rightStats.forEach((s, i) => {
    const y = 90 + i * 25;
    ctx.font = "14px serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(s.icon, 132, y + 8);
    ctx.font = `6px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "rgba(27,42,65,0.45)";
    ctx.fillText(s.label.toUpperCase(), 152, y + 4);
    ctx.font = `bold 10px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "#1B2A41";
    ctx.fillText(s.val, 152, y + 16);
  });

  // Section: Fréquence
  ctx.strokeStyle = "rgba(27,42,65,0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(20, 214); ctx.lineTo(W - 20, 214); ctx.stroke();
  ctx.font = `bold 7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(27,42,65,0.35)";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("§2 — ANALYSE FRÉQUENTIELLE", 20, 220);

  // Frequency bars
  const notesForPoster = result.sequenceNotes.slice(0, 8);
  if (notesForPoster.length > 0) {
    const maxFreq = Math.max(...notesForPoster.map((n) => n.frequency));
    const bw = (W - 40) / notesForPoster.length - 4;
    notesForPoster.forEach((n, i) => {
      const barH = Math.round((n.frequency / maxFreq) * 80);
      const x = 20 + i * ((W - 40) / notesForPoster.length);
      const y = 330 - barH;
      ctx.fillStyle = i === 0 ? "#C99A3D" : "rgba(27,42,65,0.2)";
      ctx.fillRect(x, y, bw, barH);
      ctx.font = `7px "IBM Plex Mono", monospace`;
      ctx.fillStyle = "rgba(27,42,65,0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(n.note, x + bw / 2, 334);
    });
  } else {
    ctx.font = `8px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "rgba(27,42,65,0.3)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Aucune note détectée", W / 2, 290);
  }

  // Section: Oscillogramme
  ctx.strokeStyle = "rgba(27,42,65,0.15)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(20, 352); ctx.lineTo(W - 20, 352); ctx.stroke();
  ctx.font = `bold 7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(27,42,65,0.35)";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText("§3 — OSCILLOGRAMME TEMPOREL", 20, 358);

  const wy = 376, wh = 50, wx = 20, ww = W - 40;
  const step = ww / result.waveform.length;
  const mid = wy + wh / 2;
  ctx.strokeStyle = "rgba(27,42,65,0.15)"; ctx.lineWidth = 1;
  ctx.strokeRect(wx, wy, ww, wh);
  ctx.strokeStyle = "#1B2A41"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  result.waveform.forEach((v, i) => { const x = wx + i * step; const y = mid - v * wh / 2; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
  ctx.stroke();

  // Footer
  ctx.strokeStyle = "#1B2A41"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(20, H - 44); ctx.lineTo(W - 20, H - 44); ctx.stroke();
  ctx.font = `7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(27,42,65,0.35)";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText("Protocole : ISO 9001-PROUT · Marge d'erreur : ±2 dB", 20, H - 36);
  ctx.textAlign = "right";
  ctx.fillText("tunemyfart.app", W - 20, H - 36);
}

// ── Template: Diplôme ────────────────────────────────────────────────────────
function drawDiplome(
  ctx: CanvasRenderingContext2D,
  result: RecordingResult
) {
  // Parchment background
  ctx.fillStyle = "#F5EDD8";
  ctx.fillRect(0, 0, W, H);

  // Ornate border with double lines
  const margin = 14;
  ctx.strokeStyle = "#8B6914";
  ctx.lineWidth = 4;
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(margin + 8, margin + 8, W - (margin + 8) * 2, H - (margin + 8) * 2);

  // Corner ornaments
  const corners = [[margin + 4, margin + 4], [W - margin - 4, margin + 4], [margin + 4, H - margin - 4], [W - margin - 4, H - margin - 4]] as [number, number][];
  ctx.font = "14px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ["✦", "✦", "✦", "✦"].forEach((c, i) => {
    ctx.fillStyle = "#8B6914";
    ctx.fillText(c, corners[i][0], corners[i][1]);
  });

  // Institute header
  ctx.font = `bold 9px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "#8B6914";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText("ACADÉMIE INTERNATIONALE DES SCIENCES GAZEUSES", W / 2, margin + 20);

  ctx.font = `7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(139,105,20,0.6)";
  ctx.fillText("Fondée en 1987 · Siège : Montrouge, France", W / 2, margin + 34);

  // Decorative rule
  ctx.strokeStyle = "rgba(139,105,20,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 68); ctx.lineTo(W - 40, 68); ctx.stroke();

  // DIPLÔME title
  ctx.font = `bold 32px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#5C3D0E";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("DIPLÔME", W / 2, 100);

  ctx.font = `13px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#8B6914";
  ctx.fillText("d'Excellence en Acoustique Intestinale", W / 2, 130);

  // Body text
  ctx.font = `10px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#3A2A0A";
  ctx.textBaseline = "top";
  ctx.fillText("Est décerné à l'éminent chercheur ayant produit", W / 2, 162);
  ctx.fillText("un spécimen d'une qualité acoustique remarquable", W / 2, 178);

  // Big note circle
  ctx.beginPath();
  ctx.arc(W / 2, 256, 60, 0, Math.PI * 2);
  ctx.fillStyle = "#8B6914";
  ctx.fill();
  ctx.strokeStyle = "#5C3D0E";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(W / 2, 256, 50, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(245,237,216,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = `bold 72px "Fraunces", Georgia, serif`;
  ctx.fillStyle = "#F5EDD8";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(result.notePrincipale ?? "—", W / 2, 256);

  // Specs below circle
  ctx.font = `8px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(92,61,14,0.6)";
  ctx.textBaseline = "top";
  ctx.fillText(`${result.dbMax.toFixed(1)} dB · ${(result.durationMs / 1000).toFixed(2)} s · ${result.sequenceNotes.length} notes`, W / 2, 334);

  // Decorative rule
  ctx.strokeStyle = "rgba(139,105,20,0.35)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 358); ctx.lineTo(W - 40, 358); ctx.stroke();

  // Signature lines
  const sigY = 390;
  [[80, "Professeur Prout"], [W - 80, "Putois, Assistant"]] .forEach(([x, name]) => {
    ctx.strokeStyle = "#5C3D0E"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo((x as number) - 50, sigY + 28); ctx.lineTo((x as number) + 50, sigY + 28); ctx.stroke();
    ctx.font = `7px "IBM Plex Mono", monospace`;
    ctx.fillStyle = "rgba(92,61,14,0.5)";
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText(name as string, x as number, sigY + 32);
    // Scrawl
    ctx.strokeStyle = "rgba(92,61,14,0.5)"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo((x as number) - 30, sigY + 16);
    ctx.bezierCurveTo((x as number) - 10, sigY, (x as number) + 10, sigY + 24, (x as number) + 30, sigY + 12);
    ctx.stroke();
  });

  // Seal
  ctx.beginPath();
  ctx.arc(W / 2, 428, 22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(139,105,20,0.15)";
  ctx.fill();
  ctx.strokeStyle = "#8B6914"; ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = "18px serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("🦨", W / 2, 428);

  // Date footer
  const dateStr = new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  ctx.font = `7px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "rgba(92,61,14,0.4)";
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  ctx.fillText(dateStr, W / 2, H - margin - 18);
  ctx.fillText("tunemyfart.app", W / 2, H - margin - 8);
}

// ── Draw dispatcher ──────────────────────────────────────────────────────────
function drawTemplate(
  template: Template,
  ctx: CanvasRenderingContext2D,
  result: RecordingResult,
  worldRank?: number
) {
  if (template === "story") drawStory(ctx, result);
  else if (template === "poster") drawPoster(ctx, result);
  else if (template === "diplome") drawDiplome(ctx, result);
  else drawCertificat(ctx, result, worldRank);
}

function templateSize(template: Template): { w: number; h: number } {
  return template === "story"
    ? { w: STORY_W, h: STORY_H }
    : { w: W, h: H };
}

// ── Component ────────────────────────────────────────────────────────────────
export function ShareCard({ result, worldRank, onClose }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState<Template>("certificat");
  const canShareFiles = typeof navigator.share !== "undefined";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = templateSize(template);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    document.fonts.ready.then(() => drawTemplate(template, ctx, result, worldRank));
  }, [result, worldRank, template]);

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
        text: `Note : ${result.notePrincipale ?? "—"} | ${result.dbMax.toFixed(1)} dB | ${(result.durationMs / 1000).toFixed(2)}s`,
        files: [file],
      } as ShareData);
    } catch { /* cancelled */ }
    finally { setSharing(false); }
  };

  const handleCopy = async () => {
    try {
      const blob = await getBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* Clipboard API not supported */ }
  };

  const TEMPLATES: { id: Template; label: string; emoji: string }[] = [
    { id: "certificat", label: "Cert.", emoji: "📜" },
    { id: "story", label: "Story", emoji: "📱" },
    { id: "poster", label: "Poster", emoji: "🔬" },
    { id: "diplome", label: "Diplôme", emoji: "🎓" },
  ];

  return (
    <div
      className="share-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="share-modal">
        <button className="share-close-btn" onClick={onClose}>✕</button>

        {/* Template selector */}
        <div className="share-template-tabs">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              className={`share-template-tab${template === t.id ? " active" : ""}`}
              onClick={() => setTemplate(t.id)}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <canvas ref={canvasRef} className="share-canvas" />

        <div className="share-actions">
          {canShareFiles ? (
            <button className="share-action-btn primary" onClick={handleShare} disabled={sharing}>
              {sharing ? "Envoi…" : "Partager 🦨"}
            </button>
          ) : (
            <button className="share-action-btn primary" onClick={handleCopy}>
              {copied ? "Copié !" : "Copier l'image"}
            </button>
          )}
          <button className="share-action-btn" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from "framer-motion";

type CelebrationKind = "confetti" | "stars" | "fireworks";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotV: number;
  alpha: number;
  shape: "rect" | "circle" | "star";
}

export function celebrate(kind: CelebrationKind = "confetti", durationMs = 2500) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const particles: Particle[] = [];
  const colors = [
    "#C99A3D",
    "#D9603B",
    "#2ECC71",
    "#9B59B6",
    "#3498DB",
    "#E8A857",
    "#F5EDD6",
  ];

  const count =
    kind === "confetti" ? 80 : kind === "stars" ? 40 : 60;

  for (let i = 0; i < count; i++) {
    particles.push({
      x:
        canvas.width / 2 +
        (Math.random() - 0.5) * canvas.width * 0.6,
      y: kind === "fireworks" ? canvas.height * 0.4 : -10,
      vx:
        (Math.random() - 0.5) *
        (kind === "confetti" ? 4 : 8),
      vy:
        kind === "confetti"
          ? Math.random() * 3 + 1
          : (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
      alpha: 1,
      shape:
        kind === "stars"
          ? "star"
          : Math.random() > 0.5
          ? "rect"
          : "circle",
    });
  }

  const start = performance.now();

  function drawStar(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number
  ) {
    c.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const b = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
      if (i === 0) {
        c.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
      } else {
        c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
      }
      c.lineTo(
        x + (r / 2) * Math.cos(b),
        y + (r / 2) * Math.sin(b)
      );
    }
    c.closePath();
  }

  function frame() {
    const elapsed = performance.now() - start;
    if (elapsed > durationMs) {
      canvas.remove();
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const progress = elapsed / durationMs;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.rotation += p.rotV;
      p.alpha = Math.max(0, 1 - progress * 1.2);
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawStar(ctx, 0, 0, p.size);
        ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

// ── React celebration particles component ─────────────────

const VIVID_COLORS = ["#FF6B35", "#4ECDC4", "#FFD93D", "#E63946", "#06D6A0", "#C77DFF"];

export function CelebrationParticles({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
  const particles = active ? Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    angle: (i / 24) * Math.PI * 2,
    speed: 150 + Math.random() * 150,
    color: VIVID_COLORS[i % VIVID_COLORS.length],
    size: 8 + Math.random() * 8,
  })) : [];

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      <AnimatePresence onExitComplete={onComplete}>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: "50vw", y: "50vh", opacity: 1, scale: 1 }}
            animate={{
              x: `calc(50vw + ${Math.cos(p.angle) * p.speed}px)`,
              y: `calc(50vh + ${Math.sin(p.angle) * p.speed + 100}px)`,
              opacity: 0,
              scale: 0.3,
              rotate: 360,
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "2px",
              backgroundColor: p.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

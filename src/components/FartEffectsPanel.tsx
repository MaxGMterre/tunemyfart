import { useEffect, useRef, useState } from "react";
import "./FartEffectsPanel.css";

export interface FartEffectsPanelProps {
  audioUrl: string;
  onClose: () => void;
}

export function FartEffectsPanel({ audioUrl, onClose }: FartEffectsPanelProps) {
  const [echo, setEcho] = useState(0);
  const [reverb, setReverb] = useState(0);
  const [pitch, setPitch] = useState(1);
  const [distortion, setDistortion] = useState(0);
  const [playing, setPlaying] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const rafRef = useRef<number | null>(null);

  // Persist effect values so we can rebuild the graph mid-session
  const echoRef = useRef(echo);
  const reverbRef = useRef(reverb);
  const pitchRef = useRef(pitch);
  const distortionRef = useRef(distortion);

  useEffect(() => { echoRef.current = echo; }, [echo]);
  useEffect(() => { reverbRef.current = reverb; }, [reverb]);
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);
  useEffect(() => { distortionRef.current = distortion; }, [distortion]);

  // Build sigmoid distortion curve
  function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const samples = 256;
    const curve = new Float32Array(samples) as Float32Array<ArrayBuffer>;
    const k = amount === 0 ? 0.001 : amount * 400;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((Math.PI + k) * x) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Build synthetic reverb impulse response (white noise, exponential decay)
  function makeImpulse(ctx: AudioContext, duration = 2, decay = 2): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  // Draw frequency bars on canvas
  function drawVisual(analyser: AnalyserNode) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);

      const W = canvas.width;
      const H = canvas.height;
      ctx2d.clearRect(0, 0, W, H);

      const barCount = 48;
      const step = Math.floor(data.length / barCount);
      const barW = W / barCount;

      for (let i = 0; i < barCount; i++) {
        const value = data[i * step] / 255;
        const barH = value * H;
        const x = i * barW;
        const y = H - barH;

        // Gradient: brass → coral → neon green by amplitude
        let r: number, g: number, b: number;
        if (value < 0.5) {
          // brass #C99A3D → coral #E06840
          const t = value * 2;
          r = Math.round(0xC9 + (0xE0 - 0xC9) * t);
          g = Math.round(0x9A + (0x68 - 0x9A) * t);
          b = Math.round(0x3D + (0x40 - 0x3D) * t);
        } else {
          // coral #E06840 → neon green #39FF14
          const t = (value - 0.5) * 2;
          r = Math.round(0xE0 + (0x39 - 0xE0) * t);
          g = Math.round(0x68 + (0xFF - 0x68) * t);
          b = Math.round(0x40 + (0x14 - 0x40) * t);
        }

        ctx2d.fillStyle = `rgb(${r},${g},${b})`;
        ctx2d.beginPath();
        ctx2d.roundRect(x + 1, y, barW - 2, barH || 1, 1);
        ctx2d.fill();
      }
    };

    draw();
  }

  // Stop and clean up audio graph
  function stopAudio() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* already stopped */ }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setPlaying(false);

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx2d = canvas.getContext("2d");
      ctx2d?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  async function startAudio() {
    // Resume or create AudioContext (required for iOS WKWebView)
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Fetch and decode audio buffer (cache it)
    if (!bufferRef.current) {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      bufferRef.current = await ctx.decodeAudioData(arrayBuffer);
    }

    const buffer = bufferRef.current;

    // Build audio graph
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitchRef.current;

    // Distortion
    const waveshaper = ctx.createWaveShaper();
    waveshaper.curve = makeDistortionCurve(distortionRef.current);
    waveshaper.oversample = "4x";

    // Split: dry + echo + reverb
    const gainDry = ctx.createGain();
    gainDry.gain.value = 1;

    // Echo
    const delayNode = ctx.createDelay(1.0);
    delayNode.delayTime.value = 0.3;
    const gainFeedback = ctx.createGain();
    gainFeedback.gain.value = echoRef.current * 0.6;
    const gainEcho = ctx.createGain();
    gainEcho.gain.value = echoRef.current;

    // Reverb
    const convolverNode = ctx.createConvolver();
    convolverNode.buffer = makeImpulse(ctx);
    const gainReverb = ctx.createGain();
    gainReverb.gain.value = reverbRef.current;

    // Analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    // Connect chain
    // source → waveshaper → dry/echo/reverb
    source.connect(waveshaper);

    waveshaper.connect(gainDry);
    gainDry.connect(ctx.destination);

    waveshaper.connect(delayNode);
    delayNode.connect(gainFeedback);
    gainFeedback.connect(delayNode); // feedback loop
    delayNode.connect(gainEcho);
    gainEcho.connect(ctx.destination);

    waveshaper.connect(convolverNode);
    convolverNode.connect(gainReverb);
    gainReverb.connect(ctx.destination);

    // Analyser taps from the waveshaper output
    waveshaper.connect(analyser);

    source.start();
    sourceRef.current = source;
    setPlaying(true);
    drawVisual(analyser);

    source.onended = () => {
      if (sourceRef.current === source) {
        stopAudio();
      }
    };
  }

  const handlePlayStop = async () => {
    if (playing) {
      stopAudio();
    } else {
      try {
        await startAudio();
      } catch {
        // ignore playback errors
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fep-panel" role="region" aria-label="Effets audio">
      <div className="fep-header">
        <span className="fep-title">🎛 Effets</span>
        <button className="fep-close-btn" onClick={onClose} aria-label="Fermer le panneau d'effets">
          ✕
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="fep-canvas"
        width={300}
        height={60}
        aria-label="Visualiseur fréquences"
      />

      <button
        className={`fep-play-btn${playing ? " fep-play-btn--active" : ""}`}
        onClick={handlePlayStop}
        aria-label={playing ? "Arrêter" : "Lire"}
      >
        {playing ? "⏹" : "▶"}
      </button>

      <div className="fep-sliders">
        <label className="fep-slider-row">
          <span className="fep-slider-label">Echo</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={echo}
            onChange={(e) => setEcho(parseFloat(e.target.value))}
            className="fep-slider"
          />
          <span className="fep-slider-value">{echo.toFixed(2)}</span>
        </label>

        <label className="fep-slider-row">
          <span className="fep-slider-label">Reverb</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={reverb}
            onChange={(e) => setReverb(parseFloat(e.target.value))}
            className="fep-slider"
          />
          <span className="fep-slider-value">{reverb.toFixed(2)}</span>
        </label>

        <label className="fep-slider-row">
          <span className="fep-slider-label">Pitch</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="fep-slider"
          />
          <span className="fep-slider-value">{pitch.toFixed(2)}×</span>
        </label>

        <label className="fep-slider-row">
          <span className="fep-slider-label">Distortion</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={distortion}
            onChange={(e) => setDistortion(parseFloat(e.target.value))}
            className="fep-slider"
          />
          <span className="fep-slider-value">{distortion.toFixed(2)}</span>
        </label>
      </div>
    </div>
  );
}

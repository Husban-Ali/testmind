import { lazy, Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, useScroll, useTransform } from "framer-motion";
import { MagneticButton } from "../ui/MagneticButton.jsx";
import { HERO_WORDS } from "../../data/portfolioData.js";
import { useScrollToSection } from "../../hooks/useScrollToSection.js";
import { useTypewriter } from "../../hooks/useTypewriter.js";

const HeroScene = lazy(() =>
  import("../three/HeroScene.jsx").then((m) => ({ default: m.HeroScene }))
);

function FloatingVisual() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const COLORS = ["#7C3AED", "#2563EB", "#10B981", "#A78BFA", "#60A5FA"];

    const particles = Array.from({ length: 70 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:    (Math.random() - 0.5) * 0.4,
      vy:    (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const words = [
      { text: "MongoDB",    x: 70,  y: 90,  size: 14, color: "#4DB33D", vx:  0.15, vy:  0.10 },
      { text: "React",      x: 310, y: 65,  size: 15, color: "#61DAFB", vx: -0.10, vy:  0.15 },
      { text: "Node.js",    x: 200, y: 360, size: 14, color: "#68A063", vx:  0.12, vy: -0.10 },
      { text: "PostgreSQL", x: 30,  y: 270, size: 12, color: "#336791", vx:  0.10, vy:  0.12 },
      { text: "AWS",        x: 360, y: 240, size: 16, color: "#FF9900", vx: -0.12, vy:  0.10 },
      { text: "Express",    x: 140, y: 190, size: 13, color: "#aaaaaa", vx:  0.08, vy: -0.12 },
      { text: "Redux",      x: 280, y: 155, size: 13, color: "#764ABC", vx: -0.10, vy: -0.10 },
      { text: "REST API",   x: 55,  y: 370, size: 12, color: "#A78BFA", vx:  0.10, vy:  0.08 },
      { text: "S3",         x: 380, y: 350, size: 14, color: "#FF9900", vx: -0.08, vy: -0.10 },
      { text: "JWT",        x: 210, y: 55,  size: 12, color: "#60A5FA", vx:  0.12, vy:  0.08 },
      { text: "Docker",     x: 90,  y: 180, size: 13, color: "#2496ED", vx: -0.10, vy:  0.10 },
      { text: "Lambda",     x: 300, y: 300, size: 12, color: "#FF9900", vx:  0.10, vy: -0.08 },
    ];

    let tick = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      tick += 0.012;

      // connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(124,58,237,${0.13 * (1 - dist / 90)})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // pulsing rings
      [0, 0.8, 1.6].forEach((offset) => {
        const pulse  = (Math.sin(tick + offset) + 1) / 2;
        const radius = 100 + pulse * 22;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124,58,237,${0.08 + pulse * 0.10})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      });

      // center glow
      const blobGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
      blobGrad.addColorStop(0,   `rgba(124,58,237,0.18)`);
      blobGrad.addColorStop(0.5, `rgba(37,99,235,0.09)`);
      blobGrad.addColorStop(1,   `rgba(16,185,129,0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.fillStyle = blobGrad;
      ctx.fill();

      // SHA text
      ctx.save();
      ctx.font             = "bold 62px 'Space Grotesk', sans-serif";
      ctx.textAlign        = "center";
      ctx.textBaseline     = "middle";
      ctx.shadowColor      = "#7C3AED";
      ctx.shadowBlur       = 22;
      ctx.fillStyle        = "rgba(255,255,255,0.93)";
      ctx.fillText("SHA", cx, cy);
      ctx.shadowBlur       = 0;
      ctx.font             = "600 11px 'Space Grotesk', sans-serif";
      ctx.fillStyle        = "#7C3AED";
      ctx.fillText("FULL  STACK", cx, cy + 30);
      ctx.restore();

      // floating words
      words.forEach((w) => {
        w.x += w.vx;
        w.y += w.vy;
        if (w.x < 10 || w.x > W - 80) w.vx *= -1;
        if (w.y < 10 || w.y > H - 20) w.vy *= -1;

        const dx    = w.x - cx;
        const dy    = w.y - cy;
        const dist  = Math.sqrt(dx * dx + dy * dy);
        const alpha = dist < 105 ? 0.12 : 0.55 + Math.sin(tick * 0.7 + w.x) * 0.15;

        ctx.save();
        ctx.font         = `600 ${w.size}px 'Space Grotesk', monospace`;
        ctx.fillStyle    = w.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.textBaseline = "middle";
        ctx.fillText(w.text, w.x, w.y);
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="hero-visual"
      style={{
        /* sits in the right half, fully centered vertically */
        position:  "absolute",
        left:      "52%",          /* start from horizontal midpoint */
        zIndex:    2,
        width:     480,
        height:    480,
      }}
    >
      <canvas
        ref={canvasRef}
        width={480}
        height={480}
        style={{ width: "100%", height: "100%" }}
      />
    </motion.div>
  );
}

export function HeroSection() {
  const { scrollY } = useScroll();
  const y       = useTransform(scrollY, [0, 600], [0, -150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const displayed = useTypewriter(HERO_WORDS);
  const scrollTo  = useScrollToSection();

  return (
    <section
      id="hero"
      style={{
        position:   "relative",
        height:     "100vh",
        display:    "flex",
        alignItems: "center",
        overflow:   "hidden",
      }}
    >
      {/* 3D canvas background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </Canvas>
      </div>

      {/* purple radial overlay */}
      <div
        style={{
          position:   "absolute", inset: 0, zIndex: 1,
          background: "radial-gradient(ellipse at 60% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      {/* bottom fade */}
      <div
        style={{
          position:   "absolute", bottom: 0, left: 0, right: 0,
          height:     300, zIndex: 1,
          background: "linear-gradient(to top, #050508, transparent)",
        }}
      />

      {/* ── Left: Text ── */}
      <motion.div
        className="hero-copy"
        style={{
          position: "relative", zIndex: 2,
          maxWidth: 560, y, opacity,
          padding:  "0 5%",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          <div className="hero-intro" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, transparent, #7C3AED)" }} />
            <span style={{ color: "#7C3AED", fontSize: 13, letterSpacing: 3, textTransform: "uppercase", fontWeight: 600 }}>
              Karachi, Pakistan
            </span>
          </div>

          <h1
            className="hero-title"
            style={{
              fontFamily:   "'Space Grotesk', sans-serif",
              fontSize:     "clamp(40px, 7vw, 80px)",
              fontWeight:   800,
              color:        "white",
              lineHeight:   1.05,
              marginBottom: 8,
            }}
          >
            Syed
            <br />
            <span
              style={{
                background:           "linear-gradient(135deg, #7C3AED 0%, #2563EB 50%, #10B981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
              }}
            >
              Husban Ali
            </span>
          </h1>

          <div className="hero-typewriter" style={{ height: 52, marginBottom: 24, display: "flex", alignItems: "center" }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize:   "clamp(18px, 3vw, 26px)",
                color:      "#A78BFA",
                fontWeight: 500,
              }}
            >
              {displayed}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ color: "#7C3AED" }}
              >
                |
              </motion.span>
            </span>
          </div>

          <p className="hero-body" style={{ color: "#9CA3AF", fontSize: 17, lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
            Building scalable modern web experiences with the MERN stack &amp; AWS Cloud.
            Turning complex problems into elegant, performant solutions.
          </p>

          <div className="hero-actions" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <MagneticButton onClick={() => scrollTo("projects")} primary>
              View My Work
            </MagneticButton>
            <MagneticButton onClick={() => scrollTo("contact")}>
              Get In Touch
            </MagneticButton>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right: Animated Visual ── */}
      <FloatingVisual />

      {/* scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          position:  "absolute", bottom: 40, left: "50%",
           transform: "translateX(-50%)", zIndex: 2,
          display:   "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ color: "#4B5563", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
          Scroll
        </span>
        <div style={{ width: 1, height: 50, background: "linear-gradient(180deg, #7C3AED, transparent)" }} />
      </motion.div>
    </section>
  );
}
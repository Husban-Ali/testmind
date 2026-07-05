import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { NAV_LINKS } from "../../data/portfolioData.js";
import { useScrollToSection } from "../../hooks/useScrollToSection.js";

const BACKGROUND_PARTICLES = Array.from({ length: 60 }, (_, index) => ({
  id: index,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  duration: Math.random() * 20 + 15,
  delay: Math.random() * 10,
  color: Math.random() > 0.5 ? "rgba(124,58,237,0.4)" : "rgba(37,99,235,0.4)",
}));

const FOOTER_PARTICLES = [...Array(20)].map((_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 2,
  delay: Math.random() * 3,
  color: index % 2 === 0 ? "#7C3AED" : "#2563EB",
}));

function PortfolioStyles() {
  return (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 2px; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        input::placeholder, textarea::placeholder { color: #4B5563; }
        input:focus, textarea:focus { border-color: rgba(124,58,237,0.5) !important; }
        button, a { -webkit-tap-highlight-color: transparent; }
        .desktop-nav { display: flex; }
        .mobile-menu-toggle { display: none; }
        .mobile-menu-panel { display: none; }
        .custom-cursor { display: block; }
        @media (max-width: 768px) {
          .navbar { height: 64px !important; padding: 0 16px !important; }
          .desktop-nav { display: none !important; }
          .mobile-menu-toggle { display: inline-flex !important; }
          .mobile-menu-panel { display: flex !important; }
          .custom-cursor { display: none !important; }

          #hero {
            min-height: 100svh;
            align-items: flex-start !important;
            padding-top: 88px;
          }

          #hero .hero-copy {
            max-width: 100% !important;
            padding: 0 6% !important;
          }

          #hero .hero-title {
            font-size: clamp(34px, 12vw, 56px) !important;
          }

          #hero .hero-typewriter {
            height: auto !important;
            min-height: 40px;
            margin-bottom: 18px !important;
          }

          #hero .hero-body {
            font-size: 15px !important;
            margin-bottom: 28px !important;
            max-width: 100% !important;
          }

          #hero .hero-actions {
            gap: 12px !important;
          }

          #hero .hero-visual {
            display: none !important;
          }

          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }

          .about-avatar {
            width: 160px !important;
            height: 160px !important;
            font-size: 56px !important;
          }

          .about-stats-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .skills-tabs {
            margin-bottom: 28px !important;
            gap: 10px !important;
          }

          .skills-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 120px)) !important;
            gap: 16px !important;
          }

          .skills-orbit-shell {
            margin-top: 32px !important;
            height: auto !important;
          }

          .skills-orbit {
            display: none !important;
          }

          .projects-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
            gap: 16px !important;
          }

          .project-actions {
            flex-direction: column !important;
          }

          .project-actions a {
            width: 100% !important;
          }

          .experience-list {
            max-width: 100% !important;
          }

          .experience-line {
            left: 12px !important;
          }

          .experience-item {
            padding-left: 36px !important;
            margin-bottom: 28px !important;
          }

          .experience-dot {
            left: 2px !important;
            top: 20px !important;
          }

          .certifications-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
            gap: 16px !important;
          }

          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }

          .contact-form-card {
            padding: 24px !important;
          }

          .section-title {
            margin-bottom: 40px !important;
          }
        }
      `}</style>
  );
}

function CustomCursor() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });
  const followerPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (event) => {
      posRef.current = { x: event.clientX, y: event.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${event.clientX - 6}px, ${event.clientY - 6}px)`;
      }
    };

    window.addEventListener("mousemove", move);
    let animationFrameId;

    const animate = () => {
      followerPos.current.x += (posRef.current.x - followerPos.current.x) * 0.1;
      followerPos.current.y += (posRef.current.y - followerPos.current.y) * 0.1;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${followerPos.current.x - 20}px, ${followerPos.current.y - 20}px)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{ position: "fixed", top: 0, left: 0, width: 12, height: 12, borderRadius: "50%", background: "#7C3AED", pointerEvents: "none", zIndex: 99999, mixBlendMode: "screen" }}
      />
      <div
        ref={followerRef}
        className="custom-cursor"
        style={{ position: "fixed", top: 0, left: 0, width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(124,58,237,0.5)", pointerEvents: "none", zIndex: 99998 }}
      />
    </>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0%", position: "fixed", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #7C3AED, #2563EB, #10B981)", zIndex: 9999 }}
    />
  );
}

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDone(true);
            setTimeout(onComplete, 600);
          }, 300);
          return 100;
        }

        return value + Math.random() * 8 + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <>
      {!done && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          style={{ position: "fixed", inset: 0, background: "#050508", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 99999 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700, background: "linear-gradient(135deg, #7C3AED, #2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}
          >
            SHA
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "#6B7280", fontSize: 13, letterSpacing: 4, marginBottom: 48, textTransform: "uppercase" }}>
            Loading Portfolio
          </motion.div>
          <div style={{ width: 280, height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 9999, overflow: "hidden" }}>
            <motion.div
              style={{ height: "100%", background: "linear-gradient(90deg, #7C3AED, #2563EB)", borderRadius: 9999 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div style={{ marginTop: 16, color: "#4B5563", fontSize: 12, fontFamily: "monospace" }}>{Math.floor(Math.min(progress, 100))}%</div>
        </motion.div>
      )}
    </>
  );
}

function Navbar({ activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = useScrollToSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("resize", closeMenu);

    return () => window.removeEventListener("resize", closeMenu);
  }, [menuOpen]);

  const handleNavigate = (section) => {
    scrollTo(section);
    setMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 5%",
        background: scrolled ? "rgba(5,5,8,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(124,58,237,0.15)" : "none",
        transition: "all 0.4s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 72,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg, #7C3AED, #2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer" }}
        onClick={() => scrollTo("hero")}
      >
        SHA<span style={{ WebkitTextFillColor: "#7C3AED" }}>.</span>
      </motion.div>

      <div className="desktop-nav" style={{ gap: 32, alignItems: "center" }}>
        {NAV_LINKS.map((link) => (
          <motion.button
            key={link}
            whileHover={{ color: "#7C3AED" }}
            onClick={() => handleNavigate(link)}
            style={{ background: "none", border: "none", color: activeSection === link.toLowerCase() ? "#7C3AED" : "#9CA3AF", cursor: "pointer", fontSize: 14, fontWeight: 500, letterSpacing: 0.5, transition: "color 0.2s", fontFamily: "'Space Grotesk', sans-serif", minHeight: 44 }}
          >
            {link}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollTo("Contact")}
          style={{ background: "linear-gradient(135deg, #7C3AED, #2563EB)", border: "none", color: "white", padding: "9px 22px", borderRadius: 9999, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", minHeight: 44 }}
        >
          Hire Me
        </motion.button>
      </div>

      <motion.button
        type="button"
        className="mobile-menu-toggle"
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "white",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 20, lineHeight: 1 }}>{menuOpen ? "✕" : "☰"}</span>
      </motion.button>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mobile-menu-panel"
          style={{
            position: "absolute",
            top: 64,
            left: 0,
            right: 0,
            padding: "12px 16px 16px",
            background: "rgba(5,5,8,0.96)",
            borderBottom: "1px solid rgba(124,58,237,0.15)",
            backdropFilter: "blur(20px)",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {NAV_LINKS.map((link) => (
            <motion.button
              key={link}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavigate(link)}
              style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.08)",
                background: activeSection === link.toLowerCase() ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                color: activeSection === link.toLowerCase() ? "#C4B5FD" : "#E5E7EB",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                textAlign: "left",
                padding: "0 14px",
                cursor: "pointer",
              }}
            >
              {link}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              scrollTo("contact");
              setMenuOpen(false);
            }}
            style={{
              width: "100%",
              minHeight: 44,
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #7C3AED, #2563EB)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: "pointer",
            }}
          >
            Hire Me
          </motion.button>
        </motion.div>
      )}
    </motion.nav>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden" }}>
      {FOOTER_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{ opacity: [0, 0.6, 0], y: [0, -40, -80] }}
          transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
          style={{ position: "absolute", left: particle.left, bottom: 0, width: 2, height: 2, borderRadius: "50%", background: particle.color }}
        />
      ))}

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg, #7C3AED, #2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        SHA.
      </div>
      <div style={{ color: "#4B5563", fontSize: 13 }}>
        © {new Date().getFullYear()} Syed Husban Ali — All rights reserved
      </div>
      
    </footer>
  );
}

function ParticleBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {BACKGROUND_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size, borderRadius: "50%", background: particle.color }}
        />
      ))}
    </div>
  );
}

export function PortfolioChrome({ loading, onLoadingComplete, activeSection, children }) {
  return (
    <div style={{ background: "#050508", color: "white", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>
      <PortfolioStyles />

      {loading && <LoadingScreen onComplete={onLoadingComplete} />}

      {!loading && (
        <>
          <CustomCursor />
          <ScrollProgress />
          <ParticleBackground />
          <Navbar activeSection={activeSection} />
          {children}
          <Footer />
        </>
      )}
    </div>
  );
}

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Section } from "../layout/Section.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { ABOUT_SKILL_BARS, ABOUT_STATS, ABOUT_TAGS } from "../../data/portfolioData.js";
import { StatCard } from "../ui/StatCard.jsx";

export function AboutSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Section id="about">
      <SectionTitle tag="Who I Am" title="About Me" sub="Passionate developer crafting the future of the web" />

      <div ref={ref} className="about-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, x: -60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
          <div style={{ position: "relative", marginBottom: 40 }}>
            <div className="about-avatar" style={{ width: 200, height: 200, borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, border: "1px solid rgba(124,58,237,0.3)", backdropFilter: "blur(10px)", position: "relative" }}>
              <span>👨‍💻</span>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ position: "absolute", inset: -12, borderRadius: "inherit", border: "1px dashed rgba(124,58,237,0.3)" }} />
            </div>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ position: "absolute", top: -20, right: 20, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 12, padding: "8px 16px", color: "#10B981", fontSize: 13, fontWeight: 600, backdropFilter: "blur(10px)" }}>
              ✦ Available for hire
            </motion.div>
          </div>

          <p style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
            I'm a Full Stack Developer & AWS Cloud Enthusiast from Karachi, Pakistan, with 4+ years of experience building high-performance web applications.
          </p>
          <p style={{ color: "#9CA3AF", fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
            I specialize in the MERN stack (MongoDB, Express, React, Node.js), serverless AWS architectures, real-time systems, and clean scalable API design. I love bridging beautiful frontends with robust cloud-native backends.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {ABOUT_TAGS.map((tag) => (
              <span key={tag} style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#A78BFA", padding: "5px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500 }}>
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className="about-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
            {ABOUT_STATS.map(({ val, label }, index) => (
              <StatCard key={label} val={val} label={label} delay={0.4 + index * 0.1} animateIn={inView} />
            ))}
          </div>

          {ABOUT_SKILL_BARS.map(({ label, pct }, index) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#D1D5DB", fontSize: 13, fontWeight: 500 }}>{label}</span>
                <span style={{ color: "#7C3AED", fontSize: 13, fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : {}}
                  transition={{ duration: 1.2, delay: 0.6 + index * 0.15, ease: "easeOut" }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #7C3AED, #2563EB)", borderRadius: 9999 }}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

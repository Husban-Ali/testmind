import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Section } from "../layout/Section.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { SKILL_COLORS, SKILLS } from "../../data/portfolioData.js";
import { SkillCard } from "../ui/SkillCard.jsx";
import { TechIcon } from "../ui/techIcons.js";

export function SkillsSection() {
  const [active, setActive] = useState("Frontend");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Section id="skills" style={{ background: "rgba(124,58,237,0.03)" }}>
      <SectionTitle tag="Expertise" title="Technical Arsenal" sub="A full-spectrum developer with deep roots in cloud architecture" />

      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="skills-tabs" style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          {Object.keys(SKILLS).map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(category)}
              style={{
                background: active === category ? `${SKILL_COLORS[category]}22` : "rgba(255,255,255,0.03)",
                border: `1px solid ${active === category ? SKILL_COLORS[category] : "rgba(255,255,255,0.08)"}`,
                color: active === category ? SKILL_COLORS[category] : "#9CA3AF",
                padding: "8px 20px",
                borderRadius: 9999,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                minHeight: 44,
                transition: "all 0.2s",
              }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="skills-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 160px))", gap: 20, justifyContent: "center" }}
          >
            {SKILLS[active].map((skill, index) => (
              <SkillCard key={skill} skill={skill} color={SKILL_COLORS[active]} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="skills-orbit-shell"
          style={{ marginTop: 72, height: 300, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div className="skills-orbit" style={{ position: "relative", width: 260, height: 260, margin: "0 auto" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #2563EB)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 26, boxShadow: "0 0 30px rgba(124,58,237,0.6)", zIndex: 2 }}>
              <img src="https://ik.imagekit.io/bqzlidc77g/my%20portfolio/creator.png?updatedAt=1749961125453" alt="logo" style={{ width: 36 }} />
            </div>
            {["React", "Node", "AWS", "Mongo", "Next", "Docker"].map((tech, index) => {
              const angle = (index / 6) * Math.PI * 2;
              const radius = 92;
              const cx = 50 + Math.cos(angle) * (radius / 1.05);
              const cy = 50 + Math.sin(angle) * (radius / 1.05);

              return (
                <motion.div
                  key={tech}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                >
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: "absolute",
                      left: `${cx}%`,
                      top: `${cy}%`,
                      transform: "translate(-50%,-50%)",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#9CA3AF",
                      fontWeight: 600,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <TechIcon tech={tech} size={26} color={SKILL_COLORS[active]} />
                  </motion.div>
                </motion.div>
              );
            })}
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 220, height: 220, borderRadius: "50%", border: "1px dashed rgba(124,58,237,0.18)", transform: "translate(-50%,-50%)" }} />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

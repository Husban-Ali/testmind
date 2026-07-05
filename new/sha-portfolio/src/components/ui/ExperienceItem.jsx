import { motion } from "framer-motion";

export function ExperienceItem({ experience, index, animateIn = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={animateIn ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.2 }}
      className="experience-item"
      style={{ position: "relative", paddingLeft: 60, marginBottom: 40 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={animateIn ? { scale: 1 } : {}}
        transition={{ delay: index * 0.2 + 0.3 }}
        className="experience-dot"
        style={{ position: "absolute", left: 12, top: 24, width: 16, height: 16, borderRadius: "50%", background: experience.color, boxShadow: `0 0 20px ${experience.color}80`, border: "3px solid #050508" }}
      />

      <motion.div
        whileHover={{ x: 8, boxShadow: `0 20px 60px ${experience.color}22` }}
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "clamp(20px, 4vw, 28px)", backdropFilter: "blur(10px)", position: "relative", overflow: "hidden", transition: "all 0.3s ease" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: experience.color, borderRadius: "4px 0 0 4px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white", fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 700, marginBottom: 2 }}>{experience.role}</h3>
            <span style={{ color: experience.color, fontSize: "clamp(13px, 3.5vw, 14px)", fontWeight: 600 }}>{experience.company}</span>
          </div>
          <span style={{ display: "inline-flex", minHeight: 44, alignItems: "center", background: `${experience.color}18`, border: `1px solid ${experience.color}44`, color: experience.color, padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{experience.period}</span>
        </div>
        <p style={{ color: "#9CA3AF", fontSize: "clamp(13px, 3.5vw, 14px)", lineHeight: 1.7, margin: 0 }}>{experience.desc}</p>
      </motion.div>
    </motion.div>
  );
}

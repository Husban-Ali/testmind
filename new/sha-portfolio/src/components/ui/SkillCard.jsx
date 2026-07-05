import { motion } from "framer-motion";
import { TechIcon } from "./techIcons.js";

export function SkillCard({ skill, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -6, boxShadow: `0 20px 40px ${color}33` }}
      className="skill-card"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}33`,
        borderRadius: 16,
        padding: "clamp(18px, 4vw, 24px) 16px",
        textAlign: "center",
        cursor: "default",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${color}15`, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${color}44` }}>
        <TechIcon tech={skill} size={24} color={color} />
      </div>
      <div style={{ color: "white", fontSize: "clamp(12px, 3.4vw, 13px)", fontWeight: 600, lineHeight: 1.3 }}>{skill}</div>
      <motion.div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)`, opacity: 0 }} whileHover={{ opacity: 1 }} />
    </motion.div>
  );
}

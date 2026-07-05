import { motion } from "framer-motion";

export function CertificationCard({ certification, index, animateIn = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={animateIn ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.15 }}
      whileHover={{ y: -8, boxShadow: `0 30px 60px ${certification.color}33` }}
      style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${certification.color}33`, borderRadius: 24, padding: "clamp(22px, 5vw, 32px)", textAlign: "center", position: "relative", overflow: "hidden", backdropFilter: "blur(10px)", cursor: "default" }}
    >
      <motion.div
        animate={{ boxShadow: [`0 0 20px ${certification.color}40`, `0 0 40px ${certification.color}60`, `0 0 20px ${certification.color}40`] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: 72, height: 72, borderRadius: "50%", background: `${certification.color}18`, border: `2px solid ${certification.color}55`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}
      >
        {certification.icon}
      </motion.div>
      <h3 style={{ color: "white", fontSize: "clamp(14px, 3.6vw, 15px)", fontWeight: 700, marginBottom: 6, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.3 }}>{certification.name}</h3>
      <span style={{ display: "inline-flex", minHeight: 44, alignItems: "center", justifyContent: "center", background: `${certification.color}18`, border: `1px solid ${certification.color}44`, color: certification.color, padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{certification.level}</span>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${certification.color}, transparent)` }} />
    </motion.div>
  );
}

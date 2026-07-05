import { motion } from "framer-motion";

export function StatCard({ val, label, delay = 0, animateIn = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={animateIn ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(124,58,237,0.15)" }}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "clamp(18px, 4vw, 24px)", textAlign: "center", backdropFilter: "blur(10px)", cursor: "default" }}
    >
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 7vw, 36px)", fontWeight: 800, background: "linear-gradient(135deg, #7C3AED, #2563EB)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
      <div style={{ color: "#6B7280", fontSize: "clamp(12px, 3vw, 13px)", marginTop: 4 }}>{label}</div>
    </motion.div>
  );
}

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function SectionTitle({ tag, title, sub }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div ref={ref} className="section-title" initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ marginBottom: 64, textAlign: "center" }}>
      <div style={{ display: "inline-block", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 9999, padding: "5px 16px", marginBottom: 16 }}>
        <span style={{ color: "#7C3AED", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>{tag}</span>
      </div>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, color: "white", marginBottom: 16, lineHeight: 1.1 }}>{title}</h2>
      {sub && <p style={{ color: "#6B7280", fontSize: "clamp(14px, 3.8vw, 17px)", maxWidth: 520, margin: "0 auto" }}>{sub}</p>}
    </motion.div>
  );
}

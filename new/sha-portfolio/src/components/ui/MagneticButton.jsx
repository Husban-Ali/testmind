import { useCallback, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";

export function MagneticButton({ children, onClick, primary = false }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = useCallback(
    (event) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      x.set(dx * 0.3);
      y.set(dy * 0.3);
    },
    [x, y],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{
        x,
        y,
        background: primary ? "linear-gradient(135deg, #7C3AED, #2563EB)" : "transparent",
        border: primary ? "none" : "1px solid rgba(124,58,237,0.5)",
        color: "white",
        padding: "14px 24px",
        minHeight: 44,
        borderRadius: 9999,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: 0.5,
        position: "relative",
        overflow: "hidden",
      }}
      whileHover={{ scale: 1.05, boxShadow: primary ? "0 0 40px rgba(124,58,237,0.5)" : "0 0 20px rgba(124,58,237,0.2)" }}
      whileTap={{ scale: 0.95 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

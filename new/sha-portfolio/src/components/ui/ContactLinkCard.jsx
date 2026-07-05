import { motion } from "framer-motion";

export function ContactLinkCard({ link }) {
  return (
    <motion.a
      href={link.href}
      target={link.href?.startsWith("http") ? "_blank" : undefined}
      rel={link.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      whileHover={{ x: 8, background: "rgba(124,58,237,0.1)" }}
      style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px 20px", minHeight: 56, textDecoration: "none", color: "inherit", transition: "background 0.2s" }}
    >
      <span style={{ fontSize: 20 }}>{link.icon}</span>
      <div>
        <div style={{ color: "#6B7280", fontSize: "clamp(10px, 3vw, 11px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{link.label}</div>
        <div style={{ color: "#D1D5DB", fontSize: "clamp(13px, 3.5vw, 14px)", fontWeight: 500 }}>{link.val}</div>
      </div>
      <span style={{ marginLeft: "auto", color: "#7C3AED" }}>↗</span>
    </motion.a>
  );
}

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function ProjectCard({ project, index, hovered, onHover }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className="project-card"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      onHoverStart={() => onHover(project.title)}
      onHoverEnd={() => onHover(null)}
      whileHover={{ y: -8, boxShadow: `0 30px 60px ${project.color}22` }}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${hovered ? `${project.color}44` : "rgba(255,255,255,0.07)"}`,
        borderRadius: 24,
        padding: "clamp(20px, 4vw, 28px)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ background: `${project.color}18`, border: `1px solid ${project.color}44`, color: project.color, padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          {project.category}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
        </div>
      </div>

      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white", fontSize: 18, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{project.title}</h3>
      <p style={{ color: "#9CA3AF", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{project.desc}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {project.tech.slice(0, 4).map((tech) => (
          <span key={tech} style={{ background: "rgba(255,255,255,0.05)", color: "#D1D5DB", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>{tech}</span>
        ))}
        {project.tech.length > 4 && <span style={{ color: "#6B7280", fontSize: 11, padding: "3px 4px" }}>+{project.tech.length - 4}</span>}
      </div>

      <div className="project-actions" style={{ display: "flex", gap: 10 }}>
        {project.source_code_link ? (
          <motion.a
            href={project.source_code_link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              background: `${project.color}18`,
              border: `1px solid ${project.color}44`,
              color: project.color,
              padding: "12px 0",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            GitHub ↗
          </motion.a>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {project.live_website_link ? (
          <motion.a
            href={project.live_website_link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              background: project.color,
              border: "none",
              color: "white",
              padding: "12px 0",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: "background 0.2s",
            }}
          >
            Live Demo ↗
          </motion.a>
        ) : (
          <div style={{ flex: 1 }} />
        )}
      </div>

      <div style={{ position: "absolute", bottom: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: `${project.color}0a`, filter: "blur(30px)", pointerEvents: "none" }} />
    </motion.div>
  );
}

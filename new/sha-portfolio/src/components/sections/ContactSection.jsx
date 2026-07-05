import { useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Section } from "../layout/Section.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { CONTACT_LINKS } from "../../data/portfolioData.js";
import { ContactLinkCard } from "../ui/ContactLinkCard.jsx";

export function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const handleSubmit = () => {
    if (form.name && form.email && form.message) setSent(true);
  };

  return (
    <Section id="contact" style={{ background: "rgba(124,58,237,0.02)" }}>
      <SectionTitle tag="Say Hello" title="Let's Work Together" sub="Open to new opportunities, collaborations, and interesting projects" />

      <div ref={ref} className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, maxWidth: 1100, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: "white", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Get In Touch</h3>
          <p style={{ color: "#9CA3AF", fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Have a project in mind or want to discuss opportunities? I'm always open to meaningful conversations and exciting work.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {CONTACT_LINKS.map((link) => (
              <ContactLinkCard key={link.label} link={link} />
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div className="contact-form-card" key="form" exit={{ opacity: 0, scale: 0.9 }} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 32, backdropFilter: "blur(10px)" }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Syed Example"
                    style={{ width: "100%", minHeight: 44, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", fontFamily: "'Space Grotesk', sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email Address</label>
                  <input
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="you@example.com"
                    type="email"
                    style={{ width: "100%", minHeight: 44, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", fontFamily: "'Space Grotesk', sans-serif", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ color: "#6B7280", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Message</label>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="Tell me about your project..."
                    rows={5}
                    style={{ width: "100%", minHeight: 120, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", fontFamily: "'Space Grotesk', sans-serif", resize: "none", boxSizing: "border-box" }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(124,58,237,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  style={{ width: "100%", minHeight: 44, background: "linear-gradient(135deg, #7C3AED, #2563EB)", border: "none", color: "white", padding: "14px 0", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Send Message ✦
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 24, padding: 48, textAlign: "center", backdropFilter: "blur(10px)" }}
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} style={{ fontSize: 56, marginBottom: 16 }}>
                  🎉
                </motion.div>
                <h3 style={{ color: "#10B981", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: "#9CA3AF", fontSize: 15 }}>Thanks for reaching out. I'll get back to you within 24 hours.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  );
}

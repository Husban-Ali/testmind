import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Section } from "../layout/Section.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { EXPERIENCE } from "../../data/portfolioData.js";
import { ExperienceItem } from "../ui/ExperienceItem.jsx";

export function ExperienceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Section id="experience">
      <SectionTitle tag="Career" title="Work Experience" sub="Building impactful products across diverse tech stacks" />

      <div ref={ref} className="experience-list" style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
        <motion.div
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="experience-line"
          style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: "linear-gradient(180deg, #7C3AED, #2563EB, transparent)", transformOrigin: "top", opacity: 0.4 }}
        />

        {EXPERIENCE.map((experience, index) => (
          <ExperienceItem key={experience.company} experience={experience} index={index} animateIn={inView} />
        ))}
      </div>
    </Section>
  );
}

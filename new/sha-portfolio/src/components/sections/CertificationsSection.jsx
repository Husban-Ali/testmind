import { useRef } from "react";
import { useInView } from "framer-motion";
import { Section } from "../layout/Section.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { CERTS } from "../../data/portfolioData.js";
import { CertificationCard } from "../ui/CertificationCard.jsx";

export function CertificationsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <Section id="certifications">
      <SectionTitle tag="Credentials" title="Certifications" sub="Validated cloud expertise through AWS official programs" />

      <div ref={ref} className="certifications-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
        {CERTS.map((certification, index) => (
          <CertificationCard key={certification.name} certification={certification} index={index} animateIn={inView} />
        ))}
      </div>
    </Section>
  );
}

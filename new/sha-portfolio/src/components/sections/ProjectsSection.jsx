import { useState } from "react";
import { Section } from "../layout/Section.jsx";
import { SectionTitle } from "../ui/SectionTitle.jsx";
import { PROJECTS } from "../../data/portfolioData.js";
import { ProjectCard } from "../ui/ProjectCard.jsx";

export function ProjectsSection() {
  const [hovered, setHovered] = useState(null);

  return (
    <Section id="projects" style={{ background: "rgba(37,99,235,0.02)" }}>
      <SectionTitle tag="Portfolio" title="Featured Projects" sub="Production-grade applications built for scale and impact" />

      <div className="projects-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
        {PROJECTS.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} hovered={hovered === project.title} onHover={setHovered} />
        ))}
      </div>
    </Section>
  );
}

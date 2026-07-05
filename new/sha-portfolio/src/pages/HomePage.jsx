import { useCallback, useState } from "react";
import { NAV_LINKS } from "../data/portfolioData.js";
import { useActiveSection } from "../hooks/useActiveSection.js";
import { PortfolioChrome } from "../components/layout/PortfolioChrome.jsx";
import { HeroSection } from "../components/sections/HeroSection.jsx";
import { AboutSection } from "../components/sections/AboutSection.jsx";
import { SkillsSection } from "../components/sections/SkillsSection.jsx";
import { ExperienceSection } from "../components/sections/ExperienceSection.jsx";
import { ProjectsSection } from "../components/sections/ProjectsSection.jsx";
import { CertificationsSection } from "../components/sections/CertificationsSection.jsx";
import { ContactSection } from "../components/sections/ContactSection.jsx";

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const activeSection = useActiveSection(NAV_LINKS);

  const handleLoadingComplete = useCallback(() => setLoading(false), []);

  return (
    <PortfolioChrome loading={loading} onLoadingComplete={handleLoadingComplete} activeSection={activeSection}>
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <CertificationsSection />
        <ContactSection />
      </main>
    </PortfolioChrome>
  );
}

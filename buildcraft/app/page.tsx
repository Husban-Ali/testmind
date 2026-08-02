import HeroSection from "./component/HeroSection";
import AboutSection from "./component/AboutSection";
import ServicesSection from "./component/ServicesSection";
import ProjectsSection from "./component/ProjectsSection";
import TestimonialsSection from "./component/TestimonialsSection";
import ContactSection from "./component/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}

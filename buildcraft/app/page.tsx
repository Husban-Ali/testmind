import HeroSection from "./component/HeroSection";
import AboutSection from "./component/AboutSection";
import ServicesSection from "./component/ServicesSection";
import StatsBar from "./component/StatsBar";
import WhyChooseUs from "./component/WhyChooseUs";
import ProjectsSection from "./component/ProjectsSection";
import TestimonialsSection from "./component/TestimonialsSection";
import ContactSection from "./component/ContactSection";
import Teamsection from "./component/Teamsection";
import Ctasection from "./component/Ctasection"

export default function Home() {
  return (
    <>
      <HeroSection />
       <StatsBar />
      <AboutSection />
      <ServicesSection />
      <WhyChooseUs />
      <ProjectsSection />
      <StatsBar />
      <TestimonialsSection />
      <Teamsection />
      <Ctasection />
      <ContactSection />
    </>
  );
}

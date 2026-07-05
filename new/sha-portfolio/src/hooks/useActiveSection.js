import { useEffect, useState } from "react";

export function useActiveSection(navLinks) {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observers = navLinks.map((link) => {
      const element = document.getElementById(link.toLowerCase());
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(link.toLowerCase());
        },
        { threshold: 0.4 },
      );

      observer.observe(element);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [navLinks]);

  return activeSection;
}

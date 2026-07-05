import { useCallback } from "react";

export function useScrollToSection() {
  return useCallback((sectionId) => {
    document.getElementById(sectionId.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  }, []);
}

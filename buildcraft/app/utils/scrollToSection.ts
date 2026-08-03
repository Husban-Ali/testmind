export function scrollToSection(page: string) {
  if (page === "Home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const element = document.getElementById(page.toLowerCase());
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: "smooth" });
}

export function Section({ id, children, style = {} }) {
  return (
    <section
      id={id}
      className="portfolio-section"
      style={{
        minHeight: "100vh",
        padding: "clamp(56px, 15vw, 120px) 5% clamp(56px, 8vw, 80px)",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

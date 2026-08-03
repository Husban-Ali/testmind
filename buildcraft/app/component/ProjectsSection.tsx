"use client";
import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  category: string;
  image: string;
  location: string;
  area: string;
  year: string;
}

const filters = ["All", "Commercial", "Residential", "Hospitality"];

const projects: Project[] = [
  { title: "Skyline Tower", category: "Commercial", image: "/commercial.jfif", location: "Manhattan, NY", area: "450,000 sq ft", year: "2024" },
  { title: "Luxury Villa Estate", category: "Residential", image: "/residential.jfif", location: "Beverly Hills, CA", area: "12,500 sq ft", year: "2024" },
  { title: "Glass Office Complex", category: "Commercial", image: "/architecture.jfif", location: "Los Angeles, CA", area: "280,000 sq ft", year: "2023" },
  { title: "Palm Beach Resort", category: "Hospitality", image: "/interior.jfif", location: "Miami, FL", area: "95,000 sq ft", year: "2023" },
  { title: "Modern Penthouse", category: "Residential", image: "/residential.jfif", location: "Chicago, IL", area: "8,200 sq ft", year: "2024" },
  { title: "City Shopping Mall", category: "Commercial", image: "/project-management.jfif", location: "Houston, TX", area: "620,000 sq ft", year: "2022" },
];

export default function ProjectsSection() {
  const [active, setActive] = useState("All");
  const sectionRef = useRef<HTMLDivElement>(null);

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".projects-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".project-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: ".projects-grid", start: "top 85%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [filtered]);

  return (
    <Box ref={sectionRef} id="projects" sx={{ bgcolor: "#fff", py: { xs: 6, md: 12 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>

        {/* Header */}
        <Box className="projects-header" sx={{ textAlign: "center", mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
            <Box sx={{ width: 28, height: 2, bgcolor: "#f5a623" }} />
            <Typography
              sx={{
                color: "#f5a623", fontWeight: 700, fontSize: "0.75rem",
                letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              }}
            >
              Our Portfolio
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800, color: "#111827",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { xs: "2.4rem", md: "3.4rem" },
              lineHeight: 1.15, mb: 2,
            }}
          >
            Featured Projects
          </Typography>

          <Typography
            sx={{
              color: "#6B7280", fontSize: "1rem", fontFamily: "Inter, sans-serif",
              lineHeight: 1.7, maxWidth: 560, mx: "auto",
            }}
          >
            Explore our portfolio of completed projects showcasing our commitment to
            quality, innovation, and architectural excellence.
          </Typography>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 7, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <Box
              key={f}
              onClick={() => setActive(f)}
              sx={{
                px: 3, py: 1,
                borderRadius: "999px",
                border: active === f ? "2px solid #f5a623" : "2px solid #E5E7EB",
                bgcolor: active === f ? "#f5a623" : "#fff",
                color: active === f ? "#111827" : "#6B7280",
                fontWeight: 600, fontSize: "0.9rem",
                fontFamily: "Inter, sans-serif",
                cursor: "pointer",
                transition: "all .25s ease",
                userSelect: "none",
                "&:hover": { borderColor: "#f5a623", color: active === f ? "#111827" : "#f5a623" },
              }}
            >
              {f}
            </Box>
          ))}
        </Box>

        <Grid container spacing={3} className="projects-grid" sx={{ justifyContent: "center" }}>
          {filtered.map((p, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                className="project-card"
                sx={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                  height: { xs: 220, md: 340 },
                  transition: "transform .4s ease, box-shadow .4s ease",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" },
                  "&:hover .proj-img": { transform: "scale(1.08)" },
                  "&:hover .proj-overlay": { background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)" },
                  "&:hover .proj-content": { transform: "translateY(0)" },
                }}
              >
                <Box className="proj-img" sx={{ position: "absolute", inset: 0, transition: "transform .4s ease" }}>
                  <Image src={p.image} alt={p.title} fill style={{ objectFit: "cover" }} sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw" />
                </Box>

                <Box className="proj-overlay" sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)", transition: "background .4s ease", zIndex: 1 }} />

                <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 3, bgcolor: "#f5a623", color: "#111827", fontWeight: 700, fontSize: "0.75rem", px: 1.8, py: 0.5, borderRadius: "999px", fontFamily: "Inter, sans-serif" }}>
                  {p.category}
                </Box>

                <Box className="proj-content" sx={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, p: "20px", transform: "translateY(100%)", transition: "transform .4s ease" }}>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "Inter, sans-serif", mb: 1.5 }}>{p.title}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
                    <Typography sx={{ color: "#f5a623", fontSize: "0.85rem" }}>📍</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontFamily: "Inter, sans-serif" }}>{p.location}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>Area</Typography>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem", fontFamily: "Inter, sans-serif" }}>{p.area}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "Inter, sans-serif" }}>Year</Typography>
                      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem", fontFamily: "Inter, sans-serif" }}>{p.year}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}

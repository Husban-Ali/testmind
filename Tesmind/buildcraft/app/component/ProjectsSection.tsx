"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const filters = ["All", "Commercial", "Residential", "Hospitality"];

const projects = [
  { title: "Skyline Tower", location: "Manhattan, NY", area: "450,000 sq ft", year: "2024", category: "Commercial", img: "/hero-bg.png" },
  { title: "Luxury Villa Estate", location: "Beverly Hills, CA", area: "12,500 sq ft", year: "2024", category: "Residential", img: "/hero-bg.png" },
  { title: "Glass Office Complex", location: "Los Angeles, CA", area: "280,000 sq ft", year: "2023", category: "Commercial", img: "/hero-bg.png" },
  { title: "Palm Beach Resort", location: "Miami, FL", area: "95,000 sq ft", year: "2023", category: "Hospitality", img: "/hero-bg.png" },
  { title: "Modern Penthouse", location: "Chicago, IL", area: "8,200 sq ft", year: "2024", category: "Residential", img: "/hero-bg.png" },
  { title: "City Shopping Mall", location: "Houston, TX", area: "620,000 sq ft", year: "2022", category: "Commercial", img: "/hero-bg.png" },
];

export default function ProjectsSection() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <Box sx={{ bgcolor: "#fff", py: 10 }} id="projects">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 32, height: 2, bgcolor: "#f5a623" }} />
            <Typography sx={{ color: "#f5a623", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "'Inter', sans-serif" }}>
              Our Portfolio
            </Typography>
            <Box sx={{ width: 32, height: 2, bgcolor: "#f5a623" }} />
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: "#0a0a0a", fontSize: { xs: "2.5rem", md: "3.5rem" }, fontFamily: "'Inter', sans-serif", mb: 2 }}>
            Featured Projects
          </Typography>
          <Typography sx={{ color: "rgb(107,114,128)", fontSize: "1.05rem", maxWidth: 580, mx: "auto", lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>
            Explore our portfolio of completed projects showcasing our commitment to quality, innovation, and architectural excellence.
          </Typography>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mb: 6, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <Chip
              key={f}
              label={f}
              onClick={() => setActive(f)}
              sx={{
                px: 2,
                py: 2.5,
                fontSize: "0.95rem",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                borderRadius: "999px",
                cursor: "pointer",
                bgcolor: active === f ? "#f5a623" : "transparent",
                color: active === f ? "#0a0a0a" : "#555",
                border: active === f ? "2px solid #f5a623" : "2px solid #ddd",
                "&:hover": { bgcolor: active === f ? "#f5a623" : "#f9f9f9", borderColor: "#f5a623" },
                transition: "all 0.25s",
              }}
            />
          ))}
        </Box>

        {/* Project Grid */}
        <Grid container spacing={3}>
          {filtered.map((p, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover img": { transform: "scale(1.05)" },
                  "&:hover .info-overlay": { opacity: 1 },
                }}
              >
                {/* Image */}
                <Box
                  component="img"
                  src={p.img}
                  alt={p.title}
                  sx={{ width: "100%", height: 320, objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                />

                {/* Category badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    bgcolor: "#f5a623",
                    color: "#0a0a0a",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "999px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {p.category}
                </Box>

                {/* Bottom info overlay - always visible with gradient */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.4) 60%, transparent 100%)",
                    p: 3,
                    pt: 6,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: 700, fontSize: "1.15rem", fontFamily: "'Inter', sans-serif", mb: 0.5 }}>
                    {p.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
                    <LocationOnIcon sx={{ color: "#f5a623", fontSize: "0.9rem" }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif" }}>
                      {p.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>
                        Area
                      </Typography>
                      <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem", fontFamily: "'Inter', sans-serif" }}>
                        {p.area}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>
                        Year
                      </Typography>
                      <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem", fontFamily: "'Inter', sans-serif" }}>
                        {p.year}
                      </Typography>
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

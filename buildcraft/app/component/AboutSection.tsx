"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRef } from "react";
import { useGsapReveal } from "../hooks/useGsapReveal";

const features = [
  "Licensed and insured professionals",
  "Sustainable building practices",
  "24/7 project monitoring",
  "Comprehensive project planning",
  "State-of-the-art equipment",
  "Industry-leading warranty",
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGsapReveal(sectionRef, {
    selector: "[data-gsap='about-item']",
    stagger: 0.08,
    scrollTrigger: true,
  });

  return (
    <Box ref={sectionRef} sx={{ bgcolor: "#fff", py: { xs: 6, md: 12 } }} id="about">
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Grid container spacing={4} sx={{ alignItems: "center" }}>
          {/* Left - Image */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "center" }}>
            <Box data-gsap="about-item" sx={{ position: "relative", display: "inline-block", width: { xs: "100%", sm: "85%", md: "70%" } }}>
              <Box
                component="img"
                src="/about.png"
                alt="About BuildCraft"
                sx={{
                  width: "100%",
                  height: { xs: 260, md: 340 },
                  objectFit: "cover",
                  display: "block",
                  borderRadius: "8px",
                  boxShadow: "0 12px 48px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
                }}
              />
              {/* Yellow accent box */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  bgcolor: "#f5a623",
                  p: 3,
                  textAlign: "center",
                  minWidth: 150,
                  boxShadow: "0 8px 32px rgba(245,166,35,0.35)",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "2.8rem",
                    color: "#1a1a1a",
                    lineHeight: 1,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  25+
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#1a1a1a",
                    fontFamily: "Inter, sans-serif",
                    mt: 0.5,
                  }}
                >
                  Years of
                  <br />
                  Excellence
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right - Content */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Orange dash + label */}
            <Box data-gsap="about-item" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 28, height: 2, bgcolor: "#f5a623" }} />
              <Typography
                sx={{
                  color: "#f5a623",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                About BuildCraft
              </Typography>
            </Box>

            {/* Main heading */}
            <Typography
              data-gsap="about-item"
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#1a1a1a",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: { xs: "2rem", md: "3.2rem" },
                lineHeight: 1.15,
                mb: 3,
              }}
            >
              Building the Future{" "}
              <Box component="span" sx={{ color: "#f5a623" }}>
                With Excellence
              </Box>
            </Typography>

            <Typography
              data-gsap="about-item"
              sx={{
                color: "#555",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.8,
                mb: 2,
              }}
            >
              Since 1999, BuildCraft has been at the forefront of the construction industry, delivering premium projects that stand the test of time. Our team of expert architects, engineers, and project managers work seamlessly to transform your vision into architectural masterpieces.
            </Typography>

            <Typography
              data-gsap="about-item"
              sx={{
                color: "#555",
                fontSize: "1rem",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.8,
                mb: 4,
              }}
            >
              We combine cutting-edge technology with time-tested craftsmanship to create spaces that inspire, function beautifully, and exceed expectations at every level.
            </Typography>

            {/* Features grid */}
            <Box
              data-gsap="about-item"
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
                mb: 4,
              }}
            >
              {features.map((f) => (
                <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleIcon sx={{ color: "#f5a623", fontSize: "1.1rem", flexShrink: 0 }} />
                  <Typography sx={{ color: "#444", fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
                    {f}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              data-gsap="about-item"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: "#f5a623",
                color: "#1a1a1a",
                fontWeight: 700,
                textTransform: "none",
                px: 4,
                py: 1.6,
                fontSize: "1rem",
                borderRadius: "4px",
                fontFamily: "Inter, sans-serif",
                letterSpacing: "0.02em",
                boxShadow: "rgba(245,166,35,0.35) 0px 4px 14px",
                "&:hover": { bgcolor: "#e09400", boxShadow: "rgba(245,166,35,0.5) 0px 6px 20px" },
              }}
            >
              Discover More
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

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
  "Licensed & Insured Contractors",
  "25+ Years of Industry Experience",
  "Award-Winning Design Team",
  "On-Time Project Delivery",
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGsapReveal(sectionRef, {
    selector: "[data-gsap='about-item']",
    stagger: 0.08,
    scrollTrigger: true,
  });

  return (
    <Box ref={sectionRef} sx={{ bgcolor: "#f5f5f0", py: 10 }} id="about">
      <Container maxWidth="xl">
        <Grid container spacing={6} sx={{ alignItems: "center" }}>
          {/* Left - Image */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box data-gsap="about-item" sx={{ position: "relative" }}>
              <Box
                component="img"
                src="/hero-bg.png"
                alt="About"
                sx={{ width: "100%", height: 480, objectFit: "cover" }}
              />
              {/* Yellow accent box */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: -24,
                  right: -24,
                  bgcolor: "#f5a623",
                  p: 3,
                  textAlign: "center",
                  minWidth: 140,
                }}
              >
                <Typography sx={{ fontWeight: 900, fontSize: "2.5rem", color: "#1a1a1a", lineHeight: 1 }}>
                  25+
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a1a1a" }}>
                  Years Experience
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right - Content */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box data-gsap="about-item" sx={{ width: 48, height: 3, bgcolor: "#f5a623", mb: 2 }} />
            <Typography data-gsap="about-item" sx={{ color: "#f5a623", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", mb: 1 }}>
              About Our Company
            </Typography>
            <Typography data-gsap="about-item" variant="h3" sx={{ fontWeight: 900, color: "#1a1a1a", mb: 3, lineHeight: 1.2 }}>
              Building Excellence Since 1998
            </Typography>
            <Typography data-gsap="about-item" sx={{ color: "#666", mb: 3, lineHeight: 1.8 }}>
              We are a premier construction company dedicated to transforming visions into reality. With over 25 years of experience, we have built a reputation for quality, innovation, and unwavering commitment to our clients.
            </Typography>
            <Box data-gsap="about-item" sx={{ mb: 4 }}>
              {features.map((f) => (
                <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <CheckCircleIcon sx={{ color: "#f5a623", fontSize: "1.2rem" }} />
                  <Typography sx={{ color: "#444", fontWeight: 500 }}>{f}</Typography>
                </Box>
              ))}
            </Box>
            <Button
              data-gsap="about-item"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 700, textTransform: "none", px: 3, py: 1.5, borderRadius: 1, "&:hover": { bgcolor: "#e09400" } }}
            >
              Learn More About Us
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

"use client";
import { useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";

import { useGsapReveal } from "../hooks/useGsapReveal";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useGsapReveal(heroRef, {
    selector: "[data-gsap='hero-item']",
    stagger: 0.12,
    from: { y: 24 },
    to: { duration: 0.8 },
  });

  return (
    <Box id="home">
      <Box
        ref={heroRef}
        sx={{
          minHeight: "100vh",
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          bgcolor: "#2a2a2a",
          position: "relative",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          pt: 8,
          pb: { xs: 6, md: 2 },
        }}
      >
        {/* Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.85) 100%)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            px: { xs: 3, sm: 5, md: 8 },
            boxSizing: "border-box",
          }}
        >
          <Box data-gsap="hero-item" sx={{ width: 48, height: 4, bgcolor: "#f5a623", mb: 3, mt: 6 }} />

          <Typography
            data-gsap="hero-item"
            sx={{
              color: "#f5a623",
              fontWeight: 700,
              fontSize: { xs: "0.75rem", md: "0.85rem" },
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
              mb: 2,
            }}
          >
            Award-Winning Construction Company
          </Typography>

          <Typography
            data-gsap="hero-item"
            variant="h1"
            sx={{
              color: "white",
              fontWeight: 800,
              fontSize: { xs: "2rem", sm: "2.8rem", md: "4rem", lg: "4.8rem" },
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontFamily: "'Playfair Display', Georgia, serif",
              mb: 3,
            }}
          >
            We Build{" "}
            <Box component="span" sx={{ color: "#f5a623", fontFamily: "'Playfair Display', serif" }}>
              Your Vision
            </Box>
            <br />
            Into Reality
          </Typography>

          <Typography
            data-gsap="hero-item"
            sx={{
              color: "rgba(255,255,255,0.65)",
              fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.3rem" },
              fontWeight: 400,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.7,
              maxWidth: 600,
              mb: 5,
            }}
          >
            From concept to completion, we deliver exceptional construction services
            backed by 25+ years of excellence, innovation, and unwavering commitment to quality.
          </Typography>

          <Box data-gsap="hero-item" sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: "#f5a623",
                color: "#0a0a0a",
                fontWeight: 700,
                textTransform: "none",
                px: { xs: 2.5, md: 4 },
                py: { xs: "10px", md: "13px" },
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                borderRadius: "4px",
                fontFamily: "Inter, sans-serif",
                boxShadow: "rgba(245,166,35,0.35) 0px 4px 14px",
                "&:hover": { background: "rgb(220,149,30)" },
              }}
            >
              Start Your Project
            </Button>
            <Button
              variant="outlined"
              startIcon={<PlayCircleFilledWhiteIcon />}
              sx={{
                border: "2px solid rgba(255,255,255,0.3)",
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                px: { xs: 2.5, md: 4 },
                py: { xs: "10px", md: "13px" },
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                borderRadius: "4px",
                fontFamily: "Inter, sans-serif",
                "&:hover": { border: "2px solid #f5a623", color: "#f5a623" },
              }}
            >
              View Our Work
            </Button>
          </Box>
        </Box>
      </Box>

    </Box>
  );
}

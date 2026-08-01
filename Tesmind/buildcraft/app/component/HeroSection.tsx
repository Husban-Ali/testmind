"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import StatsBar from "./StatsBar";

export default function HeroSection() {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          minHeight: "88vh",
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          bgcolor: "#2a2a2a",
          position: "relative",
          display: "flex",
          alignItems: "center",
          pt: 8,
          pb: { xs: 6, md: 2 },
        }}
      >
        {/* Dark overlay - exact gradient from CSS */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.6) 50%, rgba(10,10,10,0.85) 100%)",
            zIndex: 1,
          }}
        />

       <Container
  maxWidth="xl"
  disableGutters
  sx={{
    position: "relative",
    zIndex: 2,
   px: { xs: 1.5, md: 1 },
  }}
>
          {/* Orange top line */}
          <Box sx={{ width: 48, height: 4, bgcolor: "#f5a623", mb: 3 }} />

          <Typography
            sx={{
              color: "rgb(245, 166, 35)",
              fontWeight: 700,
              fontSize: "1.2rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              
              fontFamily: "Inter, sans-serif",
              mb: 2,
            }}
          >
            Award-Winning Construction Company
          </Typography>

          <Typography
            variant="h1"
            sx={{
              color: "white",
              fontWeight: 800,
              fontSize: { xs: "3.2rem", md: "5.5rem", lg: "5.5rem" },
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
  sx={{
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: "1.5rem",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.7,
    letterSpacing: "0.01em",
    wordSpacing: "0.05em", // ya isay hata do
    maxWidth: 700,         // 500 se barhao
    mb: 5,
  }}
>
  From concept to completion, we deliver exceptional construction services
  backed by 25+ years of excellence, innovation, and unwavering commitment to
  quality.
</Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: "rgb(245, 166, 35)",
                color: "rgb(10, 10, 10)",
                fontWeight: 600,
                textTransform: "none",
                px: 4,
                py: "14.4px",
                fontSize: "1.3rem",
                borderRadius: "4px",
                letterSpacing: "0.04em",
                fontFamily: "Inter, sans-serif",
                boxShadow: "rgba(245, 166, 35, 0.35) 0px 4px 14px",
                transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": { background: "rgb(220, 149, 30)", boxShadow: "rgba(245, 166, 35, 0.5) 0px 6px 20px" },
              }}
            >
              Start Your Project
            </Button>
            <Button
              variant="outlined"
              startIcon={<PlayCircleFilledWhiteIcon />}
              sx={{
                border: "2px solid rgba(255, 255, 255, 0.3)",
                color: "rgb(255, 255, 255)",
                fontWeight: 600,
                textTransform: "none",
                px: 4,
                py: "14.4px",
                fontSize: "1.3rem",
                borderRadius: "4px",
                letterSpacing: "0.04em",
                fontFamily: "Inter, sans-serif",
                transition: "0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": { border: "2px solid #f5a623", color: "#f5a623" },
              }}
            >
              View Our Work
            </Button>
          </Box>
        </Container>
      </Box>

      <StatsBar />
    </Box>
  );
}

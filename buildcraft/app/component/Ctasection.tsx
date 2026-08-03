"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import { useRef } from "react";
import { useGsapReveal } from "../hooks/useGsapReveal";

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGsapReveal(sectionRef, {
    selector: "[data-gsap='cta-item']",
    stagger: 0.1,
    scrollTrigger: true,
  });

  return (
    <Box ref={sectionRef} sx={{ bgcolor: "#0D0D0D", py: { xs: 8, md: 12 } }} id="cta">
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        {/* alignItems left as default "stretch" so both columns share the same
            row height — required for the right column's height:"100%" centering to work */}
        <Grid container spacing={{ xs: 4, md: 3 }} sx={{ alignItems: "center" }}>
          {/* Left: Text — flush to the left edge */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box data-gsap="cta-item" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 28, height: 2, bgcolor: "#f5a623" }} />
              <Typography
                sx={{
                  color: "#f5a623", fontWeight: 700, fontSize: "0.75rem",
                  letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                }}
              >
                Start Your Project Today
              </Typography>
            </Box>

            <Typography
              data-gsap="cta-item"
              variant="h2"
              sx={{
                fontWeight: 800,
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: { xs: "2.3rem", sm: "2.8rem", md: "3.4rem" },
                lineHeight: 1.2, mb: 2.5,
              }}
            >
              <Box component="span" sx={{ color: "#fff" }}>Ready to Build </Box>
              <Box component="span" sx={{ color: "#f5a623" }}>Something Extraordinary?</Box>
            </Typography>

            <Typography
              data-gsap="cta-item"
              sx={{
                color: "#9CA3AF", fontSize: "1rem", fontFamily: "Inter, sans-serif",
                lineHeight: 1.7, maxWidth: 480,
              }}
            >
              Let&apos;s discuss your project and bring your vision to life. Our
              team is ready to deliver excellence.
            </Typography>
          </Grid>

          {/* Right: Buttons */}
          <Grid size={{ xs: 12, md: 4 }}>
           <Box
  sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: { xs: "stretch", md: "flex-end" },
    justifyContent: "center",
    gap: 2,
  }}
>
              <Button
                data-gsap="cta-item"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#f5a623", color: "#111827", fontWeight: 700,
                  textTransform: "none", px: 3.5, py: 1.4, fontSize: "0.95rem",
                  borderRadius: "8px", boxShadow: "none",
                  width: { xs: "100%", md: "auto" },
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#e09400", boxShadow: "none" },
                }}
              >
                Get Free Quote
              </Button>

              <Button
                data-gsap="cta-item"
                variant="outlined"
                startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: "#fff", borderColor: "rgba(255,255,255,0.3)",
                  fontWeight: 700, textTransform: "none",
                  px: 3.5, py: 1.4, fontSize: "0.95rem",
                  borderRadius: "8px",
                  width: { xs: "100%", md: "auto" },
                  whiteSpace: "nowrap",
                  "&:hover": { borderColor: "#f5a623", bgcolor: "rgba(245,166,35,0.08)" },
                }}
              >
                +1 (555) 234-5678
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
"use client";
import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// SSR check: only register ScrollTrigger on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const stats = [
  { numericValue: 850, suffix: "+", label: "Projects Completed" },
  { numericValue: 25, suffix: "+", label: "Years Experience" },
  { numericValue: 200, suffix: "+", label: "Expert Team Members" },
  { numericValue: 98, suffix: "%", label: "Client Satisfaction" },
];

export default function StatsBar() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade/slide-up the entire stats bar on scroll
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 95%",
          toggleActions: "play none none none",
        },
      });

      // Animate the counters on scroll
      gsap.utils.toArray<HTMLElement>(".stat-number").forEach((el) => {
        const target = parseFloat(el.getAttribute("data-target") || "0");
        const suffix = el.getAttribute("data-suffix") || "";
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 95%",
            toggleActions: "play none none none",
          },
          onUpdate: () => {
            el.innerText = Math.floor(obj.val).toString() + suffix;
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <Box ref={containerRef} sx={{ bgcolor: "#000000", py: 6 }}>
      <Container maxWidth="xl" disableGutters>
        <Grid container spacing={2}>
          {stats.map((s) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }} sx={{ textAlign: "center" }}>
              <Typography
                className="stat-number"
                data-target={s.numericValue}
                data-suffix={s.suffix}
                sx={{
                  color: "rgb(245, 166, 35)",
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1,
                }}
              >
                0{s.suffix}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "1.3rem",
                  fontFamily: "'Inter', sans-serif",
                  mt: 0.5,
                  letterSpacing: '0.02em',
                  fontWeight: 500,
                }}
              >
                {s.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

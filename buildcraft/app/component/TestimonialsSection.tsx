"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: "James Mitchell",
    role: "CEO, Mitchell Corp",
    text: "BuildCraft exceeded every expectation. Their attention to detail and commitment to quality is unmatched. Our commercial complex was delivered on time and within budget.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    text: "From the initial design consultation to the final walkthrough, the BuildCraft team was professional, communicative, and truly passionate about their work.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Robert Chen",
    role: "Property Developer",
    text: "We have worked with many construction firms, but BuildCraft stands out for their innovative approach and exceptional craftsmanship. Highly recommended.",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // Section entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testi-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        }
      );
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const animateChange = useCallback((newIndex: number) => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      opacity: 0, y: -20, duration: 0.3, ease: "power2.in",
      onComplete: () => {
        setCurrent(newIndex);
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 20, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
        );
      },
    });
  }, []);

  const prev = () => animateChange((current - 1 + testimonials.length) % testimonials.length);
  const next = () => animateChange((current + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <Box ref={sectionRef} id="testimonials" sx={{ bgcolor: "#FAFAFA", py: { xs: 6, md: 12 } }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box className="testi-header" sx={{ textAlign: "center", mb: 7 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
            <Box sx={{ width: 28, height: 2, bgcolor: "#f5a623" }} />
            <Typography sx={{ color: "#f5a623", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Inter, sans-serif" }}>
              Testimonials
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: "#111827", fontFamily: "'Playfair Display', Georgia, serif", fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" }, lineHeight: 1.15, mb: 2 }}>
            What Our Clients Say
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "1rem", fontFamily: "Inter, sans-serif", lineHeight: 1.7 }}>
            Hear from the people who&apos;ve experienced the BuildCraft difference firsthand.
          </Typography>
        </Box>

        {/* Card */}
        <Box
          ref={cardRef}
          sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
            p: { xs: 4, md: 6 },
            textAlign: "center",
            maxWidth: 750,
            mx: "auto",
          }}
        >
          {/* Quote icon */}
          <Typography sx={{ fontSize: "3.5rem", color: "rgba(245,166,35,0.25)", lineHeight: 1, mb: 1, fontFamily: "Georgia, serif" }}>
            ❝
          </Typography>

          {/* Stars */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mb: 3 }}>
            {Array(t.rating).fill(0).map((_, j) => (
              <StarIcon key={j} sx={{ color: "#f5a623", fontSize: "1.3rem" }} />
            ))}
          </Box>

          {/* Quote text */}
          <Typography
            sx={{
              fontSize: { xs: "1rem", md: "1.15rem" },
              fontStyle: "italic",
              color: "#374151",
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            &ldquo;{t.text}&rdquo;
          </Typography>

          {/* Avatar */}
          <Box
            component="img"
            src={t.image}
            alt={t.name}
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid #f5a623",
              objectFit: "cover",
              mb: 1.5,
            }}
          />

          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", fontFamily: "Inter, sans-serif" }}>
            {t.name}
          </Typography>
          <Typography sx={{ fontSize: "0.88rem", color: "#f5a623", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            {t.role}
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 5 }}>
          <IconButton
            onClick={prev}
            sx={{
              width: 44, height: 44,
              border: "1.5px solid #E5E7EB",
              bgcolor: "#fff",
              transition: "all .25s ease",
              "&:hover": { borderColor: "#f5a623", color: "#f5a623", transform: "scale(1.1)" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>

          {/* Dots */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {testimonials.map((_, i) => (
              <Box
                key={i}
                onClick={() => animateChange(i)}
                sx={{
                  width: i === current ? 28 : 10,
                  height: 10,
                  borderRadius: "999px",
                  bgcolor: i === current ? "#f5a623" : "#D1D5DB",
                  cursor: "pointer",
                  transition: "all .3s ease",
                }}
              />
            ))}
          </Box>

          <IconButton
            onClick={next}
            sx={{
              width: 44, height: 44,
              border: "1.5px solid #E5E7EB",
              bgcolor: "#fff",
              transition: "all .25s ease",
              "&:hover": { borderColor: "#f5a623", color: "#f5a623", transform: "scale(1.1)" },
            }}
          >
            <ArrowForwardIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}

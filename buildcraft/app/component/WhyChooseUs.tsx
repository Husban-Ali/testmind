"use client";
import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BadgeCheck, Clock, Users, CreditCard, ShieldCheck, Leaf } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    icon: BadgeCheck,
    title: "Premium Quality",
    description: "We use only the finest materials and proven construction methods to ensure lasting excellence.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "Our systematic approach guarantees project completion within the agreed timeline, every time.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "Our seasoned professionals bring decades of combined experience to every project we undertake.",
  },
  {
    icon: CreditCard,
    title: "Transparent Pricing",
    description: "No hidden costs or surprises. We provide detailed estimates and maintain budget transparency.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    description: "Industry-leading safety protocols protect our workers, clients, and communities on every job site.",
  },
  {
    icon: Leaf,
    title: "Sustainable Building",
    description: "Eco-conscious construction practices that minimize environmental impact without compromising quality.",
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".why-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        }
      );
      gsap.fromTo(
        ".why-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: ".why-cards-grid", start: "top 85%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={sectionRef}
      id="why-choose-us"
      sx={{
        bgcolor: "#0B0B0B",
        py: { xs: 6, md: 12 },
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        {/* Header */}
        <Box className="why-header" sx={{ textAlign: "center", mb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
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
              Why Choose Us
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { xs: "2rem", md: "3.4rem" },
              lineHeight: 1.15,
              mb: 2.5,
            }}
          >
            The BuildCraft Advantage
          </Typography>

          <Typography
            sx={{
              color: "#9CA3AF",
              fontSize: "1rem",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.7,
              maxWidth: 560,
              mx: "auto",
            }}
          >
            What sets us apart from the competition and makes us the preferred choice for
            premium construction services.
          </Typography>
        </Box>

        {/* Cards */}
        <Grid container spacing={3} className="why-cards-grid" sx={{ justifyContent: "center" }}>
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  className="why-card"
                  sx={{
                    bgcolor: "#161616",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    p: "32px 28px",
                    minHeight: 260,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all .35s ease",
                    cursor: "default",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      border: "1px solid rgba(244,166,35,0.3)",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                      "& .why-icon-box": { bgcolor: "#F4A623" },
                      "& .why-icon-box svg": { transform: "rotate(360deg)", color: "#000" },
                    },
                  }}
                >
                  {/* Icon Box */}
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: "rgba(244,166,35,0.15)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      transition: "background .35s ease",
                      "& svg": { transition: "transform .5s ease" },
                    }}
                    className="why-icon-box"
                  >
                    <Icon size={22} color="#F4A623" />
                  </Box>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: "#F9FAFB",
                      fontFamily: "Inter, sans-serif",
                      mb: 1.5,
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      lineHeight: 1.75,
                      color: "#9CA3AF",
                      fontFamily: "Inter, sans-serif",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

"use client";
import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import EmailIcon from "@mui/icons-material/Email";

gsap.registerPlugin(ScrollTrigger);

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

const team: TeamMember[] = [
  {
    name: "Jonathan Mitchell",
    role: "CEO & Founder",
    image: "/team1.png",
    bio: "Visionary leader driving the company's strategy and long-term growth.",
  },
  {
    name: "Sarah Chen",
    role: "Lead Architect",
    image: "/team2.png",
    bio: "Designs bold, functional spaces that balance form and everyday use.",
  },
  {
    name: "Michael Rodriguez",
    role: "Chief Engineer",
    image: "/team3.png",
    bio: "Oversees technical execution, ensuring every build meets the highest standard.",
  },
  {
    name: "Emily Thompson",
    role: "Operations Director",
    image: "/team4.png",
    bio: "Operations mastermind ensuring every project exceeds client expectations.",
  },
];

export default function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".team-header",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        }
      );

      gsap.fromTo(
        ".team-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15,
          scrollTrigger: { trigger: ".team-grid", start: "top 85%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box ref={sectionRef} id="team" sx={{ bgcolor: "#fff", py: 12 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>

        {/* Header */}
        <Box className="team-header" sx={{ textAlign: "center", mb: 7 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
            <Box sx={{ width: 28, height: 2, bgcolor: "#f5a623" }} />
            <Typography
              sx={{
                color: "#f5a623", fontWeight: 700, fontSize: "0.75rem",
                letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              }}
            >
              Our Team
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
            Meet the Experts
          </Typography>

          <Typography
            sx={{
              color: "#6B7280", fontSize: "1rem", fontFamily: "Inter, sans-serif",
              lineHeight: 1.7, maxWidth: 560, mx: "auto",
            }}
          >
            Our talented team of professionals brings passion, expertise, and dedication to
            every project.
          </Typography>
        </Box>

        {/* Grid */}
        <Grid container spacing={3} className="team-grid">
          {team.map((member, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Box className="team-card">
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: 380,
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    "&:hover .team-overlay": { opacity: 1 },
                    "&:hover .team-bio-content": { transform: "translateY(0)" },
                    "&:hover .team-img": { transform: "scale(1.06)" },
                  }}
                >
                  <Box
                    className="team-img"
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      transition: "transform .5s ease",
                    }}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 25vw"
                    />
                  </Box>

                  {/* Hover Overlay */}
                  <Box
                    className="team-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(17,24,39,0) 30%, rgba(17,24,39,0.92) 100%)",
                      opacity: 0,
                      transition: "opacity .35s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      p: 2.5,
                    }}
                  >
                    <Box
                      className="team-bio-content"
                      sx={{
                        transform: "translateY(14px)",
                        transition: "transform .35s ease",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                        {[LinkedInIcon, TwitterIcon, EmailIcon].map((Icon, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 32, height: 32,
                              borderRadius: "50%",
                              bgcolor: "rgba(255,255,255,0.15)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "background-color .25s ease",
                              "&:hover": { bgcolor: "#f5a623" },
                            }}
                          >
                            <Icon sx={{ fontSize: 16, color: "#fff" }} />
                          </Box>
                        ))}
                      </Box>
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: "0.82rem",
                          lineHeight: 1.6,
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {member.bio}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Name + Role (always visible, below image) */}
                <Box sx={{ mt: 2, px: 0.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 700, color: "#111827",
                      fontSize: "1.05rem",
                      fontFamily: "Inter, sans-serif",
                      mb: 0.3,
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#f5a623", fontWeight: 600,
                      fontSize: "0.85rem",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {member.role}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}
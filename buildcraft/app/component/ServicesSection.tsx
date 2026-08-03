"use client";
import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Home, Building2, Hammer, Sofa, Compass, ClipboardCheck, LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Service {
  title: string;
  description: string;
  image: string;
  icon: LucideIcon;
}

const services: Service[] = [
  {
    title: "Residential Construction",
    description: "Crafting dream homes with precision engineering and premium materials. From single-family homes to luxury estates and beyond.",
    image: "/residential.jfif",
    icon: Home,
  },
  {
    title: "Commercial Construction",
    description: "Building modern commercial spaces that drive business growth. Office buildings, retail centers, and mixed-use developments at scale.",
    image: "/commercial.jfif",
    icon: Building2,
  },
  {
    title: "Renovation & Remodeling",
    description: "Transforming existing spaces with innovative design and expert craftsmanship. Complete interior and exterior renovations done right.",
    image: "/renovation.jfif",
    icon: Hammer,
  },
  {
    title: "Interior Design",
    description: "Creating stunning interiors that blend aesthetics with functionality. Customized design solutions tailored for every unique space.",
    image: "/interior.jfif",
    icon: Sofa,
  },
  {
    title: "Architecture & Planning",
    description: "Innovative architectural designs that push boundaries while respecting environmental and structural principles at every level.",
    image: "/architecture.jfif",
    icon: Compass,
  },
  {
    title: "Project Management",
    description: "End-to-end project oversight ensuring timely delivery, budget adherence, and quality standards maintained at every phase.",
    image: "/project-management.jfif",
    icon: ClipboardCheck,
  },
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".service-card");
    if (!cards || cards.length === 0) return;

    gsap.set(cards, { opacity: 1, y: 0 });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={sectionRef}
      className="services-section"
      id="services"
      sx={{ bgcolor: "#fff", py: { xs: 6, md: 10 } }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Box data-gsap="service-item" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
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
              Our Services
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: "#111827",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { xs: "2rem", md: "3.2rem" },
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            What We Offer
          </Typography>
          <Typography
            sx={{
              color: "#6B7280",
              fontSize: "1rem",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.7,
              maxWidth: 560,
              mx: "auto",
            }}
          >
            Comprehensive construction services tailored to transform your ideas into extraordinary built environments.
          </Typography>
        </Box>

        {/* Cards Grid */}
        <Grid container spacing={3}>
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  className="service-card"
                  sx={{
                     position: "relative",
                    borderRadius: "14px",
                    border: "1px solid #ECECEC",
                    boxShadow: "0 2px 10px rgba(0,0,0,.05)",
                    overflow: "visible",
                    
                    transition: "all .35s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 20px 40px rgba(0,0,0,.12)",
                      "& .service-img": { transform: "scale(1.06)" },
                      "& .floating-icon": { bgcolor: "#F4A623", border: "1px solid #F4A623" },
                      "& .learn-more": { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  {/* Image */}
                 <Box
                    sx={{
                       position: "relative",
                       height: { xs: 180, md: 220 },
                       overflow: "hidden",
                       borderTopLeftRadius: "14px",
                       borderTopRightRadius: "14px",
                      }}
>
                    <Box
                      className="service-img"
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        transition: "transform .35s ease",
                      }}
                    >
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        style={{ objectFit: "cover", display: "block" }}
                        sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw"
                      />
                    </Box>

                    {/* Floating Icon - top half transparent over image, bottom half white over card */}
                   
                  </Box>
                  <Box
  className="floating-icon"
  sx={{
    position: "absolute",
    left: 20,
    top: "calc(220px - 22px)",

    width: 44,
    height: 44,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: "10px",

    background: "transparent",
  

    border: "1px solid rgba(255,255,255,.35)",

    boxShadow: "0 8px 20px rgba(0,0,0,.15)",

    zIndex: 10,

    transition: ".35s",
  }}
>
  <Icon size={18} color="#F4A623" />
</Box>

                  {/* Content */}
                  <Box sx={{ p: "28px 22px 24px" }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "20px",
                        color: "#111827",
                        mb: "10px",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        lineHeight: 1.7,
                        color: "#6B7280",
                        fontFamily: "Inter, sans-serif",
                        mb: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {service.description}
                    </Typography>
                    <Box
                      className="learn-more"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "#F4A623",
                        opacity: 0,
                        transform: "translateY(6px)",
                        transition: "all .35s ease",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", fontFamily: "Inter, sans-serif" }}>
                        Learn More
                      </Typography>
                      <span style={{ fontSize: "1rem" }}>→</span>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

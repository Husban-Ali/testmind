"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HandymanIcon from "@mui/icons-material/Handyman";
import BedIcon from "@mui/icons-material/Bed";
import BusinessIcon from "@mui/icons-material/Business";
import DesignServicesIcon from "@mui/icons-material/DesignServices";

const services = [
  { icon: <HomeIcon sx={{ fontSize: "1.8rem", color: "#f5a623" }} />, title: "Residential Construction", desc: "Crafting dream homes with precision engineering and premium materials. From single-family homes to luxury estates.", img: "/hero-bg.png" },
  { icon: <ApartmentIcon sx={{ fontSize: "1.8rem", color: "#f5a623" }} />, title: "Commercial Construction", desc: "Building modern commercial spaces that drive business growth. Office buildings, retail centers, and mixed-use developments.", img: "/hero-bg.png" },
  { icon: <HandymanIcon sx={{ fontSize: "1.8rem", color: "#f5a623" }} />, title: "Renovation & Remodeling", desc: "Transforming existing spaces with innovative design and expert craftsmanship. Complete interior and exterior renovations.", img: "/hero-bg.png" },
  { icon: <BedIcon sx={{ fontSize: "1.8rem", color: "#f5a623" }} />, title: "Interior Design", desc: "Creating beautiful, functional interiors that reflect your style and meet your needs with premium finishes.", img: "/hero-bg.png" },
  { icon: <BusinessIcon sx={{ fontSize: "1.8rem", color: "#f5a623" }} />, title: "Industrial Projects", desc: "Heavy-duty industrial facilities designed for efficiency, safety, and long-term performance at scale.", img: "/hero-bg.png" },
  { icon: <DesignServicesIcon sx={{ fontSize: "1.8rem", color: "#f5a623" }} />, title: "Architecture & Design", desc: "Innovative architectural designs that blend aesthetics with functionality and sustainability for every project.", img: "/hero-bg.png" },
];

export default function ServicesSection() {
  return (
    <Box sx={{ bgcolor: "#f5f5f0", py: 10 }} id="services">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Box sx={{ width: 48, height: 3, bgcolor: "#f5a623", mx: "auto", mb: 2 }} />
          <Typography sx={{ color: "#f5a623", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", mb: 1 }}>
            What We Offer
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Our Services
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {services.map((s, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  overflow: "visible",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  transition: "box-shadow 0.3s",
                  "&:hover": { boxShadow: "0 8px 30px rgba(0,0,0,0.15)" },
                  cursor: "pointer",
                }}
              >
                {/* Image with icon badge */}
                <Box sx={{ position: "relative" }}>
                  <Box
                    component="img"
                    src={s.img}
                    alt={s.title}
                    sx={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "8px 8px 0 0", display: "block" }}
                  />
                  {/* Icon badge - overlapping image bottom-left */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -24,
                      left: 24,
                      bgcolor: "white",
                      borderRadius: 2,
                      p: 1.5,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                    }}
                  >
                    {s.icon}
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3, pt: 5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#1a1a1a", mb: 1.5 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ color: "#666", lineHeight: 1.7, mb: 2.5, fontSize: "0.95rem" }}>
                    {s.desc}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#f5a623", cursor: "pointer" }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>Learn More</Typography>
                    <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

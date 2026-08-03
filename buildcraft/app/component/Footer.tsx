"use client";
import { scrollToSection } from "../utils/scrollToSection";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const quickLinks = ["Home", "About", "Services", "Projects", "Testimonials", "Contact"];

const services = [
  "Residential Construction",
  "Commercial Construction",
  "Renovation & Remodeling",
  "Interior Design",
  "Architecture & Planning",
  "Project Management",
];

const contactInfo = [
  { icon: LocationOnIcon, text: "1247 Construction Ave, Suite 400, New York, NY 10001" },
  { icon: PhoneIcon, text: "+1 (555) 234-5678" },
  { icon: EmailIcon, text: "info@buildcraft.com" },
];

const socials = [FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon, YouTubeIcon];

const bottomLinks = ["Privacy Policy", "Terms of Service", "Sitemap"];

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "#0D0D0D", pt: { xs: 8, md: 12 }, pb: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
        <Grid container spacing={{ xs: 6, md: 7 }} sx={{ mb: 8 }}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Box
                sx={{
                  bgcolor: "#f5a623", color: "#111827", fontWeight: 800,
                  fontSize: "1.2rem", px: 1.3, py: 0.5, mr: 1.4, borderRadius: "5px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                BC
              </Box>
              <Typography
                sx={{
                  fontWeight: 700, fontSize: "1.6rem", color: "white",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Build<span style={{ color: "#f5a623" }}>Craft</span>
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#9CA3AF", lineHeight: 1.85, mb: 3.5, maxWidth: 360,
                fontFamily: "Inter, sans-serif", fontSize: "1rem",
              }}
            >
              Building excellence since 1999. We deliver premium construction services
              with unwavering commitment to quality, safety, and client satisfaction.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contactInfo.map((c, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <c.icon sx={{ fontSize: 21, color: "#f5a623", mt: 0.3 }} />
                  <Typography
                    sx={{
                      color: "#9CA3AF", fontSize: "0.98rem",
                      fontFamily: "Inter, sans-serif", lineHeight: 1.6,
                    }}
                  >
                    {c.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 6, sm: 6, md: 2 }}>
            <Typography
              sx={{
                color: "#f5a623", fontWeight: 700, mb: 3, fontSize: "0.9rem",
                letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              }}
            >
              Quick Links
            </Typography>
            {quickLinks.map((item) => (
              <Typography
                key={item}
                onClick={() => scrollToSection(item)}
                sx={{
                  color: "#9CA3AF", mb: 2, cursor: "pointer", fontSize: "1rem",
                  fontFamily: "Inter, sans-serif", transition: "color 0.2s",
                  "&:hover": { color: "#f5a623" },
                }}
              >
                {item}
              </Typography>
            ))}
          </Grid>

          {/* Services */}
          <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
            <Typography
              sx={{
                color: "#f5a623", fontWeight: 700, mb: 3, fontSize: "0.9rem",
                letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              }}
            >
              Services
            </Typography>
            {services.map((item) => (
              <Typography
                key={item}
                onClick={() => scrollToSection(item.split(" ")[0])}
                sx={{
                  color: "#9CA3AF", mb: 2, cursor: "pointer", fontSize: "1rem",
                  fontFamily: "Inter, sans-serif", transition: "color 0.2s",
                  lineHeight: 1.5,
                  "&:hover": { color: "#f5a623" },
                }}
              >
                {item}
              </Typography>
            ))}
          </Grid>

          {/* Newsletter */}
          <Grid size={{ xs: 12, sm: 12, md: 3.5 }}>
            <Typography
              sx={{
                color: "#f5a623", fontWeight: 700, mb: 3, fontSize: "0.9rem",
                letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              }}
            >
              Newsletter
            </Typography>
            <Typography
              sx={{
                color: "#9CA3AF", mb: 3, fontSize: "1rem",
                fontFamily: "Inter, sans-serif", lineHeight: 1.75,
              }}
            >
              Subscribe to our newsletter for the latest updates on
              projects, industry insights, and exclusive offers.
            </Typography>

            <Box sx={{ display: "flex", gap: 1.2, mb: 3.5 }}>
              <Box
                component="input"
                placeholder="Your email address"
                sx={{
                  flex: 1, bgcolor: "#1A1A1A", border: "1px solid #2A2A2A",
                  borderRadius: "9px", color: "white", px: 2.2, py: 1.7,
                  outline: "none", fontSize: "0.98rem", fontFamily: "Inter, sans-serif",
                  "&::placeholder": { color: "#666" },
                }}
              />
              <Box
                component="button"
                sx={{
                  bgcolor: "#f5a623", color: "#111827", border: "none",
                  borderRadius: "9px", width: 54, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "#e09400" },
                }}
              >
                <ArrowForwardIcon sx={{ fontSize: 22 }} />
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1.2 }}>
              {socials.map((Icon, i) => (
                <IconButton
                  key={i}
                  sx={{
                    bgcolor: "#1A1A1A", color: "#9CA3AF", borderRadius: "9px",
                    border: "1px solid #2A2A2A", width: 46, height: 46,
                    "&:hover": { bgcolor: "#f5a623", color: "#111827", borderColor: "#f5a623" },
                    transition: "all 0.25s",
                  }}
                >
                  <Icon sx={{ fontSize: "1.25rem" }} />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box
          sx={{
            borderTop: "1px solid #222", pt: 3.5,
            display: "flex", justifyContent: "space-between",
            flexWrap: "wrap", gap: 2,
          }}
        >
          <Typography sx={{ color: "#666", fontSize: "0.95rem", fontFamily: "Inter, sans-serif" }}>
            © 2026 BuildCraft Construction. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3.5 }}>
            {bottomLinks.map((link) => (
              <Typography
                key={link}
                sx={{
                  color: "#666", fontSize: "0.95rem", fontFamily: "Inter, sans-serif",
                  cursor: "pointer", transition: "color 0.2s",
                  "&:hover": { color: "#f5a623" },
                }}
              >
                {link}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
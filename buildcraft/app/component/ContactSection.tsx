"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useRef } from "react";
import { useGsapReveal } from "../hooks/useGsapReveal";

const contactInfo = [
  {
    icon: <LocationOnIcon sx={{ color: "#f5a623" }} />,
    label: "Visit Us",
    value: "1247 Construction Ave, Suite 400, New York, NY 10001",
  },
  {
    icon: <PhoneIcon sx={{ color: "#f5a623" }} />,
    label: "Call Us",
    value: "+1 (555) 234-5678",
  },
  {
    icon: <EmailIcon sx={{ color: "#f5a623" }} />,
    label: "Email Us",
    value: "info@buildcraft.com",
  },
  {
    icon: <AccessTimeIcon sx={{ color: "#f5a623" }} />,
    label: "Working Hours",
    value: "Mon - Fri: 8:00 AM - 6:00 PM",
  },
];

const services = [
  "New Construction",
  "Renovation",
  "Interior Design",
  "Commercial Project",
  "Other",
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff",
    borderRadius: "8px",
    "& fieldset": { borderColor: "#E5E7EB" },
    "&:hover fieldset": { borderColor: "#f5a623" },
    "&.Mui-focused fieldset": { borderColor: "#f5a623" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f5a623" },
};

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGsapReveal(sectionRef, {
    selector: "[data-gsap='contact-item']",
    stagger: 0.08,
    scrollTrigger: true,
  });

  return (
    <Box ref={sectionRef} sx={{ bgcolor: "#fff", py: { xs: 6, md: 12 } }} id="contact">
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>

        {/* Header */}
        <Box data-gsap="contact-item" sx={{ textAlign: "center", mb: 8 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
            <Box sx={{ width: 28, height: 2, bgcolor: "#f5a623" }} />
            <Typography
              sx={{
                color: "#f5a623", fontWeight: 700, fontSize: "0.75rem",
                letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "Inter, sans-serif",
              }}
            >
              Get In Touch
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800, color: "#111827",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: { xs: "1.8rem", md: "3rem" },
              lineHeight: 1.15, mb: 2,
            }}
          >
            Contact Us
          </Typography>

          <Typography
            sx={{
              color: "#6B7280", fontSize: "1rem", fontFamily: "Inter, sans-serif",
              lineHeight: 1.7, maxWidth: 560, mx: "auto",
            }}
          >
            Have a project in mind? We&apos;d love to hear from you. Send us a message and we&apos;ll
            respond within 24 hours.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left: Info */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box data-gsap="contact-item" sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 800, color: "#111827", fontSize: "1.3rem",
                  fontFamily: "'Playfair Display', Georgia, serif", mb: 1.5,
                }}
              >
                Let&apos;s Start a Conversation
              </Typography>
              <Typography
                sx={{
                  color: "#6B7280", fontSize: "0.95rem",
                  fontFamily: "Inter, sans-serif", lineHeight: 1.75,
                }}
              >
                Whether you&apos;re planning a new build or renovation, our team
                is here to help you every step of the way.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {contactInfo.map((c, i) => (
                <Box
                  key={i}
                  data-gsap="contact-item"
                  sx={{
                    display: "flex", alignItems: "flex-start", gap: 2,
                    bgcolor: "#FDF6EA",
                    borderRadius: "12px",
                    p: 2.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 42, height: 42, flexShrink: 0,
                      borderRadius: "10px",
                      bgcolor: "#FCEACB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {c.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700, color: "#111827", fontSize: "0.92rem",
                        fontFamily: "Inter, sans-serif", mb: 0.3,
                      }}
                    >
                      {c.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#6B7280", fontSize: "0.88rem",
                        fontFamily: "Inter, sans-serif", lineHeight: 1.5,
                      }}
                    >
                      {c.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Right: Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              data-gsap="contact-item"
              sx={{
                bgcolor: "#F7F7F8",
                borderRadius: "16px",
                p: { xs: 3, sm: 4 },
              }}
            >
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="First Name *" variant="outlined" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Last Name *" variant="outlined" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Email Address *" variant="outlined" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="Phone Number" variant="outlined" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Service Interested In"
                    variant="outlined"
                    defaultValue=""
                    sx={fieldSx}
                  >
                    {services.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Project Details *"
                    variant="outlined"
                    multiline
                    rows={5}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: "#f5a623", color: "#111827", fontWeight: 700,
                      textTransform: "none", py: 1.6, fontSize: "1rem",
                      borderRadius: "8px", boxShadow: "none",
                      "&:hover": { bgcolor: "#e09400", boxShadow: "none" },
                    }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
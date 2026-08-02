"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const contactInfo = [
  { icon: <PhoneIcon sx={{ color: "#f5a623" }} />, label: "Phone", value: "+1 (555) 234-5678" },
  { icon: <EmailIcon sx={{ color: "#f5a623" }} />, label: "Email", value: "info@buildcraft.com" },
  { icon: <LocationOnIcon sx={{ color: "#f5a623" }} />, label: "Address", value: "123 Construction Ave, New York, NY 10001" },
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#ddd" },
    "&:hover fieldset": { borderColor: "#f5a623" },
    "&.Mui-focused fieldset": { borderColor: "#f5a623" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f5a623" },
};

export default function ContactSection() {
  return (
    <Box sx={{ bgcolor: "#fff", py: 10 }} id="contact">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Box sx={{ width: 48, height: 3, bgcolor: "#f5a623", mx: "auto", mb: 2 }} />
          <Typography sx={{ color: "#f5a623", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", mb: 1 }}>
            Get In Touch
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, color: "#1a1a1a" }}>
            Contact Us
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ bgcolor: "#1a1a1a", p: 4, height: "100%" }}>
              <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 3 }}>
                Let&apos;s Start Your Project
              </Typography>
              <Typography sx={{ color: "#aaa", mb: 4, lineHeight: 1.8 }}>
                Ready to bring your vision to life? Contact us today for a free consultation and quote.
              </Typography>
              {contactInfo.map((c, i) => (
                <Box key={i} sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <Box sx={{ mt: 0.3 }}>{c.icon}</Box>
                  <Box>
                    <Typography sx={{ color: "#888", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.label}</Typography>
                    <Typography sx={{ color: "white", fontWeight: 500 }}>{c.value}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Your Name" variant="outlined" sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Email Address" variant="outlined" sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Phone Number" variant="outlined" sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Project Type" variant="outlined" sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Project Details" variant="outlined" multiline rows={5} sx={inputSx} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 700, textTransform: "none", px: 4, py: 1.5, fontSize: "1rem", borderRadius: 1, "&:hover": { bgcolor: "#e09400" } }}
                >
                  Send Message
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";

const links = {
  "Quick Links": ["Home", "About Us", "Services", "Projects", "Testimonials", "Contact"],
  "Services": ["Commercial Construction", "Residential Building", "Industrial Projects", "Architecture & Design", "Renovation"],
};

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "#111", pt: 8, pb: 3 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box sx={{ bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 900, fontSize: "1rem", px: 0.8, py: 0.3, mr: 1 }}>BC</Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", color: "white" }}>
                Build<span style={{ color: "#f5a623" }}>Craft</span>
              </Typography>
            </Box>
            <Typography sx={{ color: "#888", lineHeight: 1.8, mb: 3, maxWidth: 300 }}>
              Building excellence since 1998. We transform visions into reality with quality, innovation, and commitment.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[FacebookIcon, TwitterIcon, LinkedInIcon, InstagramIcon].map((Icon, i) => (
                <IconButton key={i} sx={{ bgcolor: "#222", color: "#888", "&:hover": { bgcolor: "#f5a623", color: "#1a1a1a" }, transition: "all 0.3s" }}>
                  <Icon sx={{ fontSize: "1.1rem" }} />
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <Grid key={title} size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "1rem" }}>{title}</Typography>
              {items.map((item) => (
                <Typography
                  key={item}
                  sx={{ color: "#888", mb: 1, cursor: "pointer", fontSize: "0.9rem", "&:hover": { color: "#f5a623" }, transition: "color 0.2s" }}
                >
                  {item}
                </Typography>
              ))}
            </Grid>
          ))}

          {/* Newsletter */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography sx={{ color: "white", fontWeight: 700, mb: 2, fontSize: "1rem" }}>Newsletter</Typography>
            <Typography sx={{ color: "#888", mb: 2, fontSize: "0.9rem" }}>Subscribe to get updates on our latest projects and news.</Typography>
            <Box sx={{ display: "flex" }}>
              <Box
                component="input"
                placeholder="Your email address"
                sx={{ flex: 1, bgcolor: "#222", border: "1px solid #333", color: "white", px: 2, py: 1.2, outline: "none", fontSize: "0.9rem", "&::placeholder": { color: "#666" } }}
              />
              <Box
                component="button"
                sx={{ bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 700, px: 2, border: "none", cursor: "pointer", fontSize: "0.85rem", "&:hover": { bgcolor: "#e09400" } }}
              >
                Subscribe
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom bar */}
        <Box sx={{ borderTop: "1px solid #222", pt: 3, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ color: "#666", fontSize: "0.85rem" }}>
            © 2024 BuildCraft. All rights reserved.
          </Typography>
          <Typography sx={{ color: "#666", fontSize: "0.85rem" }}>
            Privacy Policy · Terms of Service
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

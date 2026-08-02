"use client"

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import PhoneIcon from "@mui/icons-material/Phone";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const pages = ["Home", "About", "Services", "Projects", "Testimonials", "Contact"];

export default function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [activePage, setActivePage] = React.useState("Home");
  const appBarRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (!appBarRef.current) {
      return;
    }

    gsap.fromTo(appBarRef.current, { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
  }, []);

  const scrollToSection = (page: string) => {
    setActivePage(page);
    setAnchorElNav(null);

    if (page === "Home") {
      gsap.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: "power3.inOut" });
      return;
    }

    const element = document.getElementById(page.toLowerCase());

    if (!element) {
      return;
    }

    gsap.to(window, {
      duration: 0.9,
      ease: "power3.inOut",
      scrollTo: { y: element, offsetY: 88 },
    });
  };

  return (
    <AppBar ref={appBarRef} position="fixed"
      sx={{
       background: scrolled ? "rgba(10, 10, 10, 0.98)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        boxShadow: scrolled ? "rgba(0, 0, 0, 0.3) 0px 4px 30px" : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        borderBottom: scrolled ? "1px solid rgba(245, 166, 35, 0.1)" : "1px solid transparent",
        zIndex: 1100,
        top: scrolled ? 0 : 12,
        left: 0,
        right: 0,
        color: "rgb(10, 10, 10)",
      }}
    >
      <Container
  maxWidth={false}
  disableGutters
  sx={{ px: 3 }}
>
        <Toolbar disableGutters sx={{ py: 1.8 }}>
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
            <Box
              sx={{
  bgcolor: "#f5a623",
  color: "#1a1a1a",
  fontWeight: 900,
  fontSize: "1.5rem",
  fontFamily: "'Playfair Display', serif",
  px: 1,
  py: 0.8,
  mr: 1,
  lineHeight: 1.5,
 // White border
  borderRadius: "6px",          // Rounded corners
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
}}
            >
              BC
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "2rem", color: "white", fontFamily: "'Playfair Display', serif" }}>
              Build<span style={{ color: "#f5a623", fontFamily: "'Playfair Display', serif" }}>Craft</span>
            </Typography>
          </Box>

          {/* Desktop Nav Links - centered, tighter gap */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center", gap: 0 }}>
  {pages.map((page) => (
    <Button
      key={page}
      onClick={() => scrollToSection(page)}
      sx={{
        fontFamily: "'Inter', sans-serif",
        color: page === activePage ? "white" : "#bbb",
        fontWeight: page === activePage ? 600 : 400,
        fontSize: "1.1rem",     // 0.95rem se barha diya
        textTransform: "none",
        borderBottom: page === activePage ? "2px solid #f5a623" : "2px solid transparent",
        borderRadius: 0,
        px: 1.5,                // 1 se barhaya
        mx: 1,                  // 0.3 se barhaya — yeh gap control karta hai
        pb: 0.5,
        minWidth: "auto",
        "&:hover": { color: "white", borderBottom: "2px solid #f5a623" },
      }}
    >
      {page}
    </Button>
  ))}
</Box>

          {/* Phone + CTA */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#ccc" }}>
              <PhoneIcon sx={{ fontSize: "1rem", color: "#f5a623" }} />
              <Typography sx={{ fontSize: "1.2rem" }}>+1 (555) 234-5678</Typography>
            </Box>
            <Button
              variant="contained"
              sx={{
    bgcolor: "#f5a623",
    color: "#1a1a1a",
    fontWeight: 700,
    fontSize: "1.3rem",
    fontFamily: "Inter, sans-serif",
    textTransform: "none",
    borderRadius: "8px",
    px: 4,
    py: 1.2,
    minHeight: "50px",
    border: "2px solid #d18c12",
    boxShadow: "0 4px 12px rgba(245, 166, 35, 0.3)",
    "&:hover": {
      bgcolor: "#e09400",
      borderColor: "#c98200",
      boxShadow: "0 6px 16px rgba(245, 166, 35, 0.4)",
    },
  }}
            >
              Get a Quote
            </Button>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <IconButton color="inherit" onClick={(e) => setAnchorElNav(e.currentTarget)}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={() => setAnchorElNav(null)}>
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={() => scrollToSection(page)}
                >
                  <Typography
                    sx={{
                      color: page === activePage ? "#f5a623" : "inherit",
                      fontWeight: page === activePage ? 600 : 400,
                    }}
                  >
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );   
}
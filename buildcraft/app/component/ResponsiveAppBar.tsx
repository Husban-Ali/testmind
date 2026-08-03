"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import PhoneIcon from "@mui/icons-material/Phone";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import gsap from "gsap";
import { scrollToSection } from "../utils/scrollToSection";

const pages = ["Home", "About", "Services", "Projects", "Testimonials", "Contact"];

export default function ResponsiveAppBar() {
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [activePage, setActivePage] = React.useState("Home");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const appBarRef = React.useRef<HTMLDivElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled = mounted && scrolled;

  React.useEffect(() => {
    if (!appBarRef.current) return;
    gsap.fromTo(appBarRef.current, { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
  }, []);

  // Animate overlay open/close
  React.useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    if (mobileOpen) {
      gsap.fromTo(el, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" });
      // stagger menu items
      gsap.fromTo(".mobile-nav-item", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.07, delay: 0.15, duration: 0.4, ease: "power3.out" });
    }
  }, [mobileOpen]);

  const handleNav = (page: string) => {
    setActivePage(page);
    if (mobileOpen) {
      const el = overlayRef.current;
      if (el) {
        gsap.to(el, { opacity: 0, y: -20, duration: 0.25, ease: "power3.in", onComplete: () => setMobileOpen(false) });
      } else {
        setMobileOpen(false);
      }
    }
    scrollToSection(page);
  };

  const closeMobile = () => {
    const el = overlayRef.current;
    if (el) {
      gsap.to(el, { opacity: 0, y: -20, duration: 0.25, ease: "power3.in", onComplete: () => setMobileOpen(false) });
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: "transparent",
          backdropFilter: "none",
          boxShadow: "none",
          borderBottom: "1px solid transparent",
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 1200,
          top: 12,
          ...(isScrolled && {
            background: "rgba(10,10,10,0.98)",
            backdropFilter: "blur(20px)",
            boxShadow: "rgba(0,0,0,0.3) 0px 4px 30px",
            borderBottom: "1px solid rgba(245,166,35,0.1)",
            top: 0,
          }),
        }}
      >
        <Container ref={appBarRef} maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
          <Toolbar disableGutters sx={{ py: 1.8 }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", mr: { xs: 0, md: 4 } }}>
              <Box
                sx={{
                  bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 900,
                  fontSize: { xs: "1.1rem", md: "1.5rem" },
                  fontFamily: "'Playfair Display', serif",
                  px: 1, py: 0.8, mr: 1, lineHeight: 1.5, borderRadius: "6px",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
              >
                BC
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.4rem", md: "2rem" }, color: "white", fontFamily: "'Playfair Display', serif" }}>
                Build<span style={{ color: "#f5a623" }}>Craft</span>
              </Typography>
            </Box>

            {/* Desktop Nav */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", lg: "flex" }, justifyContent: "center", gap: 0 }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => handleNav(page)}
                  sx={{
                    fontFamily: "'Inter', sans-serif",
                    color: page === activePage ? "white" : "#bbb",
                    fontWeight: page === activePage ? 600 : 400,
                    fontSize: "0.9rem", textTransform: "none",
                    borderBottom: page === activePage ? "2px solid #f5a623" : "2px solid transparent",
                    borderRadius: 0, px: 1.2, mx: 0.5, pb: 0.5, minWidth: "auto", whiteSpace: "nowrap",
                    "&:hover": { color: "white", borderBottom: "2px solid #f5a623" },
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            {/* Desktop Phone + CTA */}
            <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#ccc" }}>
                <PhoneIcon sx={{ fontSize: "0.9rem", color: "#f5a623" }} />
                <Typography sx={{ fontSize: "0.9rem", whiteSpace: "nowrap" }}>+1 (555) 234-5678</Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => handleNav("Contact")}
                sx={{
                  bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 700,
                  fontSize: "0.9rem", fontFamily: "Inter, sans-serif",
                  textTransform: "none", borderRadius: "8px", px: 2.5, py: 1,
                  whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(245,166,35,0.3)",
                  "&:hover": { bgcolor: "#e09400" },
                }}
              >
                Get a Quote
              </Button>
            </Box>

            {/* Mobile Hamburger */}
            <Box sx={{ display: { xs: "flex", lg: "none" }, ml: "auto" }}>
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: "#fff" }}>
                <MenuIcon sx={{ fontSize: 28, color: "#fff" }} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Full-screen Mobile Overlay */}
      {mobileOpen && (
        <Box
          ref={overlayRef}
          sx={{
            position: "fixed", inset: 0, zIndex: 1300,
            bgcolor: "#0a0a0a",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* Overlay Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, py: 2.5, borderBottom: "1px solid rgba(245,166,35,0.15)" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 900, fontSize: "1.1rem", fontFamily: "'Playfair Display', serif", px: 1, py: 0.8, mr: 1, borderRadius: "6px" }}>
                BC
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color: "white", fontFamily: "'Playfair Display', serif" }}>
                Build<span style={{ color: "#f5a623" }}>Craft</span>
              </Typography>
            </Box>
            <IconButton onClick={closeMobile} sx={{ color: "#fff" }}>
              <CloseIcon sx={{ fontSize: 28 }} />
            </IconButton>
          </Box>

          {/* Nav Items */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", px: 4, gap: 1 }}>
            {pages.map((page) => (
              <Box
                key={page}
                className="mobile-nav-item"
                onClick={() => handleNav(page)}
                sx={{
                  py: 2, borderBottom: "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                  "&:hover .nav-label": { color: "#f5a623" },
                  "&:hover .nav-arrow": { opacity: 1, transform: "translateX(0)" },
                }}
              >
                <Typography
                  className="nav-label"
                  sx={{
                    fontSize: "1.8rem", fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                    color: page === activePage ? "#f5a623" : "#fff",
                    transition: "color 0.2s",
                  }}
                >
                  {page}
                </Typography>
                <Box
                  className="nav-arrow"
                  sx={{
                    width: 36, height: 36, borderRadius: "50%",
                    bgcolor: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: page === activePage ? 1 : 0,
                    transform: page === activePage ? "translateX(0)" : "translateX(-8px)",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ color: "#f5a623", fontSize: "1rem", lineHeight: 1 }}>→</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Bottom CTA */}
          <Box sx={{ px: 4, pb: 5, pt: 3, borderTop: "1px solid rgba(245,166,35,0.15)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
              <PhoneIcon sx={{ color: "#f5a623", fontSize: "1rem" }} />
              <Typography sx={{ color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>+1 (555) 234-5678</Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNav("Contact")}
              sx={{
                bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 700,
                fontSize: "1rem", textTransform: "none", borderRadius: "10px", py: 1.6,
                boxShadow: "0 4px 20px rgba(245,166,35,0.35)",
                "&:hover": { bgcolor: "#e09400" },
              }}
            >
              Get a Free Quote
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
}

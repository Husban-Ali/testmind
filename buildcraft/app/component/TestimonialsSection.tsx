"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useRef } from "react";
import { useGsapReveal } from "../hooks/useGsapReveal";

const testimonials = [
  { name: "James Mitchell", role: "CEO, Mitchell Corp", text: "BuildCraft exceeded every expectation. Their attention to detail and commitment to quality is unmatched. Our commercial complex was delivered on time and within budget.", rating: 5 },
  { name: "Sarah Johnson", role: "Homeowner", text: "From the initial design consultation to the final walkthrough, the BuildCraft team was professional, communicative, and truly passionate about their work.", rating: 5 },
  { name: "Robert Chen", role: "Property Developer", text: "We have worked with many construction firms, but BuildCraft stands out for their innovative approach and exceptional craftsmanship. Highly recommended.", rating: 5 },
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useGsapReveal(sectionRef, {
    selector: "[data-gsap='testimonial-item']",
    stagger: 0.1,
    scrollTrigger: true,
  });

  return (
    <Box ref={sectionRef} sx={{ bgcolor: "#1a1a1a", py: 10 }} id="testimonials">
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Box data-gsap="testimonial-item" sx={{ width: 48, height: 3, bgcolor: "#f5a623", mx: "auto", mb: 2 }} />
          <Typography data-gsap="testimonial-item" sx={{ color: "#f5a623", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", mb: 1 }}>
            Client Reviews
          </Typography>
          <Typography data-gsap="testimonial-item" variant="h3" sx={{ fontWeight: 900, color: "white" }}>
            What Our Clients Say
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {testimonials.map((t, i) => (
            <Grid key={i} size={{ xs: 12, md: 4 }}>
              <Card data-gsap="testimonial-item" sx={{ bgcolor: "#2a2a2a", border: "1px solid #333", boxShadow: "none", height: "100%" }}>
                <CardContent sx={{ p: 4 }}>
                  <FormatQuoteIcon sx={{ color: "#f5a623", fontSize: "3rem", mb: 2 }} />
                  <Typography sx={{ color: "#ccc", lineHeight: 1.8, mb: 3 }}>{t.text}</Typography>
                  <Box sx={{ display: "flex", mb: 2 }}>
                    {Array(t.rating).fill(0).map((_, j) => (
                      <StarIcon key={j} sx={{ color: "#f5a623", fontSize: "1rem" }} />
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#f5a623", color: "#1a1a1a", fontWeight: 700 }}>
                      {t.name[0]}
                    </Avatar>
                    <Box>
                      <Typography sx={{ color: "white", fontWeight: 700 }}>{t.name}</Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.85rem" }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

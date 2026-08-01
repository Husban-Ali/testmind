import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const stats = [
  { value: "850+", label: "Projects Completed" },
  { value: "25+", label: "Years Experience" },
  { value: "200+", label: "Expert Team Members" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function StatsBar() {
  return (
    <Box sx={{ bgcolor: "#000000", py: 6 }}>
      <Container maxWidth="xl" disableGutters>
        <Grid container spacing={2}>
          {stats.map((s) => (
            <Grid key={s.label} size={{ xs: 6, md: 3 }} sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  color: "rgb(245, 166, 35)",
                  fontWeight: 900,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "1.3rem",
                  fontFamily: "'Inter', sans-serif",
                  mt: 0.5,
                  letterSpacing: '0.02em',
                  fontWeight: 500,
                }}
              >
                {s.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

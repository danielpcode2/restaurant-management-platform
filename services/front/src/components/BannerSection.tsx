import React from "react";
import { Box, Container, Typography } from "@mui/material";
import backgroundImage from "../assets/b1.jpg";

const BannerSection: React.FC = () => {
  return (
    <Box
      sx={{
        height: "60vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
      }}
    >
      <Container>
        <Typography variant="h3" gutterBottom>
          Bienvenido al sitio de reserva de restaurantes
        </Typography>
      </Container>
    </Box>
  );
};

export default BannerSection;

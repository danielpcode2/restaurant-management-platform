import React from "react";
import { Container, Box } from "@mui/material";
import RestaurantList from "./components/RestaurantList";
import BannerSection from "./components/BannerSection";

const App: React.FC = () => {
  return (
    <>
      <BannerSection />
      <Box
        sx={{
          py: 10,
        }}
      >
        <Container>
          <RestaurantList />
        </Container>
      </Box>
    </>
  );
};

export default App;

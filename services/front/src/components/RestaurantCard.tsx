import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Rating,
} from "@mui/material";
import ReserveModal from "./ReserveModal";

interface RestaurantCardProps {
  name: string;
  description: string;
  score: number;
  image: string;
  restaurantId: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  name,
  description,
  score,
  image,
  restaurantId,
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Card
        sx={{
          maxWidth: 345,
          margin: "0 auto",
          minHeight: "520px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={image}
          alt={name}
          onError={(e: any) => (e.target.src = "url_de_imagen_de_respaldo.jpg")}
        />
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="div" gutterBottom>
            {name}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {description.slice(0, 250)}...
          </Typography>
          <Box display="flex" alignItems="center">
            <Rating value={Number(score)} precision={0.1} readOnly />
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ marginLeft: 1 }}
            >
              {score}/5
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleOpen}
          >
            Reservar
          </Button>
        </CardContent>
      </Card>
      <ReserveModal
        open={open}
        onClose={handleClose}
        restaurantName={name}
        restaurantId={restaurantId}
      />
    </>
  );
};

export default RestaurantCard;

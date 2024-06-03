import React from "react";
import { Modal, Box, Typography, Button, Stack, Chip } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import dayjs from "dayjs";
dayjs().format();

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  bookingDetails: {
    bookingId: string;
    bookingDate: string;
    bookingTime: string;
    seating: number;
  };
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  bookingDetails,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          id="success-modal-title"
          variant="h6"
          component="h2"
          textAlign="center"
          fontWeight="bold"
        >
          Reserva Confirmada
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Chip
            icon={<EventIcon />}
            label={`Fecha: ${dayjs(bookingDetails.bookingDate).format(
              "DD/MM/YYYY"
            )}`}
            variant="outlined"
          />
          <Chip
            icon={<AccessTimeIcon />}
            label={`Hora: ${bookingDetails.bookingTime}`}
            variant="outlined"
          />
          <Chip
            icon={<PeopleIcon />}
            label={`Comensales: ${bookingDetails.seating}`}
            variant="outlined"
          />
          <Chip
            sx={{ fontWeight: "bold" }}
            label={`ID de Reserva: ${bookingDetails.bookingId
              .slice(-6)
              .toUpperCase()}`}
            variant="outlined"
          />
        </Stack>
        <Button
          variant="outlined"
          sx={{ mt: 4, display: "block", mx: "auto" }}
          onClick={onClose}
        >
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
};

export default SuccessModal;

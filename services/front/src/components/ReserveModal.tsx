import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  MobileStepper,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import SuccessModal from "./SuccessModal";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { SelectChangeEvent } from "@mui/material/Select";

interface ReserveModalProps {
  open: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantId: string;
}

const ReserveModal: React.FC<ReserveModalProps> = ({
  open,
  onClose,
  restaurantName,
  restaurantId,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [guests, setGuests] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [timesLoaded, setTimesLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: "",
    bookingDate: "",
    bookingTime: "",
    seating: 0,
  });

  const steps = [
    "Selecciona la fecha",
    "Selecciona la hora",
    "Selecciona el número de comensales",
  ];

  const resetModal = () => {
    setDate(null); // Limpia la fecha seleccionada
    setTime(undefined); // Limpia la hora seleccionada
    setGuests(1); // Restablece el número de comensales al valor por defecto
    setAvailableTimes([]); // Limpia los tiempos disponibles
    setErrorMessage(undefined); // Elimina cualquier mensaje de error
    setTimesLoaded(false); // Restablece la carga de tiempos disponibles
    setActiveStep(0); // Vuelve al primer paso de la modal
  };

  useEffect(() => {
    if (activeStep === 1 && date && !timesLoaded) {
      setLoading(true);
      fetch(
        `${
          process.env.REACT_APP_URL_API
        }/booking/${restaurantId}?bookingDate=${date.format(
          "YYYY-MM-DD"
        )}&seats=${guests}`
      )
        .then((response) => {
          if (response.status === 400) {
            throw new Error(
              "No hay disponibilidad para la reserva con las características seleccionadas."
            );
          }
          return response.json();
        })
        .then((data) => {
          setAvailableTimes(data);
          setLoading(false);
          setTimesLoaded(true);
          setActiveStep(2);
          setErrorMessage(undefined);
        })
        .catch((error) => {
          console.error("Error fetching available times:", error);
          setLoading(false);
          setErrorMessage(error.message);
        });
    }
  }, [activeStep, date, timesLoaded, restaurantId, guests]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleTime = (event: SelectChangeEvent<string>) => {
    setTime(event.target.value as string);
    setErrorMessage(undefined);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCancel = () => {
    resetModal();
    onClose();
  };

  const handleReserve = () => {
    const bookingData = {
      restaurantId: restaurantId,
      bookingDate: date?.format("YYYY-MM-DD"),
      bookingTime: time,
      seating: guests,
      customerEmail: "daniel@gmail.com",
    };

    setLoading(true);

    fetch(`${process.env.REACT_APP_URL_API}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    })
      .then((response) => {
        setLoading(false);
        if (!response.ok) {
          throw new Error("Failed to create booking");
        }
        return response.json();
      })
      .then((data) => {
        setBookingDetails({
          bookingId: data.bookingId,
          bookingDate: bookingData.bookingDate as string,
          bookingTime: bookingData.bookingTime as string,
          seating: bookingData.seating,
        });
        setShowSuccessModal(true);
        resetModal();
        onClose();
      })
      .catch((error) => {
        setErrorMessage(
          "No hay disponibilidad para la reserva con las características seleccionadas. Porfavor eliga otro horario."
        );
      });
  };

  const totalSteps = () => {
    return steps.length;
  };

  const isNextDisabled = () => {
    if (activeStep === 0 && !guests) return true;
    if ((activeStep === 1 && !date) || (activeStep === 1 && errorMessage))
      return true;
    if (activeStep === 2 && !time) return true;
    return false;
  };

  const today = dayjs();

  useEffect(() => {
    if (activeStep === 0) {
      setTimesLoaded(false);
    }
  }, [activeStep]);
  return (
    <>
      <Modal
        open={open}
        onClose={(event, reason) => {
          if (reason !== "backdropClick") {
            onClose();
          }
        }}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
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
            id="modal-title"
            variant="h6"
            component="h2"
            textAlign={"center"}
            fontWeight={"bold"}
            gutterBottom
          >
            Reserva en {restaurantName}
          </Typography>
          <Divider sx={{ m: "10px 10px" }} />
          <Grid container>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
                {guests >= 1 && (
                  <Chip
                    label={`Comensales: ${guests}`}
                    icon={<PeopleIcon />}
                    sx={{ p: 1 }}
                    variant="outlined"
                  />
                )}
                {date && (
                  <Chip
                    label={`Fecha: ${date.format("DD MMM YYYY")}`}
                    icon={<EventIcon />}
                    sx={{ p: 1 }}
                    variant="outlined"
                  />
                )}
                {time && (
                  <Chip
                    label={`Hora: ${time}`}
                    icon={<AccessTimeIcon />}
                    sx={{ p: 1 }}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Grid>
          </Grid>

          {!loading && (
            <Typography
              variant="subtitle1"
              display="block"
              gutterBottom
              sx={{
                mt: 2,
                mb: 4,
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                p: 1,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                textAlign: "center",
                color: "#333",
              }}
            >
              {activeStep === 0 &&
                "Indique el número de comensales que asistirán."}
              {activeStep === 1 && "Seleccione la fecha para su reserva."}
              {activeStep === 2 &&
                "Seleccione la hora a la que desea hacer la reserva."}
            </Typography>
          )}

          {activeStep === 0 && (
            <TextField
              label="Número de comensales"
              select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              fullWidth
            >
              {[1, 2, 3, 4, 5, 6].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          )}

          {activeStep === 1 && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Fecha"
                value={date}
                onChange={(newDate) => {
                  setDate(newDate);
                  setTimesLoaded(false);
                }}
                shouldDisableDate={(day) => day.isBefore(today, "day")}
                sx={{ width: "100%" }}
              />
            </LocalizationProvider>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {activeStep === 2 && !loading && (
            <FormControl fullWidth>
              <InputLabel>Hora</InputLabel>
              <Select value={time} onChange={handleTime} label="Hora">
                {availableTimes.map((availableTime) => (
                  <MenuItem key={availableTime} value={availableTime}>
                    {availableTime}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {errorMessage && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
              <Typography color="error" textAlign="center">
                {errorMessage}
              </Typography>
            </Box>
          )}
          <MobileStepper
            variant="dots"
            steps={totalSteps()}
            position="static"
            activeStep={activeStep}
            nextButton={
              activeStep === steps.length - 1 ? (
                <></>
              ) : (
                <Button
                  size="small"
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                >
                  Siguiente
                  <KeyboardArrowRight />
                </Button>
              )
            }
            backButton={
              <Button
                size="small"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
                Atrás
              </Button>
            }
          />
          <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
            {activeStep === steps.length - 1 && !errorMessage && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleReserve}
                disabled={isNextDisabled()}
                startIcon={<CheckIcon />}
              >
                Reservar
              </Button>
            )}
          </Box>
        </Box>
      </Modal>
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingDetails={bookingDetails}
      />
    </>
  );
};

export default ReserveModal;

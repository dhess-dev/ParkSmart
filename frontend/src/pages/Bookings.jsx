import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Typography,
  Grid,
  ButtonBase,
  Tooltip,
} from "@mui/material";

const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState("");

  useEffect(() => {
    fetch(`${apiUrl}/api/bookings`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setBookings)
      .catch((err) => console.error("Failed to fetch bookings:", err));
  }, []);

  const handleQrCodeClick = (qrCodeUrl) => {
    setSelectedQrCode(qrCodeUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedQrCode("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #001F3F, #003366)",
        color: "white",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom fontSize={"2.2em"}>
          Meine Buchungen
        </Typography>

        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} sm={6} md={4} key={booking.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  color: "white",
                  position: "relative",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor:
                      new Date(booking.endTime) < new Date() ? "red" : "green",
                  }}
                ></div>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  fontSize={"1.4em"}
                  textAlign={"center"}
                >
                  Typ: {booking.type}
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  fontSize={"1.3em"}
                  textAlign={"center"}
                  sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <strong>Start:</strong>{" "}
                  {new Date(booking.startTime).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  fontSize={"1.3em"}
                  textAlign={"center"}
                  sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <strong>Ende:</strong>{" "}
                  {new Date(booking.endTime).toLocaleString()}
                </Typography>

                <Tooltip
                  title={
                    new Date(booking.endTime) < new Date()
                      ? "QR Code ist abgelaufen"
                      : "QR ist gültig"
                  }
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        fontSize: "1.2em",
                        bgcolor: "common.black",
                        "& .MuiTooltip-arrow": {
                          color: "common.black",
                        },
                      },
                    },
                  }}
                >
                  <ButtonBase
                    onClick={() =>
                      handleQrCodeClick(
                        `${apiUrl}/api/bookings/qrcode/${booking.qrCodeContent}`
                      )
                    }
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow:
                        "0 4px 8px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.3s ease",
                      "&:hover": {
                        boxShadow:
                          "0 8px 16px rgba(25, 118, 210, 0.5), 0 4px 8px rgba(25, 118, 210, 0.3)",
                      },
                      width: 150,
                      height: 150,
                      display: "block",
                      margin: "16px auto",
                    }}
                  >
                    <img
                      src={`${apiUrl}/api/bookings/qrcode/${booking.qrCodeContent}`}
                      alt="QR Code"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        userSelect: "none",
                      }}
                      draggable={false}
                    />
                  </ButtonBase>
                </Tooltip>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: "rgba(0, 31, 63, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <DialogTitle sx={{ textAlign: "center", fontSize: "1.6em" }}>
            QR-Code
          </DialogTitle>
          <DialogContent sx={{ textAlign: "center" }}>
            <img
              src={selectedQrCode}
              alt="QR-Code"
              style={{ width: "100%", maxWidth: "400px", height: "auto" }}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
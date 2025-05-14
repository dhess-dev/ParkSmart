import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

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
    <div>
      <h2>My Bookings</h2>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            <p>
              <strong>Type:</strong> {booking.type}
            </p>
            <p>
              <strong>Start:</strong>{" "}
              {new Date(booking.startTime).toLocaleString()}
            </p>
            <p>
              <strong>End:</strong> {new Date(booking.endTime).toLocaleString()}
            </p>
            <img
              src={`${apiUrl}/api/bookings/qrcode/${booking.qrCodeContent}`}
              alt="QR Code"
              style={{ width: "150px", height: "150px", cursor: "pointer" }}
              onClick={() =>
                handleQrCodeClick(
                  `${apiUrl}/api/bookings/qrcode/${booking.qrCodeContent}`
                )
              }
            />
          </li>
        ))}
      </ul>

    
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent style={{ textAlign: "center" }}>
          <img
            src={selectedQrCode}
            alt="QR Code"
            style={{ width: "100%", maxWidth: "400px", height: "auto" }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

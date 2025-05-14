import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`${apiUrl}/api/bookings`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setBookings)
      .catch((err) => console.error("Failed to fetch bookings:", err));
  }, []);

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
              style={{ width: "150px", height: "150px" }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

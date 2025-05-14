import { useState, useEffect } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "/vite.svg";

export default function Dashboard() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("...loading");
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

  useEffect(() => {
    fetch(`${apiUrl}/api/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("Error: " + err.message));
  }, []);

  useEffect(() => {
    if (count !== 0) {
      fetch("http://localhost:8080/api/mqtt");
    }
  }, [count]);

  const createBooking = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({
          type: "time-limited", // Example type
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`Booking created! QR Code: ${data.qrCodeContent}`);
      } else {
        setMessage("Failed to create booking.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setMessage("An error occurred.");
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h1>Hello from Spring: {message}</h1>

      <div>
        <button onClick={() => setCount((c) => c + 1)}>count is {count}</button>
      </div>

      <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
        <div>
          <h2>Users</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.username} ({user.email})
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Cards</h2>
          <ul>
            {cards.map((card) => (
              <li key={card.id}>Card Code: {card.cardCode}</li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2>Dashboard</h2>
        <button onClick={createBooking}>Create Booking</button>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}

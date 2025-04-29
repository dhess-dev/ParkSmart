import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("...loading");
  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch(`${apiUrl}/api/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("Error: " + err.message));
  }, [apiUrl]);

  useEffect(() => {
    if (count !== 0) {
      fetch(`${apiUrl}/api/mqtt`).catch((err) =>
        console.error("Failed to trigger MQTT action:", err)
      );
    }
  }, [count, apiUrl]);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersResponse = await fetch(`${apiUrl}/api/users`);
        const cardsResponse = await fetch(`${apiUrl}/api/cards`);

        const usersData = await usersResponse.json();
        const cardsData = await cardsResponse.json();

        console.log("Fetched users:", usersData);
        console.log("Fetched cards:", cardsData);

        setUsers(usersData);
        setCards(cardsData);
      } catch (error) {
        console.error("Failed to fetch users or cards", error);
      }
    }

    fetchData();
  }, [apiUrl]);

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
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
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

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

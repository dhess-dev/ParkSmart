import { useState, useEffect } from "react";
import { BarChart, Gauge, LineChart } from "@mui/x-charts";

export default function Dashboard() {
  const [freeParkingSpotsCount, setFreeParkingSpotsCount] = useState([]);
  const [parkingCount, setParkingCount] = useState([]);
  const [freeParkingSpotsHistory, setFreeParkingSpotsHistory] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";

  useEffect(() => {
    async function fetchInitialData() {
      const response = await fetch(`${apiUrl}/api/parkingCount`);
      if (!response.ok) throw new Error("Failed to fetch initial data");
      const initialData = await response.json();
      console.log("test", initialData);
      const parkingCountObj = initialData.map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("de-DE"),
        parkingCount: entry.carsInParking,
      }));
      setParkingCount(parkingCountObj);
    }

    fetchInitialData();

    const eventSource = new EventSource(`${apiUrl}/api/parkingCount/stream`);
    eventSource.onopen = () => console.log("SSE connection opened for parkingCount");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE data", data);
        const parkingCountObj = data.map((entry) => ({
          date: new Date(entry.date).toLocaleDateString("de-DE"),
          parkingCount: entry.carsInParking,
        }));
        setParkingCount(parkingCountObj);
      } catch (err) {
        console.error("Error parsing SSE data for parking count", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
  const getDateOnly = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const processParkingData = (data) => {
    const today = getDateOnly(new Date());

    const filteredToday = data
      .map((entry) => ({
        time: new Date(entry.timestamp),
        value: entry.freeSpots,
      }))
      .filter((entry) => getDateOnly(entry.time).getTime() === today.getTime());

    return filteredToday
      .sort((a, b) => b.time - a.time)
      .slice(0, 40)
      .sort((a, b) => a.time - b.time);
  };

  async function fetchInitialData() {
    try {
      const response = await fetch(`${apiUrl}/api/parkingStatus`);
      if (!response.ok) throw new Error("Failed to fetch initial data");
      const initialData = await response.json();

      setFreeParkingSpotsCount(initialData);
      setFreeParkingSpotsHistory(processParkingData(initialData));
    } catch (err) {
      console.error("Error fetching initial data for parking status", err);
    }
  }

  fetchInitialData();

  const eventSource = new EventSource(`${apiUrl}/api/parkingStatus/stream`);
  eventSource.onopen = () => console.log("SSE connection opened for parkingStatus");

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("parkingStatus SSE data", data);

      const parsed = Array.isArray(data) ? data : [data];

      setFreeParkingSpotsCount(parsed);
      setFreeParkingSpotsHistory(processParkingData(parsed));
    } catch (err) {
      console.error("Error parsing SSE data", err);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE error", err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}, []);

  return (
    <>
      <div>
        <Gauge
          width={300}
          height={300}
          value={
            freeParkingSpotsCount && freeParkingSpotsCount.length > 0
              ? freeParkingSpotsCount[freeParkingSpotsCount.length - 1].freeSpots
              : 0
          }
          valueMin={0}
          valueMax={10}
          startAngle={-90}
          endAngle={90}
        />

        <LineChart
          height={300}
          xAxis={[
            {
              data: freeParkingSpotsHistory.map((d) => d.time),
              scaleType: "time",
              label: "Zeit",
            },
          ]}
          yAxis={[
            {
              label: "Freie Parkplätze",
              tickMinStep: 1,
              min: 0,
            },
          ]}
          series={[
            {
              data: freeParkingSpotsHistory.map((d) => d.value),
              label: "Freie Parkplätze",
            },
          ]}
        />
        <BarChart
          dataset={parkingCount}
          xAxis={[
            {
              dataKey: "date",
              scaleType: "band",
              label: "Datum",
            }
          ]}
          series={[
            {
              dataKey: "parkingCount",
              label: "Anzahl Fahrzeuge",
            }
          ]}
          height={300}
        />
      </div>
    </>
  );
}
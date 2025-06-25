import {useState, useEffect} from "react";
import {BarChart, Gauge, LineChart, gaugeClasses} from "@mui/x-charts";
import {Box, Container, Grid, Paper, Typography} from "@mui/material";

export default function Dashboard() {
    const [parkingCount, setParkingCount] = useState([]);
    const [freeParkingSpotsHistory, setFreeParkingSpotsHistory] = useState([]);
    const [gaugeValue, setGaugeValue] = useState(0);
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

                setFreeParkingSpotsHistory(processParkingData(initialData));
                setGaugeValue(initialData && initialData.length > 0
                    ? initialData[initialData.length - 1].freeSpots
                    : 0)
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

                setFreeParkingSpotsHistory(processParkingData(parsed));
                setGaugeValue(parsed && parsed.length > 0
                    ? parsed[parsed.length - 1].freeSpots
                    : 0)
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
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(to bottom, #001F3F, #003366)",
                color: "white",
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                height: 413,
                                backgroundColor: "rgba(255, 255, 255, 0.05)", // subtle transparent white
                                backdropFilter: "blur(10px)",                // frosted glass effect
                                border: "1px solid rgba(255, 255, 255, 0.1)", // soft border for contrast
                                borderRadius: 3,
                                color: "white",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-start",
                                alignItems: "center",

                                // Chart specific overrides
                                "& .MuiChartsLegend-label": { color: "white" },
                                "& .MuiChartsAxis-tickLabel tspan": { fill: "white" },
                                "& .MuiChartsAxis-bottom .MuiChartsAxis-label": {
                                    fill: "white",
                                },
                                "& .MuiChartsAxis-left .MuiChartsAxis-label": {
                                    fill: "white",
                                },
                                "& .MuiChartsAxis-line": {
                                    stroke: "rgba(255,255,255,0.3)",
                                },
                            }}
                        >

                        <Typography variant="h6" gutterBottom fontSize={"1.7em"}>
                                Freie Parkplätze
                            </Typography>
                            <Gauge
                                width={340}
                                height={250}
                                value={gaugeValue}
                                valueMin={0}
                                valueMax={4}
                                startAngle={-90}
                                endAngle={90}
                                sx={(theme) => ({
                                    [`& .${gaugeClasses.valueText}`]: {
                                        fontSize: 40,
                                    },
                                    "& text": {
                                        fill: "#FFFFFF",
                                    },
                                    [`& .${gaugeClasses.valueArc}`]: {
                                        fill: gaugeValue > 0 ? "#2196f3" : "transparent",
                                    },
                                    [`& .${gaugeClasses.referenceArc}`]: {
                                        fill: gaugeValue === 0 ? "#f44336" : theme.palette.text.disabled,
                                    },
                                })}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6} lg={8}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                height: 413,
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: 3,
                                color: "white",

                                // Chart styling
                                "& .MuiChartsLegend-label": { color: "white", fontSize: "1.6em" },
                                "& .MuiChartsAxis-tickLabel tspan": { fill: "white", fontSize: "1.3em" },
                                "& .MuiChartsAxis-bottom .MuiChartsAxis-label": {
                                    fill: "white",
                                },
                                "& .MuiChartsAxis-left .MuiChartsAxis-label": {
                                    fill: "white",
                                },
                                "& .MuiChartsAxis-line": {
                                    stroke: "rgba(255,255,255,0.3)",
                                },
                                "& .MuiChartsTooltip-root": {
                                    color: "black", // Optional: tooltip text
                                },
                            }}
                        >
                            <Typography
                                align="center"
                                variant="h6"
                                gutterBottom
                                fontSize={"1.7em"}
                            >
                                Historie der freien Parkplätze
                            </Typography>
                            <LineChart
                                height={300}
                                xAxis={[
                                    {
                                        data: freeParkingSpotsHistory.map((d) => d.time),
                                        scaleType: "time",
                                        label: "Zeit",
                                        labelStyle: { fontSize: "1.0em" },
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
                                        color: "#2196f3",
                                    },
                                ]}
                                slotProps={{
                                    noDataOverlay: {
                                        sx: {
                                            fontSize: "1.2em",
                                            color: "white",
                                        },
                                    },
                                }}
                            />
                        </Paper>

                    </Grid>

                    <Grid item xs={12}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                width: "100%",
                                backgroundColor: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: 3,
                                color: "white",

                                "& .MuiChartsLegend-label": { color: "white", fontSize: "1.6em" },
                                "& .MuiChartsAxis-tickLabel tspan": { fill: "white", fontSize: "1.3em" },
                                "& .MuiChartsAxis-bottom .MuiChartsAxis-label": {
                                    fill: "white",
                                },
                                "& .MuiChartsAxis-left .MuiChartsAxis-label": {
                                    fill: "white",
                                },
                                "& .MuiChartsAxis-line": {
                                    stroke: "rgba(255,255,255,0.3)",
                                },
                            }}
                        >

                        <Typography align="center" variant="h6" gutterBottom fontSize={"1.7em"}>
                                Anzahl der Besucher in den
                                letzten {parkingCount.length > 0 ? parkingCount.length : "0"} {parkingCount.length === 1 ? "Tag" : "Tagen"}
                            </Typography>

                            <Box sx={{ overflowX: "auto" }}>
                            <BarChart
                                dataset={parkingCount}
                                xAxis={[
                                    {
                                        dataKey: "date",
                                        scaleType: "band",
                                        label: "Datum",
                                        labelStyle: {fontSize: "1.0em"},
                                        sx: {"& .MuiChartsAxis-tickLabel tspan": {fontSize: "1.6em"}},
                                    },
                                ]}
                                series={[
                                    {
                                        dataKey: "parkingCount",
                                        label: "Anzahl Fahrzeuge",
                                        color: "#2196f3",
                                    },
                                ]}
                                height={300}
                                slotProps={{
                                    noDataOverlay: {
                                        sx: {
                                            fontSize: "1.2rem",
                                        },
                                    },
                                }}
                                sx={{
                                    "& .MuiChartsLegend-label": {
                                        fontSize: "1.6em",
                                    }, "& .MuiChartsAxis-tickLabel tspan": {fontSize: "1.3em"},
                                    "& .MuiChartsAxis-bottom .MuiChartsAxis-label": {
                                        transform: "translateY(3%)",
                                    },
                                }}
                            />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
            );
            }
import {useEffect, useState, useCallback} from "react";
import {
    Box,
    Paper,
    Typography,
    useTheme,
    Divider,
    Container, Button,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import {grey, green} from "@mui/material/colors";
import logo from "/parksmart_logo.png"; // Place this in /public or handle import if using asset bundling

function useParkingSpots(apiUrl) {
    const [spots, setSpots] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/parkingSpot`);
                if (!res.ok) throw new Error("Failed to fetch spots");
                const data = await res.json();
                if (!cancelled) {
                    setSpots(data);
                    setLastUpdate(new Date());
                }
            } catch (err) {
                if (!cancelled) console.error("Initial fetch failed:", err);
            }
        };

        load();
        return () => (cancelled = true);
    }, [apiUrl]);

    useEffect(() => {
        const es = new EventSource(`${apiUrl}/api/parkingSpot/stream`);
        es.onmessage = (ev) => {
            try {
                setSpots(JSON.parse(ev.data));
                setLastUpdate(new Date());
            } catch (err) {
                console.error("Invalid SSE data:", err);
            }
        };
        es.onerror = (err) => {
            console.error("SSE error", err);
            es.close();
        };

        return () => es.close();
    }, [apiUrl]);

    return {spots, lastUpdate};
}

function SpotCell({occupied, borderRight, theme}) {
    const bgColor = occupied ? grey[800] : green[400];
    const carColor = theme.palette.common.white;

    return (
        <Paper
            elevation={4}
            sx={{
                borderRight,
                backgroundColor: bgColor,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease-in-out",
                '&:hover': {
                    transform: "scale(1.03)",
                },
                borderRadius: 2,
            }}
        >
            {occupied ? (
                <DirectionsCarIcon sx={{fontSize: 40, color: carColor}}/>
            ) : (
                <Typography variant="subtitle1" color="white">
                    <strong>
                        Frei
                    </strong>
                </Typography>
            )}
        </Paper>
    );
}

function SpotLabel({label, borderRight}) {
    return (
        <Typography
            sx={{
                borderRight,
                textAlign: "center",
                pt: 1,
            }}
            variant="body2"
        >
            {label}
        </Typography>
    );
}

export default function Dashboard() {
    const apiUrl = import.meta.env.VITE_API_URL || "https://localhost:8443";
    const theme = useTheme();
    const {spots, lastUpdate} = useParkingSpots(apiUrl);

    const getRow = useCallback(
        (letter) =>
            spots
                .filter((s) => s.position.startsWith(letter))
                .sort((a, b) =>
                    a.position.localeCompare(b.position, undefined, {numeric: true})
                ),
        [spots]
    );

    const rows = [
        {key: "A", spots: getRow("A")},
        {key: "B", spots: getRow("B")},
    ];

    const makeBorder = (i, length) =>
        i < length - 1 ? `2px dashed ${theme.palette.divider}` : undefined;

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
                {/* Header */}
                <Box textAlign="center" mb={4}>
                    <img
                        src={logo}
                        alt="ParkSmart Logo"
                        style={{
                            width: 300,
                            maxWidth: "30%",
                            marginBottom: 2,
                            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
                        }}
                    />

                    <Typography variant="h4">
                        Stressfrei starten, <strong>smart parken!</strong>
                    </Typography>
                </Box>

                <Box textAlign="center" mb={2}>

                <Typography  alignItems={"center"} variant="h4">
                        Aktuelle Parkplatzübersicht
                    </Typography>
                </Box>


                <Divider sx={{mb: 4, bgcolor: "white"}}/>

                {/* Grid */}
                <Box
                    display="grid"
                    gridTemplateColumns={`repeat(${rows[0].spots.length}, 1fr)`}
                    gridAutoRows="auto"
                    sx={{width: "100%", rowGap: 1}}
                >
                    {rows.map(({key, spots}, rowIndex) => (
                        <Box key={key} sx={{display: "contents"}}>
                            {spots.map((spot, i) => (
                                <SpotCell
                                    key={spot.id}
                                    occupied={spot.occupied}
                                    borderRight={makeBorder(i, spots.length)}
                                    theme={theme}
                                />
                            ))}

                            {spots.map((spot, i) => (
                                <SpotLabel
                                    key={spot.id}
                                    label={spot.position}
                                    borderRight={makeBorder(i, spots.length)}
                                />
                            ))}

                            {rowIndex === 0 && (
                                <Box
                                    gridColumn={`1 / span ${spots.length}`}
                                    sx={{
                                        borderBottom: `2px solid ${theme.palette.divider}`,
                                        height: 0,
                                    }}
                                />
                            )}
                        </Box>
                    ))}
                </Box>


                <Box
                    mb={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={4}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box width={20} height={20} bgcolor={grey[800]}/>
                        <Typography variant="body2">Belegt</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Box width={20} height={20} bgcolor={green[400]}/>
                        <Typography variant="body2">Frei</Typography>
                    </Box>

                </Box>
                {/* Timestamp */}
                <Box mt={4} textAlign="center">
                    <Typography variant="caption">
                        Zuletzt aktualisiert am:{" "}
                        {lastUpdate
                            ? lastUpdate.toLocaleTimeString()
                            : "Loading..."}
                    </Typography>
                </Box>

                <Divider sx={{mb: 4, bgcolor: "white"}}/>

                {/* Call to Action */}
                <Box mt={5} textAlign="center">
                    <Typography variant="h6" mb={2}>
                        Zugang zum Parkplatz erhalten?
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        href="/register"
                    >
                        Jetzt registrieren & Zugang sichern
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}

import {useEffect, useState, useCallback} from "react";
import {Box, Paper, Typography, useTheme} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import {grey, green} from "@mui/material/colors";

function useParkingSpots(apiUrl) {
    const [spots, setSpots] = useState([]);

    // first fetch
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/parkingSpot`);
                if (!res.ok) throw new Error("Failed to fetch spots");
                if (!cancelled) setSpots(await res.json());
            } catch (err) {
                if (!cancelled) console.error("Initial fetch failed:", err);
            }
        };

        load();
        return () => (cancelled = true); // abort if the component unmounts
    }, [apiUrl]);

    // SSE subscription
    useEffect(() => {
        const es = new EventSource(`${apiUrl}/api/parkingSpot/stream`);

        es.onmessage = (ev) => {
            try {
                setSpots(JSON.parse(ev.data));
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

    return spots;
}



function SpotCell({occupied, borderRight, theme}) {
    return (
        <Paper
            elevation={3}
            sx={{
                borderRight,
                backgroundColor: occupied ? grey[800] : green[200],
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {occupied && (
                <DirectionsCarIcon
                    sx={{fontSize: 40, color: theme.palette.common.white}}
                />
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
    const spots = useParkingSpots(apiUrl, 5000);

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
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Parking Dashboard
            </Typography>

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
        </Box>
    );
}

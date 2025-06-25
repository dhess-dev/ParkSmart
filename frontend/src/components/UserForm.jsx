import { useMemo, useState } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Grid,
    TextField,
    Button,
} from "@mui/material";

export default function UserForm({
                                     initialValues,
                                     fieldsConfig,
                                     onSubmit,
                                     submitText = "Submit",
                                     loading = false,
                                 }) {
    const [values, setValues] = useState(initialValues);
    const [touched, setTouched] = useState({});

    const isFormValid = useMemo(() => {
        return fieldsConfig.every(({ name, required }) => {
            if (!required) return true;
            const v = (values[name] ?? "").toString().trim();
            return v.length > 0;
        });
    }, [values, fieldsConfig]);

    const handleChange = (name) => (e) =>
        setValues((v) => ({ ...v, [name]: e.target.value }));

    const handleBlur   = (name) => () =>
        setTouched((t) => ({ ...t, [name]: true }));

    const handleSubmit = () => onSubmit(values);

    return (
        <Card
            sx={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 3,
                color: "white",
            }}
        >
            <CardHeader title={submitText} sx={{ color: "white" }} />
            <CardContent>
                <Grid container spacing={2}>
                    {fieldsConfig.map(
                        ({ name, label, xs, disabled, required, type = "text" }) => (
                            <Grid item xs={xs} key={name}>
                                <TextField
                                    fullWidth
                                    label={label}
                                    value={values[name] || ""}
                                    onChange={handleChange(name)}
                                    onBlur={handleBlur(name)}
                                    disabled={!!disabled}
                                    required={!!required}
                                    type={type}
                                    /* show error only *after* the user touched the field */
                                    error={
                                        touched[name] &&
                                        required &&
                                        !values[name]?.toString().trim()
                                    }
                                    InputLabelProps={{
                                        style: {
                                            color: "white",
                                            fontSize: "1.2rem", // label font size
                                        },
                                    }}
                                    InputProps={{
                                        style: {
                                            color: "white",
                                            fontSize: "1.3rem", // input text font size
                                        },
                                    }}
                                />
                            </Grid>
                        )
                    )}
                </Grid>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!isFormValid || loading}
                >
                    {loading ? "Saving…" : submitText}
                </Button>
            </CardActions>
        </Card>
    );
}

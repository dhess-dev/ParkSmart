import {useMemo, useState} from "react";
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

    const isFormValid = useMemo(() => {
        return fieldsConfig.every(({name, required}) => {
            if (!required) return true;
            const v = (values[name] ?? "").toString().trim();
            return v.length > 0;
        });
    }, [values, fieldsConfig]);

    const handleChange = (name) => (e) =>
        setValues((v) => ({...v, [name]: e.target.value}));

    const handleSubmit = () => onSubmit(values);

    return (
        <Card>
            <CardHeader title={submitText}/>
            <CardContent>
                <Grid container spacing={2}>
                    {fieldsConfig.map(({name, label, xs, disabled, required}) => (
                        <Grid item xs={xs} key={name}>
                            <TextField
                                fullWidth
                                label={label}
                                value={values[name] || ""}
                                onChange={handleChange(name)}
                                disabled={!!disabled}
                                required={!!required}
                                error={required && !values[name]?.toString().trim()}
                            />
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
            <CardActions sx={{justifyContent: "flex-end", p: 2}}>
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

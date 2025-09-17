import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { AuthActionStates } from "./auth-card";

interface ForgotPasswordCardProps {
	changeState: (state: AuthActionStates) => void;
}

export const ForgotPasswordCard = ({ changeState }: ForgotPasswordCardProps) => {
	const [email, setEmail] = useState<string>("");
	const [error, setError] = useState<string>("");

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");
	}

	return (
		<Box
			component="form"
			onSubmit={onSubmit}
			noValidate
			sx={{ height: "100%", alignContent: "center" }}
		>
			<IconButton onClick={() => changeState("signin")} sx={{ position: "absolute", top: 0 }}>
				<ArrowBackIcon />
			</IconButton>
			<Stack spacing={2} alignItems="stretch">
				<Typography variant="h5" fontWeight={700} textAlign="center">
					Forgot Password
				</Typography>

				<TextField
					label="Email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					fullWidth
					size="small"
					autoComplete="email"
					required
				/>

				{error && (
					<Typography color="error" variant="body2">
						{error}
					</Typography>
				)}

				<Button type="submit" variant="contained" color="primary">
					Send Password Recovery Email
				</Button>
			</Stack>
		</Box>
	);
};

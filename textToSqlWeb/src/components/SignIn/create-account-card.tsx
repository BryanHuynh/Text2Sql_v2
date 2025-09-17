import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState, type FormEvent } from "react";
import { emailSignUp, googleSignIn } from "../services/firebase/auth/AuthApi";
import { FirebaseError } from "firebase/app";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { AuthActionStates } from "./auth-card";

interface CreateAccountCardProps {
	changeState: (state: AuthActionStates) => void;
	toastMessage: (message: string) => void;
}

export const CreateAccountCard = ({ changeState, toastMessage }: CreateAccountCardProps) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [passwordConfirm, setPasswordConfirm] = useState<string>("");
	const [error, setError] = useState<string>("");

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError("");
		if (!email) {
			setError("Please Provide an Email");
			return;
		}
		if (!password) {
			setError("Please Provide a password");
			return;
		}
		if (password != passwordConfirm) {
			setError("Passwords do not match");
			return;
		}

		try {
			const res = await emailSignUp(email, password);
			changeState("signin");
			toastMessage(res);
		} catch (error) {
			if (error instanceof FirebaseError) {
				setError(error.code ?? "Failed to create account");
				return;
			}
			setError("Failed to create account");
			return;
		}
	}

	return (
		<Box
			component="form"
			onSubmit={onSubmit}
			noValidate
			sx={{ height: "100%" }}
			alignContent={"center"}
		>
			<IconButton onClick={() => changeState("signin")} sx={{ position: "absolute", top: 0 }}>
				<ArrowBackIcon />
			</IconButton>
			<Stack spacing={2} alignItems="stretch">
				<Typography variant="h5" fontWeight={700} textAlign="center">
					Create Account
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

				<TextField
					label="Password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					fullWidth
					size="small"
					autoComplete="new-password"
					required
				/>

				<TextField
					label="Confirm Password"
					type="password"
					value={passwordConfirm}
					onChange={(e) => setPasswordConfirm(e.target.value)}
					fullWidth
					size="small"
					autoComplete="new-password"
					required
				/>

				{error && (
					<Typography color="error" variant="body2">
						{error}
					</Typography>
				)}

				<Button type="submit" variant="contained" color="primary">
					Create Account
				</Button>

				<Button
					variant="outlined"
					color="inherit"
					startIcon={<GoogleIcon />}
					onClick={() => {
						setError("");
						googleSignIn().catch((e) =>
							setError(e?.message ?? "Google sign-in failed")
						);
					}}
				>
					Continue with Google
				</Button>
			</Stack>
		</Box>
	);
};

import { useState, type FormEvent } from "react";
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import type { AuthActionStates } from "./auth-card";
import { emailSignIn, googleSignIn } from "../../services/firebase/auth/AuthApi";

interface SignInCardProps {
	changeState: (state: AuthActionStates) => void;
}
export const SignInCard = ({ changeState }: SignInCardProps) => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const userCred = await emailSignIn(email, password);
			if (userCred.user.emailVerified) {
				navigate("/dashboard");
			} else {
				setError("Email is not verified");
			}
		} catch (err) {
			if (err instanceof FirebaseError) {
				setError(err.message ?? "Failed to sign in");
			} else {
				setError("Failed to sign in");
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<Box
			component="form"
			onSubmit={onSubmit}
			noValidate
			sx={{ height: "100%", alignContent: "center" }}
		>
			<Stack spacing={2} alignItems="stretch">
				<Typography variant="h5" fontWeight={700} textAlign="center">
					Sign In
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
					autoComplete="current-password"
					required
				/>

				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<FormControlLabel
						control={
							<Checkbox
								checked={remember}
								onChange={(e) => setRemember(e.target.checked)}
								size="small"
							/>
						}
						label="Remember me"
					/>
					<Button color="primary" onClick={() => changeState("forgot_password")}>
						Forgot password?
					</Button>
				</Stack>

				{error && (
					<Typography color="error" variant="body2">
						{error}
					</Typography>
				)}

				<Button type="submit" variant="contained" color="primary" disabled={loading}>
					{loading ? "Signing in..." : "Sign In"}
				</Button>

				<Button
					variant="outlined"
					color="inherit"
					startIcon={<GoogleIcon />}
					onClick={() => {
						setError(null);
						googleSignIn().catch((e) =>
							setError(e?.message ?? "Google sign-in failed")
						);
					}}
				>
					Sign in with Google
				</Button>

				<Typography variant="body2" textAlign="center">
					Don't have an account?
					<Button
						onClick={() => {
							changeState("signup");
						}}
					>
						Create one
					</Button>
				</Typography>
			</Stack>
		</Box>
	);
};

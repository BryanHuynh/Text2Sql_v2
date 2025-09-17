import { useEffect, useState, type SyntheticEvent } from "react";
import { SignInCard } from "./sign-in-card";
import { ForgotPasswordCard } from "./forgot-password-card";
import { CreateAccountCard } from "./create-account-card";
import { Snackbar, type SnackbarCloseReason } from "@mui/material";

export type AuthActionStates = "signin" | "forgot_password" | "signup";
export const AuthCard = () => {
	const [authActionState, setAuthActionState] = useState<AuthActionStates>("signin");
	const [toastMessage, setToastMessage] = useState<string>("");
	const [toastOpen, setToastOpen] = useState<boolean>(false);
	const handleToastClose = (
		_event: Event | SyntheticEvent<unknown, Event>,
		reason: SnackbarCloseReason
	) => {
		if (reason === "clickaway") {
			return;
		}
		setToastOpen(false);
	};

	useEffect(() => {
		if (!toastMessage) return;
		setToastOpen(true);
	}, [toastMessage]);

	function getCard() {
		if (authActionState == "forgot_password") {
			return (
				<ForgotPasswordCard
					changeState={setAuthActionState}
					toastMessage={setToastMessage}
				/>
			);
		} else if (authActionState == "signup") {
			return (
				<CreateAccountCard
					changeState={setAuthActionState}
					toastMessage={setToastMessage}
				/>
			);
		} else {
			return <SignInCard changeState={setAuthActionState} />;
		}
	}

	return (
		<>
			{getCard()}
			<Snackbar
				open={toastOpen}
				autoHideDuration={5000}
				onClose={handleToastClose}
				message={toastMessage}
			/>
		</>
	);
};

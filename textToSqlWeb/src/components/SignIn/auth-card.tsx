import { useState } from "react";
import { SignInCard } from "./sign-in-card";
import { ForgotPasswordCard } from "./forgot-password-card";
import { CreateAccountCard } from "./create-account-card";

export type AuthActionStates = "signin" | "forgot_password" | "signup";
export const AuthCard = () => {
	const [authActionState, setAuthActionState] = useState<AuthActionStates>("signin");

	if (authActionState == "forgot_password") {
		return <ForgotPasswordCard changeState={setAuthActionState} />;
	} else if (authActionState == "signup") {
		return <CreateAccountCard changeState={setAuthActionState} />;
	} else {
		return <SignInCard changeState={setAuthActionState} />;
	}
};

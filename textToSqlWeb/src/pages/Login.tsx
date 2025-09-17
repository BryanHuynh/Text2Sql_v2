import { type FormEvent, useEffect, useState } from "react";
import {
	emailSignIn,
	emailSignUp,
	googleSignIn,
	usePersistentAuth, 
} from "../components/services/firebase/auth/AuthApi";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState<string | null>(null);
	
	useEffect(() => {
		usePersistentAuth().catch(console.error);
	}, []);

	async function handle(e: FormEvent, fn: () => Promise<any>) {
		e.preventDefault();
		setErr(null);
		try {
			await fn();
		} catch (e: any) {
			setErr(e.message);
		}
	}

	return (
		<div style={{ maxWidth: 360, margin: "3rem auto" }}>
			<h2>Sign in</h2>
			<form onSubmit={(e) => handle(e, () => emailSignIn(email, password))}>
				<input
					placeholder="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<input
					placeholder="password"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button type="submit">Sign in</button>
				<button onClick={(e) => handle(e, () => emailSignUp(email, password))}>
					Create account
				</button>
			</form>
			<button onClick={() => googleSignIn()}>Continue with Google</button>
			{err && <p style={{ color: "crimson" }}>{err}</p>}
		</div>
	);
}

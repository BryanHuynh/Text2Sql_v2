import {
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	signInWithPopup,
	setPersistence,
	browserLocalPersistence,
	sendPasswordResetEmail,
	type UserCredential,
	sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { FirebaseError } from "firebase/app";

export async function usePersistentAuth() {
	await setPersistence(auth, browserLocalPersistence);
}

export async function emailSignUp(email: string, password: string): Promise<string> {
	return await createUserWithEmailAndPassword(auth, email, password).then(
		(userCred: UserCredential) => {
			sendEmailVerification(userCred.user);
			return "Email verification sent to user!";
		}
	);
}

export function emailPasswordReset(email: string) {
	return sendPasswordResetEmail(auth, email);
}

export function emailSignIn(email: string, password: string) {
	return signInWithEmailAndPassword(auth, email, password);
}

export function googleSignIn() {
	return signInWithPopup(auth, googleProvider);
}

export function logOut() {
	return signOut(auth);
}

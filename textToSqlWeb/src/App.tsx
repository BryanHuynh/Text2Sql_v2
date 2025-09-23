"use client"; // Required for useState
import { Navigate, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import React, { type ReactElement, type ReactNode } from "react";
import { CssBaseline } from "@mui/material";
import { useAuth } from "./services/firebase/auth/AuthContent";


function ProtectedRoute({ children }: { children: ReactNode }): ReactElement | null {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (!user) return <Navigate to="/" replace />;
	return <>{children}</>;
}

export default function App() {
	return (
		<React.Fragment>
			<CssBaseline />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</React.Fragment>
	);
}

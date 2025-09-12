"use client"; // Required for useState
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import React from "react";
import { CssBaseline } from "@mui/material";

export default function App() {
	return (
		<React.Fragment>
			<CssBaseline />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/dashboard" element={<Dashboard />} />
			</Routes>
		</React.Fragment>
	);
}

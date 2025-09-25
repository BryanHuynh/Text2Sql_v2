import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StyledEngineProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./services/firebase/auth/AuthContent.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StyledEngineProvider injectFirst>
			<AuthProvider>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</AuthProvider>
		</StyledEngineProvider>
	</StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StyledEngineProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./components/services/firebase/auth/AuthContent.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<StyledEngineProvider injectFirst>
			<AuthProvider>
				<Provider store={store}>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</Provider>
			</AuthProvider>
		</StyledEngineProvider>
	</StrictMode>
);

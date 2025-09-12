import { Box, Grid, Paper, Stack } from "@mui/material";
import { useEffect } from "react";
import DefaultAppBar from "../components/Appbar/AppBar";
import { SidePanel } from "../components/SidePanel/SidePanel";
import { useDispatch } from "react-redux";
import { fetchUserSchemaFiles } from "../reducers/userfiles.reducer";
import type { AppDispatch } from "../store";
import { CodeEditor } from "../components/CodeEditor/code-editor";

export const Dashboard = () => {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		dispatch(fetchUserSchemaFiles("1"));
	}, []);
	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
			<DefaultAppBar />
			<Box sx={{ display: "flex", flexDirection: "row", flex: 1 }}>
				<Box sx={{ p: 2, width: "15vw" }}>
					<SidePanel />
				</Box>
				<Stack sx={{ width: "100%", height: "85%" }}>
					<Grid container sx={{ p: 2, width: "100%", height: "100%" }} columnSpacing={2}>
						<Grid sx={{ flex: 1, height: "100%" }}>
							<CodeEditor />
						</Grid>

						<Grid sx={{ flex: 1, height: "100%" }}>
							<Paper sx={{ p: 2, height: "100%", textAlign: "center" }}>
								Chat Screen
							</Paper>
						</Grid>
					</Grid>
					<Box sx={{ p: 2, width: "100%", height: "20%" }}>
						<Paper sx={{ p: 2, width: "100%", height: "100%" }}>Chat Screen</Paper>
					</Box>
				</Stack>
			</Box>
		</Box>
	);
};

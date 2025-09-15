import { Box, Grid, Paper, Stack } from "@mui/material";
import { useEffect } from "react";
import DefaultAppBar from "../components/Appbar/AppBar";
import { SidePanel } from "../components/SidePanel/SidePanel";
import { useDispatch } from "react-redux";
import { fetchUserSchemaFiles } from "../reducers/userSchemaFiles.reducer";
import type { AppDispatch } from "../store";
import { CodeEditorPanel } from "../components/CodeEditor/code-editor-panel";

export const Dashboard = () => {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		dispatch(fetchUserSchemaFiles("1"));
	}, []);
	return (
		<Box sx={{ display: "flex", flexDirection: "column", height: "100vh", minHeight: 0 }}>
			<DefaultAppBar />
			<Box sx={{ display: "flex", flexDirection: "row", flex: 1, minHeight: 0 }}>
				<Box sx={{ p: 2, width: "15vw" }}>
					<SidePanel />
				</Box>
				<Stack sx={{ width: "100%", flex: 1, minHeight: 0 }}>
					<Grid
						container
						sx={{ p: 2, width: "100%", height: "100%", minHeight: 0 }}
						columnSpacing={2}
					>
						<Grid sx={{ flex: 1, height: "100%" }}>
							<CodeEditorPanel />
						</Grid>

						<Grid sx={{ flex: 1 }}>
							<Paper sx={{ p: 2, height: "100%", textAlign: "center" }}>
								Chat Screen
							</Paper>
						</Grid>
					</Grid>
				</Stack>
			</Box>
		</Box>
	);
};

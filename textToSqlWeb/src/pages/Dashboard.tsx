import { Box, Grid, Paper, Stack } from "@mui/material";
import { useEffect } from "react";
import DefaultAppBar from "../components/Appbar/AppBar";
import { SidePanel } from "../components/SidePanel/SidePanel";
import { useDispatch } from "react-redux";
import { fetchUserFiles } from "../reducers/userfiles.reducer";
import type { AppDispatch } from "../store";

export const Dashboard = () => {
	const codePanelOpen = true;
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		dispatch(fetchUserFiles("1"));
	}, []);
	return (
		<Box>
			<DefaultAppBar />
			<Box sx={{ display: "flex", flexDirection: "row", minHeight: "100vh" }}>
				<Box sx={{ p: 2, width: "15vw" }}>
					<SidePanel />
				</Box>
				<Stack sx={{ width: "100%", height: "85%" }}>
					<Grid container sx={{ p: 2, width: "100%", height: "100%" }}>
						{codePanelOpen && (
							<Grid sx={{ width: "50%", height: "100%" }}>
								<Paper sx={{ p: 2, height: "100%", textAlign: "center" }}>
									Code Panel
								</Paper>
							</Grid>
						)}
						<Grid sx={{ width: codePanelOpen ? "50%" : "100%", height: "100%" }}>
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

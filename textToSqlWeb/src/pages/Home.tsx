import { Box, Button, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { SignInCard } from "../components/SignIn/sign-in-card";
import { CreateAccountCard } from "../components/SignIn/create-account-card";
import { AuthCard } from "../components/SignIn/auth-card";

export const Home = () => {
	return (
		<Container sx={{ height: "100vh", alignContent: "center" }}>
			<Grid container spacing={2} sx={{ height: "50%" }}>
				<Grid size={6}>
					<Paper
						sx={{ height: "100%", alignContent: "center", p: 2, textAlign: "center" }}
					>
						<Stack spacing={2} alignItems="center">
							<Typography variant="h4" fontWeight={700} gutterBottom>
								Welcome to Text To SQL
							</Typography>
							<Typography>
								This application allows you generate a SQL query from Text and a
								database design
							</Typography>
							<Typography>
								To get started, you can browse template databases or start creating
								your own!.
							</Typography>
							<Button
								component={RouterLink}
								to="/dashboard"
								variant="contained"
								color="primary"
								sx={{ mt: 1 }}
							>
								Go to Dashboard
							</Button>
						</Stack>
					</Paper>
				</Grid>
				<Grid size={6}>
					<Paper sx={{ height: "100%", p: 2, position: "relative" }}>
						<AuthCard />
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
};

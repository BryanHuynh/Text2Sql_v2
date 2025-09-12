import { Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const Home = () => {
	return (
		<Box
			minHeight="100vh"
			display="flex"
			alignItems="center"
			justifyContent="center"
			textAlign="center"
		>
			<Stack spacing={2} alignItems="center">
				<Typography variant="h4" fontWeight={700} gutterBottom>
					Welcome to Text To SQL
				</Typography>
				<Typography>
					This application allows you generate a SQL query from Text and a database design
				</Typography>
				<Typography>
					To get started, you can browse template databases or start creating your own!.
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
		</Box>
	);
};

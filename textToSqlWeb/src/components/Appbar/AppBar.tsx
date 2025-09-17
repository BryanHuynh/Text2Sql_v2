import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { logOut } from "../services/firebase/auth/AuthApi";

interface DefaultAppBarProps {
	email: string;
}
export default function DefaultAppBar({ email }: DefaultAppBarProps) {
	function handleLogout() {
		logOut();
	}

	return (
		<Box>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Text To Sql
					</Typography>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						Welcome {email}
					</Typography>
					<Button color="inherit" onClick={handleLogout}>
						logout
					</Button>
				</Toolbar>
			</AppBar>
		</Box>
	);
}

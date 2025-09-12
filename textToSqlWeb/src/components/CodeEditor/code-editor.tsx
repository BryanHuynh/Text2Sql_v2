import { AppBar, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";

export const CodeEditor = () => {
	return (
		<Paper sx={{ height: "100%" }}>
			<AppBar position="static" color="primary">
				<Toolbar variant="dense">
					<CodeIcon fontSize="small" />

					<Typography variant="subtitle1" color="inherit" component="div">
						Foo2
					</Typography>
				</Toolbar>
			</AppBar>
		</Paper>
	);
};
 
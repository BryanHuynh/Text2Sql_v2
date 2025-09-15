import { AppBar, Grid, Paper, Toolbar, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import { TablesPanel } from "./tables-panel";
import { AddtributeEditorPanel } from "./attribute-editor-panel";

export const CodeEditorPanel = () => {
	return (
		<Paper sx={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
			<AppBar position="static" color="primary">
				<Toolbar variant="dense">
					<CodeIcon fontSize="small" />
					<Typography variant="subtitle1" color="inherit" component="div" sx={{ px: 1 }}>
						Foo2
					</Typography>
				</Toolbar>
			</AppBar>
			<Grid container spacing={2} sx={{ p: 2, height: "95%" }}>
				<Grid size={2} sx={{ height: "100%" }}>
					<TablesPanel />
				</Grid>
				<Grid size={10}>
					<Paper sx={{ height: "100%" }}>
						<AddtributeEditorPanel />
					</Paper>
				</Grid>
			</Grid>
		</Paper>
	);
};

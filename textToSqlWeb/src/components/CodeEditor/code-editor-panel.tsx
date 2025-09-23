import { AppBar, Grid, Paper, Toolbar, Typography } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import { TablesPanel } from "./tables-panel";
import { AddtributeEditorPanel } from "./attribute-editor-panel";
import type { UserDatabase } from "../../services/database/user-databases";

interface CodeEditorPanelProps {
	database: UserDatabase;
}

export const CodeEditorPanel = ({ database }: CodeEditorPanelProps) => {
	return (
		<Paper sx={{ display: "flex", flexDirection: "column", flex: 1, height: "100%" }}>
			<AppBar position="static" color="primary">
				<Toolbar variant="dense">
					<CodeIcon fontSize="small" />
					<Typography variant="subtitle1" color="inherit" component="div" sx={{ px: 1 }}>
						{database.filename}
					</Typography>
				</Toolbar>
			</AppBar>
			<Grid container spacing={2} sx={{ p: 2, height: "95%" }}>
				<Grid size={3} sx={{ height: "100%" }}>
					<TablesPanel database={database}/>
				</Grid>
				<Grid size={9}>
					<AddtributeEditorPanel />
				</Grid>
			</Grid>
		</Paper>
	);
};

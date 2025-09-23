import { Box, IconButton, List, ListSubheader, Paper, Divider, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { TableLabel } from "./table-label";
import type { UserDatabase } from "../../services/database/user-databases";
import {
	createNewTable,
	deleteTable,
	getUserTables,
	renameTable,
	type UserTable,
} from "../../services/database/user-tables";
import { useDispatch } from "react-redux";
import { changeTable } from "../../reducer/slices/activePanelsSlice";

interface TablePanelProps {
	database: UserDatabase;
}
export const TablesPanel = ({ database }: TablePanelProps) => {
	const [tables, setTables] = useState<UserTable[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const dispatch = useDispatch();

	useEffect(() => {
		async function assignTables() {
			setLoading(true);
			await getUserTables(database.id)
				.then(setTables)
				.then(() => setLoading(false));
		}
		assignTables();
	}, [database]);

	async function handleAddTable() {
		await createNewTable(database.id).then((newTable) => {
			setTables((prev) => [...prev, newTable]);
		});
	}

	async function handleRenameTable(table_id: string, new_name: string) {
		await renameTable(table_id, new_name, database.id).then((updatedTable: UserTable) => {
			setTables(tables.map((table) => (table.id != updatedTable.id ? table : updatedTable)));
		});
	}

	async function handleDeleteTable(table_id: string) {
		await deleteTable(table_id).then(() => {
			setTables(tables.filter((table) => table.id != table_id));
		});
	}

	return (
		<Paper
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				minHeight: 0,
			}}
		>
			<ListSubheader
				component="div"
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1,
					bgcolor: "background.paper",
				}}
			>
				<Box sx={{ display: "flex", justifyContent: "space-between" }}>
					Tables
					<IconButton size="small" onClick={() => handleAddTable()}>
						<AddIcon fontSize="small" />
					</IconButton>
				</Box>
			</ListSubheader>

			<Divider />

			<Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
				<List
					disablePadding
					sx={{
						width: "100%",
						maxWidth: 360,
						bgcolor: "background.paper",
					}}
				>
					{loading ? (
						<Typography>Loading Tables...</Typography>
					) : (
						tables.map((table) => (
							<TableLabel
								key={table.id}
								tableId={table.id}
								tableName={table.tablename}
								handleRename={handleRenameTable}
								deleteTable={handleDeleteTable}
								onClick={() => dispatch(changeTable(table))}
							/>
						))
					)}
				</List>
			</Box>
		</Paper>
	);
};

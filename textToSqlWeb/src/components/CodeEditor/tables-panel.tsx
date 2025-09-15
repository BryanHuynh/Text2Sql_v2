import { Box, IconButton, List, ListSubheader, Paper, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { TableLabel } from "./table-label";

interface UserTable {
	id: string;
	name: string;
}

export const TablesPanel = () => {
	const [tables, setTables] = useState<UserTable[]>([]);

	useEffect(() => {
		const _tables: UserTable[] = [];
		for (let i = 0; i < 5; i++) {
			_tables.push({
				id: uuidv4(),
				name: `table ${i * 100}`,
			});
		}
		setTables(_tables);
	}, []);

	function handleAddTable() {
		setTables((prev) => [...prev, { id: uuidv4(), name: "new table" }]);
	}

	function handleRenameTable(table_id: string, new_name: string) {
		const index = tables.findIndex((table) => table.id == table_id);
		if (index == -1) throw new Error(`unable to find table ${table_id}`);
		const _table = { ...tables[index], name: new_name };
		setTables(tables.map((table) => (table.id != _table.id ? table : _table)));
	}

	function handleDeleteTable(table_id: string) {
		const exist = tables.some((table) => table.id == table_id);
		if (!exist) throw new Error(`unable to find table ${table_id}`);
		const next = tables.filter((table) => table.id != table_id);
		console.log(next);
		setTables(next);
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
					aria-labelledby="tables-subheader"
				>
					{tables.map((table) => (
						<TableLabel
							key={table.id}
							tableId={table.id}
							tableName={table.name}
							handleRename={handleRenameTable}
							deleteTable={handleDeleteTable}
						/>
					))}
				</List>
			</Box>
		</Paper>
	);
};

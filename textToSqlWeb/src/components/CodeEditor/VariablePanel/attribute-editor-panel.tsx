import {
	Card,
	CardContent,
	CardHeader,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import type { UserTable } from "../../../services/database/user-tables";
import {
	createNewVariable,
	deleteVariableById,
	getTableVariablesForTable,
	updateTableVariable,
	type TableVariable,
	type TableVariableReq,
} from "../../../services/database/table-variables";
import { useEffect, useState } from "react";
import { VariableTableRow } from "./variable-table-row";

interface VariableEditorPanelProps {
	table: UserTable;
}
export const VariableEditorPanel = ({ table }: VariableEditorPanelProps) => {
	const [tableVariables, setTableVariables] = useState<TableVariable[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		async function assignTableVariables() {
			setLoading(true);
			await getTableVariablesForTable(table.id)
				.then((variables) => variables.sort((a, b) => a.order - b.order))
				.then(setTableVariables)
				.then(() => setLoading(false));
		}
		assignTableVariables();
	}, [table]);

	async function handleNewVariable() {
		await createNewVariable({
			variableName: "",
			variableType: "",
			pk_flag: false,
			fk_flag: false,
			userTableId: table.id,
		}).then((variable) => {
			setTableVariables((prev) => [...prev, variable]);
		});
	}

	async function updateVariable(req: TableVariableReq) {
		await updateTableVariable(req).then((updated) =>
			setTableVariables((prev) =>
				prev
					? prev.map((variable) => (variable.id === updated.id ? updated : variable))
					: []
			)
		);
	}

	async function deleteVariable(id: string): Promise<void> {
		await deleteVariableById(id).then(() => {
			setTableVariables((prev) => prev.filter((variable) => variable.id != id));
		});
	}

	useEffect(() => {
		console.log(tableVariables);
	}, [tableVariables]);

	return (
		<Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
			<CardHeader title={table.tablename}></CardHeader>
			<CardContent sx={{ height: "100%" }}>
				<TableContainer
					sx={{
						height: "77vh",
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
					}}
				>
					{loading ? (
						<Typography>Loading Variables...</Typography>
					) : (
						<Table stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell align="center">Type</TableCell>
									<TableCell align="center">PK?</TableCell>
									<TableCell align="center">FK?</TableCell>
									<TableCell align="center">Ref</TableCell>
									<TableCell align="center" sx={{ p: 0 }}>
										<IconButton onClick={handleNewVariable}>
											<AddIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{tableVariables &&
									tableVariables.map((row, i) => (
										<VariableTableRow
											variable={row}
											key={i}
											updateVariable={updateVariable}
											deleteVariable={deleteVariable}
										/>
									))}
							</TableBody>
						</Table>
					)}
				</TableContainer>
			</CardContent>
		</Card>
	);
};

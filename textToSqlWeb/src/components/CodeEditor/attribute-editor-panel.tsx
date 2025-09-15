import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Checkbox,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from "@mui/material";

export const AddtributeEditorPanel = () => {
	const InputField = () => {
		return (
			<Box sx={{ display: "flex", flexDirection: "row", my: 1 }}>
				<TextField id="standard-basic" label="Standard" variant="outlined" size={"small"} />
			</Box>
		);
	};
	function createData(name, type, pk, fk, ref) {
		return { name, type, pk, fk, ref };
	}

	const rows = [
		createData("aid", "number", true, false, null),
		createData("homepage", "varchar(100)", false, false, null),
		createData("name", "varchar(100)", false, false, null),
		createData("oid", "number", false, true, "organization.oid"),
	];

	return (
		<Card sx={{ height: "100%" }}>
			<CardHeader title={"Table 0"}></CardHeader>
			<CardContent sx={{ display: "flex", flexDirection: "column" }}>
				<TableContainer component={Paper}>
					<Table aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell align="right">Type</TableCell>
								<TableCell align="right">PK?</TableCell>
								<TableCell align="right">FK?</TableCell>
								<TableCell align="right">Ref</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row) => (
								<TableRow
									key={row.name}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										<TextField
											id="outlined-basic"
											variant="outlined"
											defaultValue={row.name}
										/>
									</TableCell>
									<TableCell align="right">
										{" "}
										<TextField
											id="outlined-basic"
											variant="outlined"
											defaultValue={row.type}
										/>
									</TableCell>
									<TableCell align="right">
										<Checkbox checked={row.pk} />
									</TableCell>
									<TableCell align="right">
										<Checkbox checked={row.fk} />
									</TableCell>
									{row.fk && (
										<TableCell align="right">
											{" "}
											<TextField variant="outlined" defaultValue={row.ref} />
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
		</Card>
	);
};

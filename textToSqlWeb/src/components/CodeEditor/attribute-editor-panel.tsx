import {
	Box,
	Card,
	CardContent,
	CardHeader,
	Checkbox,
	IconButton,
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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

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
		<Card sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
			<CardHeader title={"Table 0"}></CardHeader>
			<CardContent sx={{ height: "100%" }}>
				<TableContainer
					sx={{
						height: "77vh",
						display: "flex",
						flexDirection: "column",
						minHeight: 0,
					}}
				>
					<Table stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell align="center">Type</TableCell>
								<TableCell align="center">PK?</TableCell>
								<TableCell align="center">FK?</TableCell>
								<TableCell align="center">Ref</TableCell>
								<TableCell align="center" sx={{ p: 0 }}>
									<IconButton>
										<AddIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{rows.map((row, i) => (
								<TableRow key={i}>
									<TableCell component="th" scope="row">
										<TextField variant="outlined" defaultValue={row.name} />
									</TableCell>
									<TableCell align="right">
										<TextField variant="outlined" defaultValue={row.type} />
									</TableCell>
									<TableCell align="right">
										<Checkbox checked={row.pk} />
									</TableCell>
									<TableCell align="right">
										<Checkbox checked={row.fk} />
									</TableCell>
									<TableCell align="right">
										{row.fk && (
											<TextField variant="outlined" defaultValue={row.ref} />
										)}
									</TableCell>
									<TableCell component="th" scope="row" sx={{ p: 0 }}>
										<IconButton>
											<DeleteOutlineIcon color="error" />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</CardContent>
		</Card>
	);
};

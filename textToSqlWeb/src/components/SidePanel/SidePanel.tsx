import { Box, Button, IconButton, List, Paper, Stack, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import { FileItem } from "./FileItem";
import { useEffect, useState } from "react";
import {
	createNewDatabase,
	deleteDatabase,
	getUserDatabases,
	renameDatabase,
	type UserDatabase,
} from "../../services/UserDatabases/user-databases";

export const SidePanel = () => {
	const [userDatabases, setUserDatabases] = useState<UserDatabase[]>();
	const [loading, setLoading] = useState<boolean>(true);

	async function fetchDatabases() {
		setLoading(true);
		await getUserDatabases()
			.then(setUserDatabases)
			.then(() => {
				setLoading(false);
			});
	}
	useEffect(() => {
		fetchDatabases();
	}, []);

	function handleRename(file_id: string, new_name: string) {
		renameDatabase(file_id, new_name).then(() => {
			setUserDatabases((prev) =>
				prev ? prev.map((db) => (db.id === file_id ? { ...db, name: new_name } : db)) : []
			);
		});
	}

	function deleteFile(file_id: string) {
		deleteDatabase(file_id).then(() => {
			setUserDatabases((prev) => (prev ? prev.filter((db) => db.id !== file_id) : []));
		});
	}

	function createNewFile() {
		createNewDatabase().then((newDb) => {
			setUserDatabases((prev) => (prev ? [...prev, newDb] : []));
		});
	}
	return (
		<Paper sx={{ height: "100%", p: 2 }}>
			<Stack sx={{ height: "100%" }} spacing={2}>
				<Box display="flex" justifyContent="space-between">
					<Typography component="h3" variant="subtitle2" alignContent="center">
						Databases
					</Typography>
					<IconButton onClick={() => createNewFile()}>
						<AddIcon />
					</IconButton>
				</Box>
				<Divider orientation="horizontal" />
				<List>
					{loading && (
						<Typography variant="body2" sx={{ px: 2 }}>
							Loading files...
						</Typography>
					)}
					{!loading && userDatabases && userDatabases.length === 0 && (
						<Typography variant="body2" sx={{ px: 2 }}>
							No files yet
						</Typography>
					)}
					{userDatabases &&
						userDatabases.map((f) => (
							<FileItem
								key={f.id}
								fileId={f.id}
								fileName={f.filename}
								handleRename={handleRename}
								deleteFile={deleteFile}
							/>
						))}
				</List>
				<Box sx={{ mt: "auto", width: "100%" }}>
					<Button variant="outlined" sx={{ width: "100%" }}>
						Import Sqlite File
					</Button>
				</Box>
			</Stack>
		</Paper>
	);
};

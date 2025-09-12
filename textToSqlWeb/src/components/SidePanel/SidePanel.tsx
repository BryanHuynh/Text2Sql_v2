import { Box, Button, IconButton, List, Paper, Stack, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import { FileItem } from "./FileItem";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { setUserFiles } from "../../reducers/userfiles.reducer";
import { v4 as uuidv4 } from "uuid";
import type { UserFile } from "../../features/userfiles/userfiles.types";
import {
	createNewUserFile,
	deleteUserFile,
	updateUserFile,
} from "../../features/userfiles/userfiles.api";

export const SidePanel = () => {
	const { items: userFiles, status } = useSelector((s: RootState) => s.userfiles);
	const dispatch = useDispatch<AppDispatch>();

	function handleRename(file_id: string, new_name: string) {
		const file = userFiles.find((file) => file.id === file_id);
		if (!file) throw new Error(`Unable to find file with id: ${file_id}`);
		const new_file = { ...file, filename: new_name };

		updateUserFile(file_id, new_file)
			.then((res) => {
				if (!res) throw new Error(`unable to update file ${file_id}`);
				const next = userFiles.map((file) => (file.id === file_id ? new_file : file));
				dispatch(setUserFiles(next));
			})
			.catch((err) => {
				throw err;
			});
	}

	function deleteFile(file_id: string) {
		const exists = userFiles.some((file) => file.id === file_id);
		if (!exists) throw new Error(`Unable to find file with id: ${file_id}`);
		deleteUserFile(file_id)
			.then((res) => {
				if (!res) throw new Error(`unable to delete file ${file_id}`);
				const next = userFiles.filter((file) => file.id != file_id);
				dispatch(setUserFiles(next));
			})
			.catch((err) => {
				throw err;
			});
	}

	function createNewFile() {
		const file: UserFile = {
			id: uuidv4(),
			filename: "new file",
			created_at: new Date().toISOString(),
			content: "",
		};
		createNewUserFile(file).then((res: boolean) => {
			if (res) {
				dispatch(setUserFiles(userFiles.concat(file)));
			}
		});
	}

	return (
		<Paper sx={{ height: "100%", p: 2 }}>
			<Stack sx={{ height: "100%" }} spacing={2}>
				<Box display="flex" justifyContent="space-between">
					<Typography component="h3" variant="subtitle2" alignContent="center">
						Files
					</Typography>
					<IconButton onClick={() => createNewFile()}>
						<AddIcon />
					</IconButton>
				</Box>
				<Divider orientation="horizontal" />
				<List>
					{status === "loading" && (
						<Typography variant="body2" sx={{ px: 2 }}>
							Loading files...
						</Typography>
					)}
					{status !== "loading" && userFiles.length === 0 && (
						<Typography variant="body2" sx={{ px: 2 }}>
							No files yet
						</Typography>
					)}
					{userFiles.map((f) => (
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

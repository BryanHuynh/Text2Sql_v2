import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemText,
	TextField,
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import { useState } from "react";
type FileItemProps = {
	fileId: string;
	fileName: string;
	handleRename: (file_id: string, new_name: string) => void;
	deleteFile: (file_id: string) => void;
};

export const FileItem = ({ fileId, fileName, handleRename, deleteFile }: FileItemProps) => {
	const [showTools, setShowTools] = useState<boolean>(false);
	const [renaming, setRenaming] = useState<boolean>(false);
	const [label, setLabel] = useState<string>(fileName);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	function onRenameComplete() {
		setRenaming(false);
		if (label == "") {
			setLabel(fileName);
			return;
		}
		handleRename(fileId, label);
	}

	return (
		<ListItem disablePadding>
			<ListItemButton
				onMouseEnter={() => setShowTools(true)}
				onMouseLeave={() => setShowTools(false)}
			>
				{!renaming ? (
					<ListItemText>{label}</ListItemText>
				) : (
					<TextField
						id="fileRenaming"
						size="small"
						variant="standard"
						value={label}
						autoFocus
						onChange={(e) => setLabel(e.target.value)}
						onBlur={() => onRenameComplete()}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								onRenameComplete();
							}
						}}
					/>
				)}

				{showTools && !renaming && (
					<div>
						<IconButton
							size="small"
							onClick={() => {
								setRenaming(true);
							}}
						>
							<DriveFileRenameOutlineOutlinedIcon fontSize="small" />
						</IconButton>
						<IconButton size="small" onClick={() => setDeleteDialogOpen(true)}>
							<DeleteOutlineOutlinedIcon fontSize="small" />
						</IconButton>
					</div>
				)}
			</ListItemButton>
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{`Are you sure you want to delete ${fileName}?`}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						This action cannot be reversed!
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>No</Button>
					<Button
						onClick={() => {
							setDeleteDialogOpen(false);
							deleteFile(fileId);
						}}
						autoFocus
					>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</ListItem>
	);
};

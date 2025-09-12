export interface UserFilesAPIResponse {
	data: {
		id: string;
		filename: string;
		created_at: string;
		content: string;
	}[];
}

export interface UserFile {
	id: string;
	filename: string;
	created_at: string;
	content: string;
}

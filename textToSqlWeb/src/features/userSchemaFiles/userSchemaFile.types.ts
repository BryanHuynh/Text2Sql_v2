export interface UserSchemaFileAPIResponse {
	data: {
		id: string;
		filename: string;
		created_at: string;
		content: string;
	}[];
}

export interface UserSchemaFile {
	id: string;
	filename: string;
	created_at: string;
	content: string;
}

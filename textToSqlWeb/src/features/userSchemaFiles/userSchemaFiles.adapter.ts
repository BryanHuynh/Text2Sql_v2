import type { UserSchemaFile, UserSchemaFileAPIResponse } from "./userSchemaFile.types";

export function mapUserSchemaFilesFromAPI(resp: UserSchemaFileAPIResponse): UserSchemaFile[] {
	return resp.data.map((data) => ({
		id: data.id,
		filename: data.filename,
		created_at: data.created_at,
		content: data.content,
	}));
}

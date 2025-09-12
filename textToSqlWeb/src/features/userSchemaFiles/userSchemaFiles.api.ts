import { mapUserSchemaFilesFromAPI } from "./userSchemaFiles.adapter";
import type { UserSchemaFile, UserSchemaFileAPIResponse } from "./userSchemaFile.types";
import { v4 as uuidv4 } from "uuid";

export async function getUserSchemaFiles(id: string): Promise<UserSchemaFile[]> {
	const resp: UserSchemaFileAPIResponse = {
		data: [
			{
				id: uuidv4(),
				filename: "foo",
				created_at: new Date().toISOString(),
				content: "HELLO WORLD",
			},
			{
				id: uuidv4(),
				filename: "foo2",
				created_at: new Date().toISOString(),
				content: "HELLO WORLD 2",
			},
		],
	};
	return mapUserSchemaFilesFromAPI(resp);
}

export async function createNewUserFile(schemaFile: UserSchemaFile): Promise<boolean> {
	return true;
}

export async function updateUserSchemaFile(
	file_id: string,
	schemaFile: UserSchemaFile
): Promise<boolean> {
	return true;
}

export async function deleteUserSchemaFile(file_id: string): Promise<boolean> {
	return true;
}

import { mapUserFilesFromAPI } from "./userfiles.adapter";
import type { UserFile, UserFilesAPIResponse } from "./userfiles.types";
import { v4 as uuidv4 } from "uuid";

export async function getUserFiles(id: string): Promise<UserFile[]> {
	const resp: UserFilesAPIResponse = {
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
	return mapUserFilesFromAPI(resp);
}

export async function createNewUserFile(userFile: UserFile): Promise<boolean> {
	return true;
}

export async function updateUserFile(file_id: string, userFile: UserFile): Promise<boolean> {
	return true;
}

export async function deleteUserFile(file_id: string): Promise<boolean> {
	return true;
}

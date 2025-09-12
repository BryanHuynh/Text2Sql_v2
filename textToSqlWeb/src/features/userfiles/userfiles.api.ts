import { mapUserFilesFromAPI } from "./userfiles.adapter";
import type { UserFile, UserFilesAPIResponse } from "./userfiles.types";

export async function getUserFiles(id: string): Promise<UserFile[]> {
	const resp: UserFilesAPIResponse = {
		data: [
			{
				id: "123",
				filename: "foo",
				created_at: new Date().toISOString(),
				content: "HELLO WORLD",
			},
			{
				id: "1234",
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

export async function renameUserFile(user: string, userFile: UserFile): Promise<boolean> {
	return true;
}

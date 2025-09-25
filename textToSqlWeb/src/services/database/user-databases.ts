import { api } from "../api-client";

export type UserDatabase = { filename: string; id: string };

export async function getUserDatabases(): Promise<UserDatabase[]> {
	const { data } = await api.get("/userDatabases");
	return data;
}

export async function createNewDatabase(): Promise<UserDatabase> {
	const { data } = await api.post("/userDatabases", {
		filename: "New File",
	});
	return data;
}

export async function deleteDatabase(id: string) {
	const { data } = await api.delete(`/userDatabases/${id}`);
	return data;
}

export async function renameDatabase(id: string, new_name: string) {
	const { data } = await api.post("/userDatabases/update", {
		database_id: id,
		filename: new_name,
	});
	return data;
}

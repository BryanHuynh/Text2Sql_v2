import { api } from "../api-client";

export type UserTable = { id: string; tablename: string; userdatabaseid: string };

export async function getUserTables(databaseId: string): Promise<UserTable[]> {
	const { data } = await api.get(`/userTables/${databaseId}`);
	return data;
}

export async function createNewTable(databaseId: string): Promise<UserTable> {
	const { data } = await api.post("/userTables", {
		tablename: "New Table",
		userDatabaseId: databaseId,
	});
	return data;
}

export async function deleteTable(tableId: string) {
	await api.delete(`/userTables/${tableId}`);
}

export async function renameTable(
	tableId: string,
	newName: string,
	databaseId: string
): Promise<UserTable> {
	const { data } = await api.post("/userTables/update", {
		tablename: newName,
		userDatabaseId: databaseId,
		id: tableId,
	});
	return data;
}

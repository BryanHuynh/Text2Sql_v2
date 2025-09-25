import { api } from "../api-client";
import type { UserTable } from "./user-tables";

export type TableVariable = {
	id: string;
	variableName: string;
	variableType: string;
	pk_flag: boolean;
	fk_flag: boolean;
	userTable: UserTable;
	referenceTable?: TableVariable;
	order: number;
};

export type TableVariableReq = {
	id?: string;
	variableName: string;
	variableType: string;
	pk_flag: boolean;
	fk_flag: boolean;
	userTableId?: string;
	referenceVariable?: string;
	order?: number;
};

export async function getTableVariableById(variableId: string): Promise<TableVariable> {
	const { data } = await api.get(`/tableVariables/${variableId}`);
	return data;
}

export async function getTableVariablesForTable(tableId: string): Promise<TableVariable[]> {
	const { data } = await api.get(`/tableVariables/table/${tableId}`);
	return data;
}

export async function getAllTableVariables(databaseId: string): Promise<TableVariable[]> {
	const { data } = await api.get(`/tableVariables/database/${databaseId}`);
	return data;
}

export async function createNewVariable(req: TableVariableReq): Promise<TableVariable> {
	const { data } = await api.post("/tableVariables", req);
	return data;
}

export async function deleteVariableById(variableId: string) {
	await api.delete(`/tableVariables/${variableId}`);
}

export async function updateTableVariable(req: TableVariableReq): Promise<TableVariable> {
	const { data } = await api.post("/tableVariables/update", req);
	return data;
}

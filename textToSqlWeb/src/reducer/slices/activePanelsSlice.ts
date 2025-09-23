import { createSlice } from "@reduxjs/toolkit";
import type { UserDatabase } from "../../services/database/user-databases";
import type { UserTable } from "../../services/database/user-tables";

export type ActivePanelsType = {
	database?: UserDatabase;
	table?: UserTable;
};

const initialState: ActivePanelsType = {
	database: undefined,
	table: undefined,
};

export const activePanelsSlices = createSlice({
	name: "activePanelSlices",
	initialState,
	reducers: {
		changeDatabase: (state, action) => {
			state.database = action.payload;
		},
		changeTable: (state, action) => {
			state.table = action.payload;
		},
		clear: (state) => {
			state.database = undefined;
			state.table = undefined;
		},
	},
});

export const { changeDatabase, changeTable, clear } = activePanelsSlices.actions;
export default activePanelsSlices.reducer;

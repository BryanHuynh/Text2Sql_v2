import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getUserSchemaFiles } from "../features/userSchemaFiles/userSchemaFiles.api";
import type { UserSchemaFile } from "../features/userSchemaFiles/userSchemaFile.types";

// Stores user files. Initial data is loaded via API.

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export interface UserSchemaFilesState {
	items: UserSchemaFile[];
	status: LoadStatus;
	error?: string;
}

// Async thunk to fetch user files for a given user id
export const fetchUserSchemaFiles = createAsyncThunk<UserSchemaFile[], string>(
	"userfiles/fetch",
	async (userId: string) => {
		const files = await getUserSchemaFiles(userId);
		return files;
	}
);

const initialState: UserSchemaFilesState = {
	items: [],
	status: "idle",
};

const userSchemaFilesSlice = createSlice({
	name: "userfiles",
	initialState,
	reducers: {
		setUserSchemaFiles(state, action: PayloadAction<UserSchemaFile[]>) {
			state.items = action.payload;
			state.status = "succeeded";
			state.error = undefined;
		},
		clearUserSchemaFiles(state) {
			state.items = [];
			state.status = "idle";
			state.error = undefined;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUserSchemaFiles.pending, (state) => {
				state.status = "loading";
				state.error = undefined;
			})
			.addCase(fetchUserSchemaFiles.fulfilled, (state, action) => {
				state.items = action.payload;
				state.status = "succeeded";
				state.error = undefined;
			})
			.addCase(fetchUserSchemaFiles.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error?.message || "Failed to load user files";
			});
	},
});

export const { setUserSchemaFiles: setUserSchemaFiles, clearUserSchemaFiles } =
	userSchemaFilesSlice.actions;

export default userSchemaFilesSlice.reducer;

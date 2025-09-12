import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getUserFiles } from "../features/userfiles/userfiles.api";
import type { UserFile } from "../features/userfiles/userfiles.types";

// Stores user files. Initial data is loaded via API.

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export interface UserFilesState {
	items: UserFile[];
	status: LoadStatus;
	error?: string;
}

// Async thunk to fetch user files for a given user id
export const fetchUserFiles = createAsyncThunk<UserFile[], string>(
	"userfiles/fetch",
	async (userId: string) => {
		const files = await getUserFiles(userId);
		return files;
	}
);

const initialState: UserFilesState = {
	items: [],
	status: "idle",
};

const userFilesSlice = createSlice({
	name: "userfiles",
	initialState,
	reducers: {
		setUserFiles(state, action: PayloadAction<UserFile[]>) {
			state.items = action.payload;
			state.status = "succeeded";
			state.error = undefined;
		},
		clearUserFiles(state) {
			state.items = [];
			state.status = "idle";
			state.error = undefined;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUserFiles.pending, (state) => {
				state.status = "loading";
				state.error = undefined;
			})
			.addCase(fetchUserFiles.fulfilled, (state, action) => {
				state.items = action.payload;
				state.status = "succeeded";
				state.error = undefined;
			})
			.addCase(fetchUserFiles.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error?.message || "Failed to load user files";
			});
	},
});

export const { setUserFiles, clearUserFiles } = userFilesSlice.actions;

export default userFilesSlice.reducer;

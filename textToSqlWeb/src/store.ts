import { configureStore } from "@reduxjs/toolkit";
import userfilesReducer from "./reducers/userfiles.reducer";

export const store = configureStore({
  reducer: {
    userfiles: userfilesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


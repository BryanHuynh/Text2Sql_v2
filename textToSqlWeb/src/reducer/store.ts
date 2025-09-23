import { configureStore } from "@reduxjs/toolkit"
import { activePanelsSlices } from "./slices/activePanelsSlice";

export const store = configureStore({
    reducer: {
        activePanels: activePanelsSlices.reducer,
    },
});

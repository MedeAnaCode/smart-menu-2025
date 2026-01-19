import { configureStore } from "@reduxjs/toolkit";
import { apiRtk } from "./apiRtk";

export const store = configureStore({
    reducer: {
        [apiRtk.reducerPath]: apiRtk.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiRtk.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

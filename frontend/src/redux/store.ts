import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "../redux/auth-slice";

const store = configureStore({
  reducer: {
    auth: AuthReducer,
  },
});

// Infer RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

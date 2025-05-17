import { configureStore } from "@reduxjs/toolkit";
import AuthReducer from "../redux/auth-slice";
import CollectionReducer from "../redux/collection-slice/index";
import SnippetReducer from "../redux/snippet-slice/index";
import CollaboratorReducer from "../redux/collaborators-slice/index"

const store = configureStore({
  reducer: {
    auth: AuthReducer,
    collections:CollectionReducer,
    snippets:SnippetReducer,
    collaborators:CollaboratorReducer
  },
});

// Infer RootState and AppDispatch types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

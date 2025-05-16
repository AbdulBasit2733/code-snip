import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "../../config/config";
import type {
  CollectionResponse,
  CreateCollectionData,
  AddSnippetData,
  Collection,
  CollectionState,
  ShareCollectionData,
  UpdateCollectionData,
} from "../../types/Collection";

// Types

// Async Thunks

export const fetchCollections = createAsyncThunk<
  CollectionResponse,
  void,
  { rejectValue: CollectionResponse }
>("collections/fetchCollections", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<CollectionResponse>(
      `${BACKEND_URL}/collection/my-collections`,
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to fetch collections",
    });
  }
});

export const createCollection = createAsyncThunk<
  CollectionResponse,
  CreateCollectionData,
  { rejectValue: CollectionResponse }
>("collections/createCollection", async (data, { rejectWithValue }) => {
  try {
    console.log(data);
    
    const response = await axios.post<CollectionResponse>(
      `${BACKEND_URL}/collection/create`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to create collection",
    });
  }
});

export const getCollectionById = createAsyncThunk<
  CollectionResponse,
  string,
  { rejectValue: CollectionResponse }
>("collections/getById", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get<CollectionResponse>(
      `${BACKEND_URL}/collection/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to fetch collection",
    });
  }
});

export const updateCollection = createAsyncThunk<
  CollectionResponse,
  UpdateCollectionData,
  { rejectValue: CollectionResponse }
>("collections/update", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await axios.put<CollectionResponse>(
      `${BACKEND_URL}/collection/${id}`,
      data,
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to update collection",
    });
  }
});

export const deleteCollection = createAsyncThunk<
  CollectionResponse,
  string,
  { rejectValue: CollectionResponse }
>("collections/delete", async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete<CollectionResponse>(
      `${BACKEND_URL}/collection/${id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to delete collection",
    });
  }
});

export const shareCollection = createAsyncThunk<
  CollectionResponse,
  ShareCollectionData,
  { rejectValue: CollectionResponse }
>("collections/share", async ({ id, userIds }, { rejectWithValue }) => {
  try {
    const response = await axios.post<CollectionResponse>(
      `${BACKEND_URL}/collection/${id}/share`,
      { userIds },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to share collection",
    });
  }
});

export const addSnippetToCollection = createAsyncThunk<
  CollectionResponse,
  AddSnippetData,
  { rejectValue: CollectionResponse }
>("collections/addSnippet", async ({ id, snippetId }, { rejectWithValue }) => {
  try {
    const response = await axios.post<CollectionResponse>(
      `${BACKEND_URL}/collection/${id}/add-snippet`,
      { snippetId },
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to add snippet",
    });
  }
});

// Initial state
const initialState: CollectionState = {
  collections: [],
  selectedCollection: null,
  isLoading: false,
  error: null,
};

// Slice
const collectionSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.collections = Array.isArray(action.payload.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch collections";
      })
      .addCase(createCollection.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(createCollection.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getCollectionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCollection = action.payload.success
          ? (action.payload.data as Collection) || null
          : null;
      })
      .addCase(updateCollection.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCollection.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteCollection.fulfilled, (state) => {
        state.isLoading = false;
      });
  },
});

export default collectionSlice.reducer;

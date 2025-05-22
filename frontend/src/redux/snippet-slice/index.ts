import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "../../config/config";
import type {
  CreateSnippetData,
  ShareSnippetData,
  SnippetResponse,
  SnippetState,
  UpdateSnippetData,
} from "../../types/Snippets";

export const createSnippet = createAsyncThunk<
  SnippetResponse,
  CreateSnippetData,
  { rejectValue: SnippetResponse }
>("snippet/create", async (data, { rejectWithValue }) => {
  try {
    // console.log("Creating Snippet Slice", data);

    const res = await axios.post(
      `${BACKEND_URL}/snippet/create-snippet`,
      data,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to create snippet",
    });
  }
});

export const getMySnippets = createAsyncThunk<
  SnippetResponse,
  void,
  { rejectValue: SnippetResponse }
>("snippet/getAll", async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/snippet/my-snippets`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to fetch snippets",
    });
  }
});

export const getSnippetById = createAsyncThunk<
  SnippetResponse,
  string,
  { rejectValue: SnippetResponse }
>("snippet/getById", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/snippet/${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to fetch snippet",
    });
  }
});

export const updateSnippet = createAsyncThunk<
  SnippetResponse,
  UpdateSnippetData,
  { rejectValue: SnippetResponse }
>("snippet/update", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/snippet/${data.id}`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to update snippet",
    });
  }
});

export const deleteSnippet = createAsyncThunk<
  SnippetResponse,
  string,
  { rejectValue: SnippetResponse }
>("snippet/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`${BACKEND_URL}/snippet/${id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Failed to delete snippet",
    });
  }
});

export const shareSnippet = createAsyncThunk<
  SnippetResponse,
  ShareSnippetData,
  { rejectValue: SnippetResponse }
>("snippet/share", async ({ id, collaborators }, { rejectWithValue }) => {
  try {
    const res = await axios.post(
      `${BACKEND_URL}/snippet/${id}/share`,
      { collaborators },
      { withCredentials: true }
    );
    return res.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || "Failed to share snippet";
    return rejectWithValue({ success: false, message });
  }
});

export const leaveSnippet = createAsyncThunk(
  "snippet/leave",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/snippet/${id}/leave`,
        {},
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        success: false,
        message: error?.response?.data?.message || "Failed to leave snippet",
      });
    }
  }
);

// Initial State
const initialState: SnippetState = {
  snippets: [],
  isLoading: false,
  error: null,
};

// Slice
const snippetSlice = createSlice({
  name: "snippet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // createSnippet
      .addCase(createSnippet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSnippet.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })

      // getMySnippets
      .addCase(getMySnippets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMySnippets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.snippets = action?.payload?.data || [];
      })
      .addCase(getMySnippets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })

      // getSnippetById
      .addCase(getSnippetById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSnippetById.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getSnippetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })

      // updateSnippet
      .addCase(updateSnippet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSnippet.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })
      .addCase(deleteSnippet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSnippet.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })
      .addCase(shareSnippet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(shareSnippet.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(shareSnippet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      });
  },
});

export default snippetSlice.reducer;

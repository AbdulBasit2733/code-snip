import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../../config/config";

export interface CodeProps {
  code: string;
  userId: string;
  timestamp: Date;
}

interface INITIAL_STATE {
  isLoading: boolean;
  code: CodeProps[];
}

const initialState:INITIAL_STATE = {
  isLoading: false,
  code: [],
};

export const getCodeBySnippetId = createAsyncThunk(
  "codebase/codeBySnippetId",
  async (snippetId, { rejectWithValue }) => {
    // console.log("snippetId", snippetId);

    try {
      const res = await axios.get(`${BACKEND_URL}/codebase/code/${snippetId}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue({
        success: false,
        message: error?.response?.data?.message || "Failed to fetch snippet",
      });
    }
  }
);

const codeSlice = createSlice({
  name: "code",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getCodeBySnippetId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCodeBySnippetId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.code = action.payload.success ? action.payload.data : [];
      })
      .addCase(getCodeBySnippetId.rejected, (state) => {
        state.isLoading = false;
        state.code = [];
      });
  },
});

export default codeSlice.reducer;

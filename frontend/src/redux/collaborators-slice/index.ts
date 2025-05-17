import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { BACKEND_URL } from "../../config/config";
import axios from "axios";
import type { User } from "../../types/User";

export const getCollaborators = createAsyncThunk(
  "users/collaborators",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/auth/all-collaborators`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue({
        success: false,
        message: error?.response?.data?.message || "Something Went Wrong",
      });
    }
  }
);

interface INITIAL_STATE {
  isLoading: boolean;
  collaborators: User[] | [];
}

const initialState: INITIAL_STATE = {
  isLoading: false,
  collaborators: [],
};

const collaboratorSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCollaborators.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(getCollaborators.fulfilled, (state, action) => {
        state.isLoading = false;
        state.collaborators = action.payload.success ? action.payload.data : [];
      })
      .addCase(getCollaborators.rejected, (state) => {
        state.isLoading = false;
        state.collaborators = [];
      });
  },
});

export default collaboratorSlice.reducer;

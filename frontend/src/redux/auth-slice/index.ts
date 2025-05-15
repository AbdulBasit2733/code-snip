import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "../../config/config";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
}

// Async Thunks
export const checkAuth = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: AuthResponse }
>("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<AuthResponse>(
      `${BACKEND_URL}/auth/check-auth`,
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
        withCredentials: true,
      }
    );
    console.log(response);

    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Something went wrong.",
    });
  }
});

export const login = createAsyncThunk<
  AuthResponse,
  LoginFormData,
  { rejectValue: AuthResponse }
>("auth/login", async (formData, { rejectWithValue }) => {
  console.log("Form Data", formData);

  try {
    const response = await axios.post<AuthResponse>(
      `${BACKEND_URL}/auth/login`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
    });
  }
});

export const signup = createAsyncThunk<
  AuthResponse,
  SignupFormData,
  { rejectValue: AuthResponse }
>("auth/signup", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${BACKEND_URL}/auth/signup`,
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string | string[] }>;
    const errorMessage = Array.isArray(error.response?.data?.message)
      ? error.response?.data?.message[0]
      : error.response?.data?.message;
    return rejectWithValue({
      success: false,
      message: errorMessage || "Something went wrong",
    });
  }
});

export const logoutFromServer = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: AuthResponse }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.post<AuthResponse>(
      `${BACKEND_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>;
    return rejectWithValue({
      success: false,
      message: error.response?.data?.message || "Something went wrong",
    });
  }
});

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: false,
};

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        console.log("Action", action);

        state.isLoading = false;
        state.user = action.payload.success ? action.payload.data || null : null;
        state.isAuthenticated = action.payload.success ? true : false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      })

      // login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success
          ? action.payload.data || null
          : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
      })

      // signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isLoading = false;
      })

      // logout
      .addCase(logoutFromServer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutFromServer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? null : state.user;
        state.isAuthenticated = !action.payload.success;
      });
  },
});

export default authSlice.reducer;

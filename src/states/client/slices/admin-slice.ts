import { AdminLoginSchemaType } from '@/app/admin/auth/login/_/schemas';
import { adminRefreshApi } from '@/lib/auth';
import { adminLocalStoreKey } from '@/lib/constants';
import {
  decodeJwt,
  getErrorMessage,
  getFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { AuthResponse } from '@/types/auth';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isErrorResponse, isSuccessResponse, isTokenExpired } from './auth-slice';

/**
 * State for admin authentication and user info.
 */
export type AdminState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  admin: {
    role: string;
    name?: string;
    email?: string;
  } | null;
  error: string | null;
};

interface AdminResponse {
  data: {
    email: string;
    token: string;
    role: string;
  };
}

const initialState: AdminState = {
  isLoading: false,
  token: null,
  isAuthenticated: false,
  admin: null,
  error: null,
};

export const adminLogin = createAsyncThunk(
  'admin/login',
  async (loginCredentials: AdminLoginSchemaType, { rejectWithValue }) => {
    try {
      const result = await adminService.login(loginCredentials);
      return result;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Something went wrong while admin login'));
    }
  }
);
let isRefreshing = false;
export const adminRefresh = createAsyncThunk('admin/refresh', async (_, { rejectWithValue }) => {
  if (isRefreshing) return rejectWithValue('Refresh already in progress');
  isRefreshing = true;

  try {
    const response = await adminRefreshApi();
    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to refresh token'));
  }
});

export const restoreCredentials = createAsyncThunk(
  'admin/restore',
  async (_, { rejectWithValue }) => {
    try {
      // Middleware already redirected if cookie missing

      const token = getFromLocalStorage(adminLocalStoreKey);
      if (!token || isTokenExpired(token)) {
        return rejectWithValue('No valid admin token');
      }

      return { data: { token }, success: true };
    } catch (e) {
      return rejectWithValue(getErrorMessage(e));
    }
  }
);

export const adminLogout = createAsyncThunk('admin/logout', async (_, { rejectWithValue }) => {
  try {
    await adminService.logout();
    return true;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to logout'));
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    /**
     * Set admin credentials in state. Do not perform side effects here.
     */
    setAdminCredentials: (state, action: PayloadAction<AdminResponse>) => {
      const { email, token, role } = action.payload?.data;
      state.admin = { email, role };
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },
    /**
     * Clear admin credentials from state. Do not perform side effects here.
     */
    clearAdminCredentials: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        const { payload } = action;
        if (isSuccessResponse<AuthResponse>(payload)) {
          const { token } = payload.data;
          applyCredentials(state, token);
        } else if (isErrorResponse(payload)) {
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'Admin login failed';
        }
        state.isLoading = false;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // adminRefresh
      .addCase(adminRefresh.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminRefresh.fulfilled, (state, action) => {
        const payload = action.payload;
        if (isSuccessResponse<AuthResponse>(payload)) {
          const { token } = payload.data;
          applyCredentials(state, token);
        } else if (isErrorResponse(payload)) {
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'admin refresh failed';
        }
        state.isLoading = false;
      })
      .addCase(adminRefresh.rejected, (state, action) => {
        removeCredentials(state);
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // logout
      .addCase(adminLogout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        removeCredentials(state);
        state.isLoading = false;
      })
      .addCase(adminLogout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export function applyCredentials(state: AdminState, token: string) {
  if (!state || !token) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = decodeJwt<any>(token);
  if (payload.role !== 'admin') {
    throw new Error('Not an admin token');
  }

  state.admin = {
    role: payload.role,
    email: payload.email,
    name: payload.name,
  };
  state.token = token;
  state.isAuthenticated = true;
  state.error = null;

  if (typeof window !== 'undefined') {
    saveToLocalStorage(adminLocalStoreKey, token);
  }
}

export function removeCredentials(state: AdminState) {
  state.admin = null;
  state.token = null;
  state.isAuthenticated = false;
  state.error = null;
  if (typeof window !== 'undefined') {
    removeFromLocalStorage(adminLocalStoreKey);
  }
}

export const { clearAdminCredentials, setAdminCredentials } = adminSlice.actions;
export default adminSlice.reducer;

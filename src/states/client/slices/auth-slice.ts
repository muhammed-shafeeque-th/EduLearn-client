/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { AuthUser, ResendOTPRequest, VerifyOTPRequest } from '@/types/auth';
import { LoginCredentials } from '@/types/auth';
import { AuthResponse, RegisterData } from '@/types/auth';
import { RootState } from '../index';
import {
  getErrorMessage,
  removeFromLocalStorage,
  saveToLocalStorage,
  decodeJwt,
} from '@/lib/utils';
import { authLocalStoreKey } from '@/lib/constants';
import { clientRefreshApi } from '@/lib/auth/client-refresh';

export type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'unknown',
  isLoading: false,
  error: null,
};

// --- Async Thunks ---

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to login'));
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to register'));
    }
  }
);

export const verify = createAsyncThunk(
  'auth/verify',
  async (data: VerifyOTPRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verify(data);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to verify OTP'));
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resend-otp',
  async (data: ResendOTPRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resendOtp(data);
      return response;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to resend OTP'));
    }
  }
);

export const restoreCredentials = createAsyncThunk(
  'auth/restoreCredentials',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // const token = getFromLocalStorage(authLocalStoreKey);

      // if (!token) {
      // No token, try refreshing immediately
      return await dispatch(refreshToken()).unwrap();
      // }

      // if (isTokenExpired(token)) {
      //   // Expired token, request refresh
      //   return await dispatch(refreshToken()).unwrap();
      // }

      // // Valid token, just return it so we can apply
      // return { data: { token }, success: true };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to restore credentials'));
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return true;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to logout'));
  }
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clientRefreshApi();
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to refresh token'));
    }
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { token } = action.payload;
      applyCredentials(state, token);
    },
    clearCredentials: (state) => {
      removeCredentials(state);
    },
    clearError: (state) => {
      state.error = null;
    },
    authenticate: (state, action: PayloadAction<AuthResponse>) => {
      const { token } = action.payload;
      applyCredentials(state, token);
      state.status = 'authenticated';
      state.error = null;
    },
    unauthenticate: (state) => {
      removeCredentials(state);
      state.status = 'unauthenticated';
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // User login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { payload } = action;
        if (isSuccessResponse<AuthResponse>(payload)) {
          const { token } = payload.data;
          applyCredentials(state, token);
        } else if (isErrorResponse(payload)) {
          state.status = 'unauthenticated';
          state.error = payload.error?.details?.[0]?.message || payload.message || 'Login failed';
        }
        state.isLoading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      // register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        const payload = action.payload;
        if (isSuccessResponse(payload)) {
        } else if (isErrorResponse(payload)) {
          state.status = 'unauthenticated';
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'Registration failed';
        }
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      // verify
      .addCase(verify.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify.fulfilled, (state, action) => {
        const payload = action.payload;
        if (isSuccessResponse<AuthResponse>(payload)) {
          const { token } = payload.data;
          applyCredentials(state, token);
        } else if (isErrorResponse(payload)) {
          state.status = 'unauthenticated';
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'Verification failed';
        }
        state.isLoading = false;
      })
      .addCase(verify.rejected, (state, action) => {
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      // resendOtp
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state, action) => {
        const payload = action.payload;
        if (!isSuccessResponse(payload)) {
          state.status = 'unauthenticated';
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'Resend OTP failed';
        }
        state.isLoading = false;
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      // logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        removeCredentials(state);
        state.isLoading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.status = 'unauthenticated';
        removeCredentials(state);
      })
      // refreshToken
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        const payload = action.payload;
        if (isSuccessResponse<AuthResponse>(payload)) {
          const { token } = payload.data;
          applyCredentials(state, token);
        } else if (isErrorResponse(payload)) {
          state.status = 'unauthenticated';
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'Token refresh failed';
        }
        state.isLoading = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        removeCredentials(state);
        state.isLoading = false;
        state.status = 'unauthenticated';
        state.error = action.payload as string;
      })
      .addCase(restoreCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(restoreCredentials.fulfilled, (state, action) => {
        const payload = action.payload;
        if (isSuccessResponse<AuthResponse>(payload)) {
          const { token } = payload.data;
          applyCredentials(state, token);
        } else if (isErrorResponse(payload)) {
          state.status = 'unauthenticated';
          state.error =
            payload.error?.details?.[0]?.message || payload.message || 'Token refresh failed';
          removeCredentials(state);
        }
        state.isLoading = false;
      })
      .addCase(restoreCredentials.rejected, (state, action) => {
        removeCredentials(state);
        state.status = 'unauthenticated';
        state.error = action.payload as string;
        state.isLoading = false;
      });
  },
});

// --- Selectors ---
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated' && !!state.auth.token && state.auth.user !== null;

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

export const { setCredentials, clearCredentials, clearError, reset } = authSlice.actions;
export default authSlice.reducer;

export function isSuccessResponse<T>(
  resp: unknown
): resp is { success: true; message: string; data: T } {
  return (
    typeof resp === 'object' &&
    resp !== null &&
    (resp as { success?: boolean }).success === true &&
    'data' in resp
  );
}
export function isErrorResponse(resp: unknown): resp is {
  success: false;
  message: string;
  error: { code: string; details?: { message?: string; field?: string }[] };
} {
  return (
    typeof resp === 'object' &&
    resp !== null &&
    (resp as { success?: boolean }).success === false &&
    'error' in resp
  );
}

function mapToAuthUser(data: any): AuthUser | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    email: data.email,
    role: data.role,
    userId: data.userId,
    username: data.username,
    avatar: data.avatar,
  };
}

export function applyCredentials(state: AuthState, token: string) {
  if (!state || !token) {
    removeCredentials(state);
    return;
  }

  const jwtToken = decodeJwt<any>(token);
  const user = mapToAuthUser(jwtToken);

  state.user = user;
  state.token = token;
  state.status = user ? 'authenticated' : 'unauthenticated';
  state.error = null;

  if (typeof window !== 'undefined') {
    saveToLocalStorage(authLocalStoreKey, token);
  }
}

export function removeCredentials(state: AuthState) {
  state.user = null;
  state.token = null;
  state.status = 'unauthenticated';
  state.error = null;
  if (typeof window !== 'undefined') {
    removeFromLocalStorage(authLocalStoreKey);
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const jwtToken = decodeJwt<any>(token);
    if (!jwtToken || typeof jwtToken.exp !== 'number') {
      return true;
    }
    return jwtToken.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { IUser } from '../../types/index.js';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpCooldown: number;
  devOtp?: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false,
  otpCooldown: 0,
};

export const checkAuthMe = createAsyncThunk('auth/checkMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.user;
  } catch (err: any) {
    localStorage.removeItem('mitahara_token');
    return rejectWithValue(err.response?.data?.message || 'Not authenticated');
  }
});

export const sendOtp = createAsyncThunk('auth/sendOtp', async (email: string, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send OTP');
  }
});

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.accessToken) {
        localStorage.setItem('mitahara_token', res.data.accessToken);
      }
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('mitahara_token');
    return null;
  } catch (err: any) {
    localStorage.removeItem('mitahara_token');
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<IUser>, { rejectWithValue }) => {
    try {
      const res = await api.put('/user/profile', profileData);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpCooldown = 0;
      state.devOtp = undefined;
    },
    decrementCooldown: (state) => {
      if (state.otpCooldown > 0) state.otpCooldown -= 1;
    },
  },
  extraReducers: (builder) => {
    // Check Me
    builder.addCase(checkAuthMe.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuthMe.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(checkAuthMe.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });

    // Send OTP
    builder.addCase(sendOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendOtp.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.otpSent = true;
      state.otpCooldown = action.payload.cooldownSeconds || 60;
      state.devOtp = action.payload.devOtp;
    });
    builder.addCase(sendOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify OTP
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.otpSent = false;
      state.devOtp = undefined;
      state.error = null;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    });
  },
});

export const { clearAuthError, resetOtpState, decrementCooldown } = authSlice.actions;
export default authSlice.reducer;

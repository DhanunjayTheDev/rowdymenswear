import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as authApi from '../lib/auth'

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await authApi.loginUser(email, password)
    return data
  } catch (err) { return rejectWithValue(err.message) }
})

export const register = createAsyncThunk('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const { data } = await authApi.registerUser(name, email, password)
    return data
  } catch (err) { return rejectWithValue(err.message) }
})

export const verifyRegisterOtp = createAsyncThunk('auth/verifyRegisterOtp', async ({ email, otp }, { rejectWithValue }) => {
  try {
    const { data } = await authApi.verifyRegisterOtp(email, otp)
    return data
  } catch (err) { return rejectWithValue(err.message) }
})

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.getMe()
    return data
  } catch (err) { return rejectWithValue(err.message) }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logoutUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null, initialized: false },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => { s.loading = true; s.error = null })
      .addCase(login.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.initialized = true })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(register.pending, (s) => { s.loading = true; s.error = null })
      .addCase(register.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.initialized = true })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(verifyRegisterOtp.pending, (s) => { s.loading = true; s.error = null })
      .addCase(verifyRegisterOtp.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.initialized = true })
      .addCase(verifyRegisterOtp.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchCurrentUser.pending, (s) => { s.loading = true })
      .addCase(fetchCurrentUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.initialized = true })
      .addCase(fetchCurrentUser.rejected, (s) => { s.loading = false; s.user = null; s.initialized = true })
      .addCase(logout.fulfilled, (s) => { s.user = null })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer

import apiClient from './apiClient'

export const loginUser = (email, password) =>
  apiClient.post('/auth/login', { email, password })

export const registerUser = (name, email, password) =>
  apiClient.post('/auth/register', { name, email, password })

export const sendRegisterOtp = (name, email, password) =>
  apiClient.post('/auth/register/send-otp', { name, email, password })

export const verifyRegisterOtp = (email, otp) =>
  apiClient.post('/auth/register/verify-otp', { email, otp })

export const logoutUser = () =>
  apiClient.post('/auth/logout')

export const getMe = () =>
  apiClient.get('/auth/me')

export const updateProfile = (data) =>
  apiClient.put('/auth/profile', data)

export const changePassword = (data) =>
  apiClient.put('/auth/change-password', data)

export const forgotPassword = (email) =>
  apiClient.post('/auth/forgot-password', { email })

export const resetPassword = (token, password) =>
  apiClient.post(`/auth/reset-password/${token}`, { password })

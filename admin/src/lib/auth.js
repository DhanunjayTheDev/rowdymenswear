import apiClient from './apiClient'

export const loginUser = (email, password) =>
  apiClient.post('/auth/login', { email, password })

export const logoutUser = () =>
  apiClient.post('/auth/logout')

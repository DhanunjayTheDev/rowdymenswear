import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../lib/apiClient'

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/products', { params })
    return data
  } catch (err) { return rejectWithValue(err.message) }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get(`/products/${id}`)
    return data.product
  } catch (err) { return rejectWithValue(err.message) }
})

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], product: null, pagination: null, loading: false, error: null },
  reducers: { clearProduct: (s) => { s.product = null } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchProducts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.products; s.pagination = a.payload.pagination })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchProduct.pending, (s) => { s.loading = true })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.product = a.payload })
      .addCase(fetchProduct.rejected, (s, a) => { s.loading = false; s.error = a.payload })
  },
})

export const { clearProduct } = productsSlice.actions
export default productsSlice.reducer

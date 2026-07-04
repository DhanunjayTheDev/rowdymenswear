import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../lib/apiClient'

const GUEST_WISHLIST_KEY = 'rowdy_guest_wishlist'

const loadGuestWishlist = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY)) || [] } catch { return [] }
}

const saveGuestWishlist = (products) => {
  try { localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(products)) } catch {}
}

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/wishlist')
    return data.wishlist
  } catch (err) { return rejectWithValue(err.message) }
})

export const addToWishlistAsync = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/wishlist', { productId })
    return data.wishlist
  } catch (err) { return rejectWithValue(err.message) }
})

export const removeFromWishlistAsync = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.delete(`/wishlist/${productId}`)
    return data.wishlist
  } catch (err) { return rejectWithValue(err.message) }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false },
  reducers: {
    hydrateGuestWishlist: (s) => { s.products = loadGuestWishlist() },
    guestToggle: (s, a) => {
      const product = a.payload
      const exists = s.products.some(p => p._id === product._id)
      s.products = exists ? s.products.filter(p => p._id !== product._id) : [...s.products, product]
      saveGuestWishlist(s.products)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.products = a.payload.products || [] })
      .addCase(addToWishlistAsync.fulfilled, (s, a) => { s.products = a.payload.products || [] })
      .addCase(removeFromWishlistAsync.fulfilled, (s, a) => { s.products = a.payload.products || [] })
  },
})

export const { hydrateGuestWishlist, guestToggle } = wishlistSlice.actions
export default wishlistSlice.reducer

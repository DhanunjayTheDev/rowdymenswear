import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
  try {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart(), coupon: null, discount: 0 },
  reducers: {
    addToCart: (state, action) => {
      const { product, size, quantity = 1 } = action.payload
      const existing = state.items.find(i => i.product._id === product._id && i.size === size)
      if (existing) {
        existing.quantity += quantity
      } else {
        state.items.push({ product: { ...product }, size, quantity })
      }
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    updateQuantity: (state, action) => {
      const { productId, size, quantity } = action.payload
      const item = state.items.find(i => i.product._id === productId && i.size === size)
      if (item) item.quantity = quantity
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    removeFromCart: (state, action) => {
      const { productId, size } = action.payload
      state.items = state.items.filter(i => !(i.product._id === productId && i.size === size))
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    clearCart: (state) => {
      state.items = []
      state.coupon = null
      state.discount = 0
      localStorage.removeItem('cart')
    },
    setCoupon: (state, action) => {
      state.coupon = action.payload.coupon
      state.discount = action.payload.discount
    },
    removeCoupon: (state) => {
      state.coupon = null
      state.discount = 0
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, clearCart, setCoupon, removeCoupon } = cartSlice.actions
export default cartSlice.reducer

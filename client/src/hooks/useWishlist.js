import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWishlist, addToWishlistAsync, removeFromWishlistAsync, hydrateGuestWishlist, guestToggle } from '../store/wishlistSlice'

export default function useWishlist() {
  const dispatch = useDispatch()
  const { products, loading } = useSelector(s => s.wishlist)
  const user = useSelector(s => s.auth.user)

  useEffect(() => {
    if (user) dispatch(fetchWishlist())
    else dispatch(hydrateGuestWishlist())
  }, [dispatch, user])

  const isInWishlist = (productId) => products.some(p => p._id === productId)

  const remove = (productId) => {
    if (user) {
      dispatch(removeFromWishlistAsync(productId))
    } else {
      const product = products.find(p => p._id === productId)
      if (product) dispatch(guestToggle(product))
    }
  }

  const add = (product) => {
    if (isInWishlist(product._id)) return
    if (user) {
      dispatch(addToWishlistAsync(product._id))
    } else {
      dispatch(guestToggle(product))
    }
  }

  const toggle = (product) => {
    if (isInWishlist(product._id)) {
      remove(product._id)
    } else {
      add(product)
    }
  }

  return { products, loading, isInWishlist, toggle, remove, add }
}

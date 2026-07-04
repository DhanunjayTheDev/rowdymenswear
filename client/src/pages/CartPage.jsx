import { Link } from 'react-router-dom'
import useCart from '../hooks/useCart'
import useWishlist from '../hooks/useWishlist'
import toast from 'react-hot-toast'
import CouponInput from '../components/CouponInput'
import { HiMinus, HiPlus, HiTrash, HiArrowLeft, HiShoppingBag, HiHeart } from 'react-icons/hi'

export default function CartPage() {
  const { items, subtotal, shippingCost, discount, total, update, remove } = useCart()
  const { add: addToWishlist } = useWishlist()

  const moveToWishlist = (item) => {
    addToWishlist(item.product)
    remove(item.product._id, item.size)
    toast.success('Moved to wishlist!')
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiShoppingBag size={36} className="text-gray-400" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Bag is Empty</h1>
        <p className="text-gray-500 text-sm mb-8">Looks like you haven't added anything yet</p>
        <Link to="/collection" className="inline-flex items-center gap-2 bg-brand-black text-white px-8 py-4 rounded-2xl font-semibold text-sm btn-press">
          <HiArrowLeft size={16} /> Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 max-w-3xl lg:max-w-5xl mx-auto page-enter">
      <h1 className="font-heading text-2xl font-bold mb-6">Shopping Bag ({items.length})</h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="space-y-4 lg:col-span-2">
        {items.map((item, idx) => (
          <div key={`${item.product._id}-${item.size}-${idx}`} className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
              <img src={item.product.images?.[0] || '/placeholder.png'} alt={item.product.name}
                className="w-24 lg:w-28 lg:h-28 object-cover rounded-xl" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.product.slug}`} className="font-semibold text-sm hover:text-primary-600 transition-colors line-clamp-2">
                {item.product.name}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
              <p className="font-bold text-primary-600 mt-1">₹{item.product.salePrice?.toLocaleString('en-IN')}</p>

              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center bg-gray-100 rounded-xl">
                  <button onClick={() => item.quantity > 1 && update(item.product._id, item.size, item.quantity - 1)}
                    className="p-2 hover:text-primary-600 btn-press"><HiMinus size={14} /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => update(item.product._id, item.size, item.quantity + 1)}
                    className="p-2 hover:text-primary-600 btn-press"><HiPlus size={14} /></button>
                </div>
                <button onClick={() => moveToWishlist(item)} title="Move to wishlist"
                  className="ml-auto p-2.5 text-gray-400 hover:text-primary-600 hover:bg-red-50 rounded-xl transition-colors btn-press">
                  <HiHeart size={16} />
                </button>
                <button onClick={() => remove(item.product._id, item.size)} title="Remove from bag"
                  className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors btn-press">
                  <HiTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6 lg:mt-0 lg:sticky lg:top-20 h-fit space-y-3">
        <h2 className="font-heading text-lg font-bold">Order Summary</h2>
        <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span></div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{shippingCost === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingCost}`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="font-medium text-green-600">-₹{discount.toLocaleString('en-IN')}</span></div>
        )}
        <CouponInput subtotal={subtotal} />
        <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
        <Link to="/checkout" className="block w-full bg-brand-black hover:bg-gray-800 text-white text-center py-4 rounded-2xl font-semibold text-sm btn-press transition-colors mt-2 shadow-lg shadow-black/10">
          Checkout ₹{total.toLocaleString('en-IN')}
        </Link>
      </div>
    </div>
    </div>
  )
}

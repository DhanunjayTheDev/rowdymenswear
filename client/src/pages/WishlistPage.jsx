import { Link } from 'react-router-dom'
import useWishlist from '../hooks/useWishlist'
import useCart from '../hooks/useCart'
import toast from 'react-hot-toast'
import { HiHeart, HiShoppingCart, HiTrash, HiArrowLeft, HiArrowRight, HiX } from 'react-icons/hi'

export default function WishlistPage() {
  const { products, remove } = useWishlist()
  const { add } = useCart()

  const moveToCart = (product) => {
    const size = product.sizes?.find(s => s.stock > 0)?.size
    if (!size) return toast.error('Out of stock')
    add(product, size)
    toast.success('Moved to bag!')
  }

  const handleRemove = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    remove(id)
    toast('Removed from wishlist')
  }

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto page-enter">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Wishlist</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} {products.length === 1 ? 'item' : 'items'} saved</p>
        </div>
        {products.length > 0 && (
          <Link to="/collection" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors">
            Keep Shopping <HiArrowRight size={16} />
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiHeart size={36} className="text-gray-300" />
          </div>
          <p className="font-medium text-gray-900 mb-1">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 mb-6">Save items you love here</p>
          <Link to="/collection" className="inline-flex items-center gap-2 bg-brand-black text-white px-8 py-3.5 rounded-2xl font-semibold text-sm btn-press">
            <HiArrowLeft size={16} /> Explore
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(p => {
            const inStock = p.sizes?.some(s => s.stock > 0)
            return (
              <Link key={p._id} to={`/product/${p.slug}`} className="group block card-hover">
                <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                  <img src={p.images?.[0] || '/placeholder.png'} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />

                  {!inStock && (
                    <span className="absolute top-3 left-3 bg-black/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
                      Sold Out
                    </span>
                  )}

                  <button onClick={(e) => handleRemove(e, p._id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/90 text-gray-500 hover:text-red-600 shadow-lg backdrop-blur-sm transition-colors"
                    title="Remove from wishlist">
                    <HiX size={16} />
                  </button>

                  {p.offerPercent > 0 && (
                    <span className="absolute bottom-3 left-3 bg-primary-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
                      -{p.offerPercent}%
                    </span>
                  )}
                </div>

                <div className="pt-3 px-0.5 space-y-1">
                  <h3 className="font-medium text-sm text-gray-900 leading-tight line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-primary-600">₹{p.salePrice?.toLocaleString('en-IN')}</span>
                    {p.mrp > p.salePrice && (
                      <span className="text-xs text-gray-400 line-through">₹{p.mrp?.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveToCart(p) }}
                      disabled={!inStock}
                      className="flex-1 bg-brand-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 btn-press transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <HiShoppingCart size={14} /> {inStock ? 'Move to Bag' : 'Sold Out'}
                    </button>
                    <button
                      onClick={(e) => handleRemove(e, p._id)}
                      className="p-2.5 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors btn-press flex-shrink-0">
                      <HiTrash size={14} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

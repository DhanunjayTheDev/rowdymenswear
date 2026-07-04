import { Link } from 'react-router-dom'
import { HiHeart, HiShoppingCart, HiStar } from 'react-icons/hi'
import useCart from '../hooks/useCart'
import useWishlist from '../hooks/useWishlist'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { add } = useCart()
  const { products: wishlistProducts, toggle } = useWishlist()
  const inWishlist = wishlistProducts.some(p => p._id === product._id)

  const availSize = product.sizes?.find(s => s.stock > 0)?.size || 'M'
  const inStock = product.sizes?.some(s => s.stock > 0)

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return toast.error('Out of stock')
    add(product, availSize)
    toast.success('Added to cart!')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(product)
  }

  const swatches = product.color
    ? [{ colorHex: product.colorHex }, ...(product.variants || []).map(v => ({ colorHex: v.colorHex }))].slice(0, 4)
    : []

  return (
    <Link to={`/product/${product.slug}`} className="group block card-hover">
      <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.offerPercent > 0 && (
            <span className="bg-primary-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
              -{product.offerPercent}%
            </span>
          )}
          {!inStock && (
            <span className="bg-black/80 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button onClick={handleWishlist} className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-sm ${
          inWishlist ? 'bg-primary-600 text-white' : 'bg-white/90 text-gray-500 hover:text-primary-600'
        }`}>
          <HiHeart size={16} className={inWishlist ? 'fill-current' : ''} />
        </button>

        {/* Quick add button */}
        {inStock && (
          <button onClick={handleAdd} className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg hover:bg-primary-600 hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <HiShoppingCart size={18} />
          </button>
        )}
      </div>

      <div className="pt-3 px-0.5 space-y-1">
        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1">
            <HiStar size={12} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[11px] font-medium text-gray-500">{product.averageRating}</span>
            <span className="text-[11px] text-gray-300">({product.totalReviews})</span>
          </div>
        )}

        {/* Name */}
        <h3 className="font-medium text-sm text-gray-900 leading-tight line-clamp-2">{product.name}</h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-primary-600">₹{product.salePrice?.toLocaleString('en-IN')}</span>
          {product.mrp > product.salePrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Available colors */}
        {swatches.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {swatches.map((s, i) => (
              <span key={i} className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" style={{ background: s.colorHex || '#ccc' }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

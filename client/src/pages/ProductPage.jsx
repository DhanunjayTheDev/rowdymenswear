import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import useCart from '../hooks/useCart'
import ReviewList from '../components/ReviewList'
import { HiShoppingCart, HiHeart, HiMinus, HiPlus, HiStar, HiArrowLeft, HiCheck, HiShieldCheck, HiTruck, HiRefresh, HiTag } from 'react-icons/hi'
import toast from 'react-hot-toast'
import useWishlist from '../hooks/useWishlist'
import useReveal from '../hooks/useReveal'

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [activeVariantId, setActiveVariantId] = useState(null)
  const [reviews, setReviews] = useState([])
  const [size, setSize] = useState('')
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const { add } = useCart()
  const { toggle, isInWishlist } = useWishlist()
  const infoRef = useReveal()
  const reviewRef = useReveal()

  useEffect(() => {
    setLoading(true)
    setImgIdx(0)
    apiClient.get(`/products/slug/${slug}`).then(({ data }) => {
      setProduct(data.product)
      setActiveVariantId(data.activeVariantId)
      const activeVariant = data.product.variants?.find(v => v._id === data.activeVariantId)
      const activeSizes = activeVariant ? activeVariant.sizes : data.product.sizes
      const first = activeSizes?.find(s => s.stock > 0)
      setSize(first ? first.size : '')
      return apiClient.get(`/reviews/product/${data.product._id}`)
    }).then(({ data }) => {
      setReviews(data.reviews)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  const handleReviewsUpdate = async () => {
    const [prod, rev] = await Promise.all([
      apiClient.get(`/products/slug/${slug}`),
      apiClient.get(`/reviews/product/${product._id}`),
    ])
    setProduct(prod.data.product)
    setReviews(rev.data.reviews)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square skeleton rounded-3xl" />
        <div className="space-y-6">
          <div className="h-8 skeleton w-3/4" />
          <div className="h-6 skeleton w-1/4" />
          <div className="h-4 skeleton w-full" />
          <div className="h-4 skeleton w-5/6" />
          <div className="h-12 skeleton w-full" />
          <div className="h-12 skeleton w-2/3" />
        </div>
      </div>
    </div>
  )
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>

  const activeVariant = product.variants?.find(v => v._id === activeVariantId) || null
  const displayImages = activeVariant?.images?.length ? activeVariant.images : product.images
  const displaySizes = activeVariant ? activeVariant.sizes : product.sizes
  const displayColor = activeVariant?.color || product.color
  const displayColorHex = activeVariant?.colorHex || product.colorHex

  const colorSwatches = product.color
    ? [
        { key: 'base', color: product.color, colorHex: product.colorHex, slug: product.slug, active: !activeVariantId },
        ...(product.variants || []).map(v => ({ key: v._id, color: v.color, colorHex: v.colorHex, slug: v.slug, active: v._id === activeVariantId })),
      ]
    : []

  const handleAdd = () => {
    if (!size) return toast.error('Select a size')
    add({ ...product, slug: activeVariant?.slug || product.slug, images: displayImages, color: displayColor, colorHex: displayColorHex }, size, qty)
    toast.success('Added to bag!')
  }

  const inStock = displaySizes?.find(s => s.size === size)?.stock > 0
  const totalStock = displaySizes?.reduce((s, sz) => s + sz.stock, 0) || 0

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collection" className="hover:text-primary-600 transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div>
            <div className="relative bg-gray-50 rounded-3xl overflow-hidden aspect-square">
              <img src={displayImages?.[imgIdx] || '/placeholder.png'} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              {product.offerPercent > 0 && (
                <span className="absolute top-4 left-4 bg-primary-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-1.5">
                  <HiTag size={14} /> {product.offerPercent}% OFF
                </span>
              )}
              <Link to="/collection" className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg btn-press hover:bg-white transition-colors">
                <HiArrowLeft size={20} className="text-gray-800" />
              </Link>
            </div>
            {/* Thumbnails */}
            {displayImages?.length > 1 && (
              <div className="flex gap-3 mt-4">
                {displayImages.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all btn-press ${
                      i === imgIdx ? 'border-brand-black shadow-md' : 'border-gray-200 hover:border-gray-400'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div ref={infoRef} className="reveal reveal-right space-y-6">
            {/* Category tag */}
            {product.category && (
              <Link to={`/collection?category=${product.category._id}`}
                className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                {product.category.name}
              </Link>
            )}

            {/* Name + Rating */}
            <div>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold leading-tight">{product.name}</h1>
              {product.averageRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <HiStar key={i} size={16} className={i <= Math.round(product.averageRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="font-semibold text-sm">{product.averageRating}</span>
                  <span className="text-gray-400 text-sm">({product.totalReviews} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="font-bold text-3xl text-primary-600">₹{product.salePrice?.toLocaleString('en-IN')}</span>
              {product.mrp > product.salePrice && (
                <span className="text-lg text-gray-400 line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
              )}
              {product.offerPercent > 0 && (
                <span className="text-sm font-semibold text-green-600">Save {product.offerPercent}%</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Color variant swatches */}
            {colorSwatches.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-3">Color: <span className="font-normal text-gray-500">{displayColor}</span></h3>
                <div className="flex flex-wrap gap-2.5">
                  {colorSwatches.map(sw => (
                    <button key={sw.key} onClick={() => !sw.active && navigate(`/product/${sw.slug}`)} title={sw.color}
                      className={`w-10 h-10 rounded-full border-2 transition-all btn-press flex-shrink-0 ${sw.active ? 'border-brand-black shadow-md scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                      style={{ background: sw.colorHex || '#ccc' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Size</h3>
                <button onClick={() => setShowSizeChart(!showSizeChart)}
                  className="text-xs font-medium text-primary-600 hover:underline">
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {displaySizes?.map(s => (
                  <button key={s.size} onClick={() => s.stock > 0 && setSize(s.size)}
                    disabled={s.stock === 0}
                    className={`h-12 min-w-[48px] px-5 rounded-xl text-sm font-medium border transition-all btn-press ${
                      size === s.size ? 'bg-brand-black text-white border-brand-black shadow-md' :
                      s.stock === 0 ? 'opacity-30 line-through cursor-not-allowed bg-gray-50 border-gray-200' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}>
                    {s.size}
                  </button>
                ))}
              </div>
              {/* Size chart modal */}
              {showSizeChart && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-8" onClick={() => setShowSizeChart(false)}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative bg-white rounded-3xl p-8 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                    <h3 className="font-heading text-xl font-bold mb-4">Size Guide</h3>
                    <table className="w-full text-sm">
                      <thead><tr className="border-b"><th className="text-left py-2 font-medium">Size</th><th className="text-left py-2 font-medium">Chest (in)</th><th className="text-left py-2 font-medium">Length (in)</th></tr></thead>
                      <tbody>
                        {[['S', '38', '28'], ['M', '40', '29'], ['L', '42', '30'], ['XL', '44', '31'], ['XXL', '46', '32']].map(([s, c, l]) => (
                          <tr key={s} className="border-b last:border-0"><td className="py-2 font-medium">{s}</td><td className="py-2 text-gray-600">{c}</td><td className="py-2 text-gray-600">{l}</td></tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400 mt-4">* These are approximate measurements. Fit may vary by style.</p>
                    <button onClick={() => setShowSizeChart(false)} className="w-full mt-6 bg-gray-100 py-3 rounded-2xl text-sm font-medium hover:bg-gray-200 btn-press">Close</button>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-2xl">
                <button onClick={() => qty > 1 && setQty(q => q - 1)} className="p-4 hover:text-primary-600 transition-colors btn-press"><HiMinus size={18} /></button>
                <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-4 hover:text-primary-600 transition-colors btn-press"><HiPlus size={18} /></button>
              </div>
              <button onClick={handleAdd} disabled={!inStock}
                className="flex-1 bg-brand-black hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/10 group">
                <HiShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                {inStock ? 'Add to Bag' : 'Sold Out'}
              </button>
              <button onClick={() => toggle(product)}
                className={`w-14 h-14 border rounded-2xl flex items-center justify-center transition-all btn-press ${
                  isInWishlist(product._id) ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}>
                <HiHeart size={20} className={isInWishlist(product._id) ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Stock info */}
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${totalStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              {totalStock > 0 ? `${totalStock} units in stock` : 'Out of stock'}
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: HiTruck, label: 'Free Shipping', sub: 'Above ₹499' },
                { icon: HiRefresh, label: 'Easy Returns', sub: '30 days' },
                { icon: HiShieldCheck, label: 'Secure Checkout', sub: '100% safe' },
              ].map((b, i) => (
                <div key={i} className="text-center py-4 px-2 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <b.icon size={20} className="mx-auto text-primary-600 mb-1" />
                  <p className="text-xs font-semibold text-gray-900">{b.label}</p>
                  <p className="text-[10px] text-gray-500">{b.sub}</p>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(t => (
                  <Link key={t} to={`/collection?tags=${t}`}
                    className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Specifications */}
            {(displayColor || product.fit || product.fabric || product.customAttributes?.length > 0) && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-semibold text-sm mb-3">Specifications</h3>
                <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
                  {displayColor && (
                    <>
                      <dt className="text-gray-500">Color</dt>
                      <dd className="text-gray-900 font-medium flex items-center gap-1.5">
                        {displayColorHex && <span className="w-3 h-3 rounded-full border border-gray-300" style={{ background: displayColorHex }} />}
                        {displayColor}
                      </dd>
                    </>
                  )}
                  {product.fit && (<><dt className="text-gray-500">Fit</dt><dd className="text-gray-900 font-medium">{product.fit}</dd></>)}
                  {product.fabric && (<><dt className="text-gray-500">Fabric</dt><dd className="text-gray-900 font-medium">{product.fabric}</dd></>)}
                  {product.customAttributes?.map((a, i) => (
                    <dt key={`k-${i}`} className="contents">
                      <span className="text-gray-500">{a.key}</span>
                      <span className="text-gray-900 font-medium">{a.value}</span>
                    </dt>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div ref={reviewRef} className="reveal reveal-up mt-16 mb-12 max-w-3xl">
          <ReviewList productId={product._id} reviews={reviews} averageRating={product.averageRating} totalReviews={product.totalReviews} onUpdate={handleReviewsUpdate} />
        </div>
      </div>
    </div>
  )
}

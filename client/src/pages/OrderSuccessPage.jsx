import { useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { HiArrowRight, HiShoppingBag } from 'react-icons/hi'

const REDIRECT_DELAY = 3000

export default function OrderSuccessPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const timeoutRef = useRef(null)

  useEffect(() => {
    timeoutRef.current = setTimeout(() => navigate(`/order/${id}`), REDIRECT_DELAY)
    return () => clearTimeout(timeoutRef.current)
  }, [id, navigate])

  const goToOrder = () => {
    clearTimeout(timeoutRef.current)
    navigate(`/order/${id}`)
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-16 text-center page-enter">
      <div className="relative w-24 h-24 mb-6 checkmark-pop">
        <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping" />
        <svg className="relative" width="96" height="96" viewBox="0 0 96 96" fill="none">
          <circle className="checkmark-circle" cx="48" cy="48" r="44" stroke="#16a34a" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path className="checkmark-tick" d="M30 50 L43 63 L68 34" stroke="#16a34a" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="font-heading text-3xl font-bold">Order Placed!</h1>
      <p className="text-gray-500 text-sm mt-2 max-w-sm">
        Thanks for shopping with us. Your order is confirmed and on its way to being packed.
      </p>
      <p className="text-xs text-gray-400 mt-1 font-mono">#{id?.slice(-8).toUpperCase()}</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm">
        <button onClick={goToOrder}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-black hover:bg-gray-800 text-white px-6 py-3.5 rounded-2xl font-semibold text-sm btn-press transition-all shadow-lg shadow-black/10 group">
          View Order <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        <Link to="/collection"
          className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-900 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all btn-press">
          <HiShoppingBag size={16} /> Keep Shopping
        </Link>
      </div>

      <p className="text-xs text-gray-400 mt-6">Redirecting to your order in a few seconds...</p>
    </div>
  )
}

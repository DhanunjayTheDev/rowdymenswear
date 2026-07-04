import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import apiClient from '../lib/apiClient'
import { setCoupon, removeCoupon } from '../store/cartSlice'
import toast from 'react-hot-toast'
import { HiTag, HiX } from 'react-icons/hi'

export default function CouponInput({ subtotal }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const coupon = useSelector(s => s.cart.coupon)
  const discount = useSelector(s => s.cart.discount)

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    try {
      const { data } = await apiClient.post('/coupons/validate', { code: code.trim(), subtotal })
      if (data.valid) {
        dispatch(setCoupon({ coupon: data.coupon, discount: data.discount }))
        toast.success(`You save ₹${data.discount}!`)
      }
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const handleRemove = () => {
    dispatch(removeCoupon())
    setCode('')
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-3 border border-green-200">
        <div className="flex items-center gap-2">
          <HiTag className="text-green-600" size={18} />
          <div>
            <p className="font-semibold text-sm text-green-700">{coupon.code}</p>
            <p className="text-xs text-green-600">-₹{discount} discount applied</p>
          </div>
        </div>
        <button onClick={handleRemove} className="p-1.5 hover:bg-green-100 rounded-full transition-colors">
          <HiX size={16} className="text-green-600" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <HiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
      </div>
      <button onClick={handleApply} disabled={loading || !code.trim()}
        className="px-5 bg-brand-black text-white rounded-2xl text-sm font-medium btn-press disabled:opacity-40 transition-colors">
        {loading ? '..' : 'Apply'}
      </button>
    </div>
  )
}

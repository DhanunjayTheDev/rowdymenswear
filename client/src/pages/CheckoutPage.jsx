import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useCart from '../hooks/useCart'
import { useSelector, useDispatch } from 'react-redux'
import apiClient from '../lib/apiClient'
import { clearCart } from '../store/cartSlice'
import toast from 'react-hot-toast'
import { HiArrowLeft, HiCreditCard, HiCash, HiCheckCircle } from 'react-icons/hi'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, subtotal, discount, shippingCost, total, coupon } = useCart()
  const { user, initialized } = useSelector(s => s.auth)
  const [processing, setProcessing] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [step, setStep] = useState(1)
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '', phone: '', pincode: '', addressLine1: '', addressLine2: '', city: '', state: '',
  })
  const orderPlacedRef = useRef(false)

  useEffect(() => {
    if (!initialized) return
    if (!user) { navigate('/login?redirect=checkout'); return }
    if (items.length === 0 && !orderPlacedRef.current) navigate('/cart')
  }, [initialized, user, items.length, navigate])

  if (!initialized) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-600 border-t-transparent" /></div>
  }
  if (!user || items.length === 0) return null

  const isValidAddress = (addr) => addr.fullName && addr.phone && addr.pincode && addr.addressLine1 && addr.city && addr.state

  const handlePlaceOrder = async () => {
    const address = selectedAddress || newAddress
    if (!isValidAddress(address)) return toast.error('Please fill in all address fields')
    setProcessing(true)
    try {
      const { data } = await apiClient.post('/orders', {
        items: items.map(i => ({ product: i.product._id, size: i.size, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || undefined,
      })
      if (!data.paymentRequired) {
        orderPlacedRef.current = true
        dispatch(clearCart())
        navigate(`/order-success/${data.order._id}`)
      } else if (data.gateway === 'razorpay') {
        handleRazorpay(data)
      } else if (data.gateway === 'stripe') {
        window.location.href = data.url
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order') }
    finally { setProcessing(false) }
  }

  const handleRazorpay = (orderData) => {
    const rzp = new window.Razorpay({
      key: orderData.razorpayKeyId,
      amount: orderData.amount,
      currency: 'INR',
      name: 'Rowdy mens Wear',
      order_id: orderData.razorpayOrderId,
      handler: async (res) => {
        try {
          await apiClient.post('/orders/verify-payment', {
            razorpay_order_id: res.razorpay_order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
          })
          orderPlacedRef.current = true
          dispatch(clearCart())
          navigate(`/order-success/${orderData.order._id}`)
        } catch { toast.error('Payment verification failed') }
      },
      prefill: { name: user.name, email: user.email, contact: address.phone },
      theme: { color: '#dc2626' },
    })
    rzp.open()
  }

  const address = selectedAddress || newAddress

  return (
    <div className="px-4 py-6 max-w-3xl lg:max-w-5xl mx-auto page-enter">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <HiArrowLeft size={16} /> Back to cart
      </button>
      <h1 className="font-heading text-2xl font-bold mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= s ? 'bg-brand-black text-white' : 'bg-gray-100 text-gray-400'
            }`}>{step > s ? <HiCheckCircle size={20} /> : s}</div>
            <span className={`text-xs font-medium ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
              {s === 1 ? 'Address' : 'Payment'}
            </span>
            {s < 2 && <div className={`w-12 h-0.5 ${step > 1 ? 'bg-brand-black' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h2 className="font-heading text-lg font-bold">Shipping Address</h2>
          {user?.addresses?.length > 0 && (
            <div>
              <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
                {user.addresses.map((a, i) => (
                  <label key={a._id || i} className={`block p-4 border rounded-2xl cursor-pointer transition-all ${
                    selectedAddress?._id === a._id ? 'border-brand-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="radio" name="addr" checked={selectedAddress?._id === a._id} onChange={() => setSelectedAddress(a)} className="sr-only" />
                    <p className="font-semibold text-sm">{a.fullName} · {a.phone}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.addressLine1}, {a.city}, {a.state} - {a.pincode}</p>
                  </label>
                ))}
              </div>
              <button onClick={() => setSelectedAddress(null)} className="mt-2 text-sm font-medium text-primary-600 hover:underline">+ Deliver to new address</button>
            </div>
          )}
          {!selectedAddress && (
            <div className="grid grid-cols-2 gap-3">
              <input className="col-span-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
              <input className="px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
              <input className="px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
              <input className="col-span-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Address Line 1" value={newAddress.addressLine1} onChange={e => setNewAddress({...newAddress, addressLine1: e.target.value})} />
              <input className="col-span-2 px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Address Line 2 (optional)" value={newAddress.addressLine2} onChange={e => setNewAddress({...newAddress, addressLine2: e.target.value})} />
              <input className="px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
              <input className="px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
            </div>
          )}
          <button onClick={() => setStep(2)} className="w-full bg-brand-black text-white py-4 rounded-2xl font-semibold text-sm btn-press mt-2">
            Continue to Payment
          </button>
        </div>
      )}

      {/* Step 2: Payment + Summary */}
      {step === 2 && (
        <div className="space-y-6 lg:grid lg:grid-cols-5 lg:gap-6 lg:space-y-0">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3 lg:col-span-3 lg:self-start">
            <h2 className="font-heading text-lg font-bold">Payment</h2>
            {[
              { value: 'COD', label: 'Cash on Delivery', icon: HiCash, desc: 'Pay when you receive' },
              { value: 'ONLINE', label: 'Online Payment', icon: HiCreditCard, desc: 'Razorpay / UPI / Card' },
            ].map(p => (
              <label key={p.value} className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all btn-press ${
                paymentMethod === p.value ? 'border-brand-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input type="radio" name="payment" value={p.value} checked={paymentMethod === p.value} onChange={() => setPaymentMethod(p.value)} className="sr-only" />
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <p.icon size={20} className="text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === p.value ? 'border-brand-black' : 'border-gray-300'
                }`}>
                  {paymentMethod === p.value && <div className="w-3 h-3 bg-brand-black rounded-full" />}
                </div>
              </label>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3 lg:col-span-2 lg:self-start lg:sticky lg:top-20">
            <h2 className="font-heading text-lg font-bold">Order Summary</h2>
            <div className="max-h-40 lg:max-h-60 overflow-y-auto space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img src={item.product.images?.[0] || ''} alt="" className="w-14 h-14 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} · Size: {item.size}</p>
                    <p className="text-sm font-semibold">₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString('en-IN')}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-medium">{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <button onClick={handlePlaceOrder} disabled={processing}
            className="w-full bg-brand-black hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-sm btn-press transition-colors disabled:opacity-50 shadow-lg shadow-black/10">
            {processing ? 'Processing...' : `Place Order ₹${total.toLocaleString('en-IN')}`}
          </button>
        </div>
      )}
    </div>
  )
}

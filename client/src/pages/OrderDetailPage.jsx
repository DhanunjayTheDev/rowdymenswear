import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import { HiArrowLeft, HiCheckCircle, HiClock, HiTruck, HiDownload } from 'react-icons/hi'
import generateInvoice from '../utils/generateInvoice'
import ConfirmDialog from '../components/ConfirmDialog'

const STEPS = [
  { key: 'PLACED', icon: HiClock, label: 'Placed' },
  { key: 'CONFIRMED', icon: HiCheckCircle, label: 'Confirmed' },
  { key: 'SHIPPED', icon: HiTruck, label: 'Shipped' },
  { key: 'DELIVERED', icon: HiCheckCircle, label: 'Delivered' },
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReturnDialog, setShowReturnDialog] = useState(false)

  useEffect(() => {
    apiClient.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleReturn = async (reason) => {
    setShowReturnDialog(false)
    try {
      await apiClient.post(`/orders/${id}/return`, { reason })
      setOrder(prev => ({ ...prev, returnRequested: true }))
      toast.success('Return requested')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-600 border-t-transparent" /></div>
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>

  const currentIdx = STEPS.findIndex(s => s.key === order.orderStatus)

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <HiArrowLeft size={16} /> All Orders
        </Link>
        <button onClick={() => generateInvoice(order)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-black hover:bg-gray-800 px-4 py-2 rounded-xl transition-colors btn-press">
          <HiDownload size={16} /> Download Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <h1 className="font-heading text-xl font-bold">Order #{order._id.slice(-8)}</h1>
        <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        {/* Timeline */}
        <div className="flex items-center justify-between mt-6 mb-2">
          {STEPS.map((s, i) => {
            const done = i <= currentIdx
            const cancelled = order.orderStatus === 'CANCELLED'
            return (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  cancelled ? 'bg-red-100' : done ? 'bg-brand-black text-white shadow-md' : 'bg-gray-100 text-gray-400'
                }`}>
                  <s.icon size={18} className={done && !cancelled ? 'text-white' : ''} />
                </div>
                <p className={`text-[10px] font-medium mt-1.5 ${cancelled ? 'text-red-500' : done ? 'text-gray-900' : 'text-gray-400'}`}>
                  {cancelled && i === 0 ? 'Cancelled' : s.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <img src={item.image || '/placeholder.png'} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Size: {item.size} · Qty: {item.quantity}</p>
              <p className="font-bold text-sm mt-1">₹{item.price.toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary + Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2 text-sm">
          <h3 className="font-heading font-bold text-base">Summary</h3>
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.subtotal.toLocaleString('en-IN')}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toLocaleString('en-IN')}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>₹{order.total.toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Payment</span><span>{order.paymentMethod}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-orange-600'}>{order.paymentStatus}</span></div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1 text-sm">
          <h3 className="font-heading font-bold text-base">Shipping Address</h3>
          <p className="font-medium">{order.shippingAddress?.fullName}</p>
          <p className="text-gray-500">{order.shippingAddress?.addressLine1}</p>
          <p className="text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          <p className="text-gray-500">{order.shippingAddress?.phone}</p>
        </div>
      </div>

      {/* Return */}
      {order.orderStatus === 'DELIVERED' && !order.returnRequested && (
        <button onClick={() => setShowReturnDialog(true)} className="w-full mt-6 border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl text-sm font-semibold btn-press hover:border-gray-300 transition-colors">
          Request Return
        </button>
      )}
      {order.returnRequested && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="font-semibold text-sm text-green-700">Return Requested ✓</p>
          <p className="text-xs text-green-600 mt-1">We'll process your return shortly</p>
        </div>
      )}

      <ConfirmDialog
        open={showReturnDialog}
        title="Request a return"
        message="Tell us why you'd like to return this order."
        confirmLabel="Submit Request"
        requireInput
        inputPlaceholder="Reason for return..."
        onConfirm={handleReturn}
        onClose={() => setShowReturnDialog(false)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import { HiArrowRight } from 'react-icons/hi'

const STATUS_STYLES = {
  PLACED: 'bg-blue-100 text-blue-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/orders/my-orders').then(({ data }) => setOrders(data.orders)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary-600 border-t-transparent" /></div>

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      <h1 className="font-heading text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiShoppingBag size={36} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-900 mb-1">No orders yet</p>
          <p className="text-sm text-gray-500 mb-6">Your orders will appear here</p>
          <Link to="/collection" className="inline-flex items-center gap-2 bg-brand-black text-white px-8 py-3.5 rounded-2xl font-semibold text-sm btn-press">
            Shop Now <HiArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order._id} to={`/order/${order._id}`}
              className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono">#{order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`px-3 py-1 rounded-xl text-[10px] font-semibold ${STATUS_STYLES[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex gap-2">
                {order.items.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image || '/placeholder.png'} alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl bg-gray-100" />
                ))}
                {order.items.length > 4 && (
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-500 font-medium">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <span className="font-bold text-sm">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

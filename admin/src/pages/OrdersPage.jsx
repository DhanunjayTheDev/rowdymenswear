import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import { Eye, ShoppingBag, Clock, IndianRupee, Download, User, MapPin, CreditCard, Calendar, Package, XCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'
import Drawer from '../components/Drawer'
import generateInvoice from '../utils/generateInvoice'
import { DetailHero, Pill, DetailSection, DetailGrid, DetailField } from '../components/DetailView'

const STATUSES = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']
const STATUS_TONE = { PLACED: 'slate', CONFIRMED: 'blue', SHIPPED: 'amber', DELIVERED: 'green', CANCELLED: 'red' }
const PAYMENT_TONE = { PAID: 'green', FAILED: 'red', PENDING: 'amber' }

function StatusStepper({ current, onSelect }) {
  const cancelled = current === 'CANCELLED'
  const idx = FLOW.indexOf(current)
  return (
    <div className="flex items-start">
      {FLOW.map((s, i) => {
        const done = !cancelled && i < idx
        const active = !cancelled && i === idx
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => onSelect(s)}
              disabled={active}
              className={`flex flex-col items-center gap-1.5 flex-shrink-0 group ${active ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                cancelled ? 'bg-slate-100 text-slate-300' :
                active ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                done ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
              }`}>{done ? <Check size={13} /> : i + 1}</span>
              <span className={`text-[10px] font-medium whitespace-nowrap ${active ? 'text-primary-700' : cancelled ? 'text-slate-300' : 'text-slate-400'}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
            </button>
            {i < FLOW.length - 1 && <span className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full ${!cancelled && i < idx ? 'bg-primary-300' : 'bg-slate-100'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export default function OrdersPage() {
  const [urlParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(urlParams.get('status') || '')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refundTarget, setRefundTarget] = useState(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0 })

  const fetchOrders = async () => {
    try {
      const params = filter ? { status: filter } : {}
      const { data } = await apiClient.get('/orders/all', { params })
      setOrders(data.orders)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const { data } = await apiClient.get('/orders/all')
      const revenue = data.orders.filter(o => o.paymentStatus === 'PAID').reduce((s, o) => s + o.total, 0)
      const pending = data.orders.filter(o => o.orderStatus === 'PLACED').length
      setStats({ total: data.orders.length, pending, revenue })
    } catch { /* stats are non-critical */ }
  }

  useEffect(() => { fetchOrders() }, [filter])
  useEffect(() => { fetchStats() }, [])

  const handleStatusUpdate = async (orderId, orderStatus) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { orderStatus })
      fetchOrders()
      fetchStats()
      setSelectedOrder(prev => prev ? { ...prev, orderStatus } : null)
    } catch (err) { toast.error(err.message) }
  }

  const handleRefund = async () => {
    const orderId = refundTarget
    setRefundTarget(null)
    try {
      await apiClient.put(`/orders/${orderId}/status`, { refundProcessed: true })
      fetchOrders()
    } catch (err) { toast.error(err.message) }
  }

  const statCards = [
    { label: 'Total Orders', value: stats.total, icon: ShoppingBag, bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Revenue (Paid)', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, bg: 'bg-green-50', text: 'text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={20} className={s.text} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">{s.label}</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${!filter ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${filter === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Order</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Total</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Payment</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Date</th>
                <th className="text-right px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">#{o._id.slice(-8)}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{o.user?.name || 'N/A'}</td>
                  <td className="px-5 py-3 font-semibold text-slate-800">₹{o.total.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      o.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700' :
                      o.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>{o.paymentStatus}</span>
                  </td>
                  <td className="px-5 py-3"><Pill tone={STATUS_TONE[o.orderStatus] || 'slate'}>{o.orderStatus}</Pill></td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelectedOrder(o)} className="flex items-center gap-1.5 text-primary-600 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg ml-auto text-xs font-semibold transition-colors"><Eye size={14} /> View</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && !loading && (
                <tr><td colSpan={7} className="py-16 text-center">
                  <ShoppingBag size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No orders found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title=""
        footer={selectedOrder && (
          <div className="space-y-2">
            {selectedOrder.paymentStatus === 'PAID' && !selectedOrder.refundProcessed && (
              <button onClick={() => setRefundTarget(selectedOrder._id)} className="w-full bg-red-50 text-red-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
                Process Refund
              </button>
            )}
            <button onClick={() => generateInvoice(selectedOrder)} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
              <Download size={16} /> Download Invoice
            </button>
          </div>
        )}
      >
        {selectedOrder && (
          <div className="space-y-6 text-sm">
            <DetailHero
              leading={<div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0"><ShoppingBag size={26} /></div>}
              title={`Order #${selectedOrder._id.slice(-8).toUpperCase()}`}
              subtitle={new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              meta={<>
                <Pill dark tone={STATUS_TONE[selectedOrder.orderStatus] || 'slate'}>{selectedOrder.orderStatus}</Pill>
                <Pill dark tone={PAYMENT_TONE[selectedOrder.paymentStatus] || 'slate'}>{selectedOrder.paymentMethod} · {selectedOrder.paymentStatus}</Pill>
              </>}
            />

            <DetailSection icon={User} title="Customer">
              <DetailGrid>
                <DetailField label="Name" value={selectedOrder.user?.name || 'N/A'} />
                <DetailField label="Email" value={selectedOrder.user?.email || 'N/A'} />
              </DetailGrid>
            </DetailSection>

            <DetailSection icon={Package} title={`Items (${selectedOrder.items?.length || 0})`}>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5">
                    <img src={item.image || ''} alt={item.name} className="w-11 h-11 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                      <p className="text-slate-400 text-xs">Size {item.size} · Qty {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-slate-700 flex-shrink-0">₹{item.price}</span>
                  </div>
                ))}
              </div>
            </DetailSection>

            <DetailSection icon={CreditCard} title="Payment Summary">
              <div className="bg-slate-50 rounded-xl p-3.5 space-y-1.5">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount{selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ''}</span><span>-₹{selectedOrder.discount?.toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{selectedOrder.shippingCost > 0 ? `₹${selectedOrder.shippingCost}` : 'Free'}</span></div>
                <div className="flex justify-between font-bold text-slate-900 pt-1.5 mt-1.5 border-t border-slate-200"><span>Total</span><span>₹{selectedOrder.total.toLocaleString('en-IN')}</span></div>
              </div>
            </DetailSection>

            <DetailSection icon={MapPin} title="Shipping Address">
              <div className="bg-slate-50 rounded-xl p-3.5 text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800">{selectedOrder.shippingAddress?.fullName}</p>
                <p>{selectedOrder.shippingAddress?.addressLine1}{selectedOrder.shippingAddress?.addressLine2 ? `, ${selectedOrder.shippingAddress.addressLine2}` : ''}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                <p className="text-xs text-slate-400 mt-1">{selectedOrder.shippingAddress?.phone}</p>
              </div>
            </DetailSection>

            {selectedOrder.returnRequested && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100">
                <p className="font-semibold text-amber-800">Return requested</p>
                <p className="text-sm text-amber-700 mt-0.5">{selectedOrder.returnReason}</p>
              </div>
            )}

            {selectedOrder.orderStatus !== 'CANCELLED' && (
              <DetailSection icon={Calendar} title="Update Status">
                <div className="bg-slate-50 rounded-xl p-4 pt-5">
                  <StatusStepper current={selectedOrder.orderStatus} onSelect={s => handleStatusUpdate(selectedOrder._id, s)} />
                </div>
                {selectedOrder.orderStatus !== 'DELIVERED' && (
                  <button onClick={() => handleStatusUpdate(selectedOrder._id, 'CANCELLED')} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                    <XCircle size={13} /> Cancel this order
                  </button>
                )}
              </DetailSection>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!refundTarget}
        title="Process refund for this order?"
        message="This marks the order's payment status as refunded. Make sure the refund has actually been issued via your payment gateway."
        confirmLabel="Process Refund"
        danger
        onConfirm={handleRefund}
        onClose={() => setRefundTarget(null)}
      />
    </div>
  )
}

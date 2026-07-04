import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts'
import { IndianRupee, ShoppingBag, Users, TrendingUp, AlertTriangle, Plus, Tag, Percent, PackageX } from 'lucide-react'

const STATUS_COLORS = { PLACED: '#3b82f6', CONFIRMED: '#8b5cf6', SHIPPED: '#f59e0b', DELIVERED: '#10b981', CANCELLED: '#ef4444' }
const PAYMENT_COLORS = { COD: '#f59e0b', ONLINE: '#10b981' }
const CATEGORY_COLORS = ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const QUICK_ACTIONS = [
  { to: '/admin/products/new', label: 'Add Product', icon: Plus, bg: 'bg-primary-50', text: 'text-primary-600' },
  { to: '/admin/orders', label: 'View Orders', icon: ShoppingBag, bg: 'bg-blue-50', text: 'text-blue-600' },
  { to: '/admin/categories', label: 'Manage Categories', icon: Tag, bg: 'bg-purple-50', text: 'text-purple-600' },
  { to: '/admin/coupons', label: 'Create Coupon', icon: Percent, bg: 'bg-orange-50', text: 'text-orange-600' },
]

const currency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`

const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="mb-4">
      <h2 className="font-heading text-lg font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
)

const EmptyChart = ({ label }) => (
  <div className="h-[280px] flex flex-col items-center justify-center text-slate-300">
    <PackageX size={32} className="mb-2" />
    <p className="text-sm text-slate-400">{label}</p>
  </div>
)

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    apiClient.get('/admin/dashboard').then(({ data }) => setData(data)).catch(() => {})
    apiClient.get('/products', { params: { admin: true, limit: 50 } }).then(({ data }) => {
      const low = data.products
        .map(p => ({ ...p, stock: p.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0 }))
        .filter(p => p.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6)
      setLowStock(low)
    }).catch(() => {})
  }, [])

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" /></div>

  const stats = [
    { label: 'Total Revenue', value: currency(data.totalRevenue), icon: IndianRupee, bg: 'bg-green-50', text: 'text-green-600' },
    { label: 'Total Orders', value: data.totalOrders, icon: ShoppingBag, bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Customers', value: data.totalCustomers, icon: Users, bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Avg Order Value', value: currency(data.averageOrderValue), icon: TrendingUp, bg: 'bg-orange-50', text: 'text-orange-600' },
  ]

  const revenueByMonth = (data.revenueByMonth || []).map(m => ({ ...m, label: m._id }))
  const ordersByStatus = data.ordersByStatus || []
  const paymentMethodBreakdown = (data.paymentMethodBreakdown || []).map(p => ({ ...p, label: p._id }))
  const topCategories = (data.topCategories || []).filter(c => c._id)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.text} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{s.label}</p>
            <p className="text-2xl font-bold mt-1 text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map(a => (
          <Link key={a.label} to={a.to} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center flex-shrink-0`}>
              <a.icon size={17} className={a.text} />
            </div>
            <span className="text-sm font-semibold text-slate-800">{a.label}</span>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="font-heading text-xl font-bold">Low Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map(p => (
              <Link key={p._id} to={`/admin/products/edit/${p._id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors">
                <img src={p.images?.[0] || '/placeholder.png'} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className={`text-xs font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.stock === 0 ? 'Out of stock' : `${p.stock} units left`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Over Time" subtitle="Paid orders, by month">
          {revenueByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip formatter={(v) => currency(v)} cursor={{ fill: '#fafafa' }} />
                <Bar dataKey="revenue" fill="#dc2626" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No revenue data yet" />}
        </ChartCard>

        <ChartCard title="Orders by Status" subtitle="All-time distribution">
          {ordersByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={ordersByStatus} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {ordersByStatus.map((s, idx) => <Cell key={idx} fill={STATUS_COLORS[s._id] || '#94a3b8'} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No orders yet" />}
        </ChartCard>

        <ChartCard title="Payment Methods" subtitle="COD vs Online, all orders">
          {paymentMethodBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart margin={{ top: 20, bottom: 20 }}>
                <Pie data={paymentMethodBreakdown} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}>
                  {paymentMethodBreakdown.map((p, idx) => <Cell key={idx} fill={PAYMENT_COLORS[p._id] || '#94a3b8'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No orders yet" />}
        </ChartCard>

        <ChartCard title="Top Categories by Revenue" subtitle="From order line items">
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topCategories} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                <YAxis type="category" dataKey="_id" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip formatter={(v) => currency(v)} cursor={{ fill: '#fafafa' }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {topCategories.map((_, idx) => <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No category sales yet" />}
        </ChartCard>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-heading text-xl font-bold mb-4">Top Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Units Sold</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.topProducts?.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.productName || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-500">{p.categoryName || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-700">{p.totalSold}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{currency(p.revenue)}</td>
                </tr>
              ))}
              {(!data.topProducts || data.topProducts.length === 0) && (
                <tr><td colSpan={4} className="py-10 text-slate-400 text-center">No product sales yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-heading text-xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.recentOrders?.map(o => (
                <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{o._id.slice(-8)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.user?.name || 'N/A'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{currency(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      o.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-700' :
                      o.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>{o.orderStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {(!data.recentOrders || data.recentOrders.length === 0) && (
                <tr><td colSpan={5} className="py-10 text-slate-400 text-center">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Search, Bell } from 'lucide-react'
import SidebarNav from './SidebarNav'
import LiveNotifications from './LiveNotifications'
import apiClient from '../lib/apiClient'
import socket from '../lib/socket'

const TITLES = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  coupons: 'Coupons',
  users: 'Customers',
  notifications: 'Notifications',
}

function pageTitle(pathname) {
  const parts = pathname.split('/').filter(Boolean)
  const key = parts[1]
  if (parts[2] === 'new') return `New ${TITLES[key]?.replace(/s$/, '') || 'Item'}`
  if (parts[2] === 'edit') return `Edit ${TITLES[key]?.replace(/s$/, '') || 'Item'}`
  return TITLES[key] || 'Dashboard'
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDashboard = location.pathname === '/admin/dashboard' || location.pathname === '/admin'
  const [query, setQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const refreshUnreadCount = () => {
    apiClient.get('/admin/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count || 0))
      .catch(() => {})
  }

  useEffect(() => { refreshUnreadCount() }, [location.pathname])

  useEffect(() => {
    const events = [
      'order:new', 'order:updated',
      'product:created', 'product:updated', 'product:deleted',
      'category:created', 'category:updated', 'category:deleted',
      'coupon:created', 'coupon:updated', 'coupon:deleted',
      'customer:created', 'customer:updated', 'customer:deleted',
    ]
    const handler = () => setUnreadCount(c => c + 1)
    events.forEach(e => socket.on(e, handler))
    return () => events.forEach(e => socket.off(e, handler))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/admin/products?search=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <LiveNotifications />
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-3 px-6 flex-shrink-0">
          {!isDashboard && (
            <button onClick={() => navigate(-1)} title="Back"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex-shrink-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">Admin</p>
            <h2 className="font-heading text-lg font-bold text-slate-900 leading-tight">{pageTitle(location.pathname)}</h2>
          </div>

          <form onSubmit={handleSearch} className="hidden md:block ml-6 flex-1 max-w-sm">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:bg-white transition-colors" />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button onClick={() => navigate('/admin/notifications')} title="Notifications"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] font-bold min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <div className="text-sm text-slate-400 hidden lg:block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

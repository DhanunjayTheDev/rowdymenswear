import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import {
  Bell, ShoppingBag, PackagePlus, PackageCheck, PackageX, Tag, Percent, RefreshCw, Users, CheckCheck, Trash2,
} from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'

const TYPE_META = {
  'order:new': { icon: ShoppingBag, bg: 'bg-primary-50', text: 'text-primary-600' },
  'order:updated': { icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-600' },
  'product:created': { icon: PackagePlus, bg: 'bg-green-50', text: 'text-green-600' },
  'product:updated': { icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-600' },
  'product:deleted': { icon: PackageX, bg: 'bg-red-50', text: 'text-red-600' },
  'category:created': { icon: Tag, bg: 'bg-purple-50', text: 'text-purple-600' },
  'category:updated': { icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-600' },
  'category:deleted': { icon: Tag, bg: 'bg-red-50', text: 'text-red-600' },
  'coupon:created': { icon: Percent, bg: 'bg-orange-50', text: 'text-orange-600' },
  'coupon:updated': { icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-600' },
  'coupon:deleted': { icon: Percent, bg: 'bg-red-50', text: 'text-red-600' },
  'customer:created': { icon: Users, bg: 'bg-purple-50', text: 'text-purple-600' },
  'customer:updated': { icon: RefreshCw, bg: 'bg-blue-50', text: 'text-blue-600' },
  'customer:deleted': { icon: Users, bg: 'bg-red-50', text: 'text-red-600' },
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      const { data } = await apiClient.get('/admin/notifications')
      setNotifications(data.notifications)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleClick = async (n) => {
    if (!n.read) {
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x))
      apiClient.put(`/admin/notifications/${n._id}/read`).catch(() => {})
    }
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await apiClient.put('/admin/notifications/read-all')
    } catch (err) { toast.error(err.message) }
  }

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === notifications.length ? [] : notifications.map(n => n._id))
  }

  const handleBulkDelete = async () => {
    setConfirmBulkDelete(false)
    try {
      await apiClient.delete('/admin/notifications/bulk', { data: { ids: selected } })
      setNotifications(prev => prev.filter(n => !selected.includes(n._id)))
      setSelected([])
    } catch (err) { toast.error(err.response?.data?.message || err.message) }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const allSelected = notifications.length > 0 && selected.length === notifications.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {notifications.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="accent-primary-600 w-4 h-4" />
              Select all
            </label>
          )}
          <p className="text-sm text-slate-500">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <button onClick={() => setConfirmBulkDelete(true)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-lg transition-colors">
              <Trash2 size={16} /> Delete ({selected.length})
            </button>
          )}
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 px-3.5 py-2 rounded-lg transition-colors">
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
        {notifications.map(n => {
          const meta = TYPE_META[n.type] || { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-500' }
          const Icon = meta.icon
          return (
            <div key={n._id}
              className={`w-full flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 ${!n.read ? 'bg-primary-50/30' : ''}`}>
              <input type="checkbox" checked={selected.includes(n._id)} onChange={() => toggleSelect(n._id)}
                className="accent-primary-600 w-4 h-4 flex-shrink-0" onClick={e => e.stopPropagation()} />
              <button onClick={() => handleClick(n)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={meta.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />}
              </button>
            </div>
          )
        })}
        {notifications.length === 0 && !loading && (
          <div className="py-16 text-center">
            <Bell size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">No notifications yet</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.length} notification${selected.length === 1 ? '' : 's'}?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
      />
    </div>
  )
}

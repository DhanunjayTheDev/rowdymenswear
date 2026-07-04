import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Percent, LogOut, Menu, X, Bell,
} from 'lucide-react'
import { useState } from 'react'
import { logoutUser } from '../lib/auth'

const groups = [
  {
    label: 'Overview',
    links: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Catalog',
    links: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/categories', label: 'Categories', icon: Tag },
    ],
  },
  {
    label: 'Sales',
    links: [
      { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/admin/coupons', label: 'Coupons', icon: Percent },
    ],
  },
  {
    label: 'People',
    links: [{ to: '/admin/users', label: 'Customers', icon: Users }],
  },
]

export default function SidebarNav() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative ${
      isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-heading font-bold text-white text-sm flex-shrink-0">
          R
        </div>
        <div className="min-w-0">
          <h1 className="font-heading text-base font-bold text-white leading-tight truncate">ROWDY</h1>
          <p className="text-[11px] text-slate-500 tracking-wide">ADMIN CONSOLE</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {groups.map(g => (
          <div key={g.label}>
            <p className="px-4 pt-1 pb-1 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{g.label}</p>
            <div className="space-y-1">
              {g.links.map(l => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  <l.icon size={19} />
                  <span className="text-sm font-medium">{l.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium">
          <LogOut size={19} /> Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 left-4 z-50 bg-slate-900 text-white p-2 rounded-lg shadow-lg">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className="hidden lg:flex w-64 bg-slate-900 flex-shrink-0">{content}</aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-slate-900">{content}</div>
        </div>
      )}
    </>
  )
}

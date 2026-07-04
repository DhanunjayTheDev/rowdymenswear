import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchCurrentUser } from '../store/authSlice'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import { HiUser, HiShoppingBag, HiHeart, HiLogout, HiChevronRight } from 'react-icons/hi'
import { logout } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [pwForm, setPwForm] = useState({ current: '', newPw: '' })

  if (!user) {
    return (
      <div className="px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HiUser size={36} className="text-gray-400" />
        </div>
        <p className="font-medium mb-6">Sign in to see your profile</p>
        <Link to="/login" className="inline-flex bg-brand-black text-white px-8 py-3.5 rounded-2xl font-semibold text-sm btn-press">Sign In</Link>
      </div>
    )
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await apiClient.put('/auth/profile', { name })
      dispatch(fetchCurrentUser())
      setEditing(false)
      toast.success('Updated!')
    } catch (err) { toast.error(err.message) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    try {
      await apiClient.put('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      setPwForm({ current: '', newPw: '' })
      toast.success('Password changed!')
    } catch (err) { toast.error(err.message) }
  }

  const links = [
    { to: '/orders', label: 'My Orders', icon: HiShoppingBag },
    { to: '/wishlist', label: 'Wishlist', icon: HiHeart },
  ]

  return (
    <div className="px-4 py-6 max-w-lg lg:max-w-3xl mx-auto page-enter">
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-brand-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-lg">
              {user.name?.[0] || 'U'}
            </div>
            <h1 className="font-heading text-xl font-bold">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <button onClick={() => setEditing(!editing)} className="mt-4 text-sm font-medium text-primary-600 hover:underline">
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit name */}
          {editing && (
            <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
              <button type="submit" className="w-full bg-brand-black text-white py-3 rounded-2xl text-sm font-medium btn-press">Save</button>
            </form>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {links.map((l, i) => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${i < links.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <l.icon size={20} className="text-gray-600" />
                <span className="flex-1 font-medium text-sm">{l.label}</span>
                <HiChevronRight size={18} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 mt-6 lg:mt-0">
          {/* Change password */}
          <form onSubmit={handlePassword} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-base">Change Password</h3>
            <input type="password" placeholder="Current password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            <input type="password" placeholder="New password" value={pwForm.newPw} onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" minLength={6} />
            <button type="submit" className="w-full border-2 border-gray-200 py-3 rounded-2xl text-sm font-medium btn-press hover:border-gray-300 transition-colors">Update Password</button>
          </form>

          {/* Logout */}
          <button onClick={() => { dispatch(logout()); navigate('/') }}
            className="w-full flex items-center justify-center gap-2 text-red-600 bg-white border border-red-200 py-3.5 rounded-2xl text-sm font-medium btn-press hover:bg-red-50 transition-colors">
            <HiLogout size={18} /> Logout
          </button>
        </div>
      </div>
      <div className="pb-20" />
    </div>
  )
}

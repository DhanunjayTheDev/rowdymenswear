import { useState, useEffect } from 'react'
import apiClient from '../lib/apiClient'
import { Users as UsersIcon, Eye, Edit, Trash2, Plus, Mail, ShoppingBag, Calendar, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ToggleSwitch from '../components/ToggleSwitch'
import { DetailHero, Pill, DetailSection, DetailGrid, DetailField } from '../components/DetailView'

const AVATAR_COLORS = ['bg-primary-600', 'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600', 'bg-pink-600']
const emptyForm = { name: '', email: '', password: '', isActive: true }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [viewingIdx, setViewingIdx] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchUsers = () => {
    apiClient.get('/admin/users').then(({ data }) => setUsers(data.users)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true) }
  const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', isActive: u.isActive !== false }); setShowForm(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await apiClient.put(`/admin/users/${editing._id}`, { name: form.name, email: form.email, isActive: form.isActive })
      } else {
        await apiClient.post('/admin/users', form)
      }
      setShowForm(false)
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || err.message) }
  }

  const toggleActive = async (u) => {
    try {
      await apiClient.put(`/admin/users/${u._id}`, { isActive: !u.isActive })
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || err.message) }
  }

  const handleDelete = async () => {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await apiClient.delete(`/admin/users/${id}`)
      fetchUsers()
    } catch (err) { toast.error(err.response?.data?.message || err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
          <Plus size={17} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Customer</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Orders</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Joined</th>
                <th className="text-right px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u, i) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>{u.name?.[0] || 'U'}</div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{u.orderCount || 0} orders</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch checked={u.isActive !== false} onChange={() => toggleActive(u)} />
                      <span className={`text-xs font-semibold ${u.isActive !== false ? 'text-green-700' : 'text-red-600'}`}>{u.isActive !== false ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => { setViewing(u); setViewingIdx(i) }} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Eye size={16} /></button>
                      <button onClick={() => openEdit(u)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => setDeleteTarget(u._id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr><td colSpan={6} className="py-16 text-center">
                  <UsersIcon size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No customers yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Password (optional — a random one is set if left blank)</label>
              <input type="password" className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-primary-600" />
            <label htmlFor="isActive" className="text-sm font-medium">Active (can sign in)</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">{editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>

      <Drawer open={!!viewing} onClose={() => setViewing(null)} title="">
        {viewing && (
          <div className="space-y-6 text-sm">
            <DetailHero
              leading={<div className={`w-16 h-16 ${AVATAR_COLORS[viewingIdx % AVATAR_COLORS.length]} text-white rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-lg`}>{viewing.name?.[0] || 'U'}</div>}
              title={viewing.name}
              subtitle={viewing.email}
              meta={<Pill dark tone={viewing.isActive !== false ? 'green' : 'red'}>{viewing.isActive !== false ? 'Active' : 'Inactive'}</Pill>}
            />

            <DetailSection icon={ShieldCheck} title="Account">
              <DetailGrid>
                <DetailField label="Email" icon={Mail} value={viewing.email} full />
                <DetailField label="Orders" icon={ShoppingBag} value={viewing.orderCount || 0} />
                <DetailField label="Joined" icon={Calendar} value={new Date(viewing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </DetailGrid>
            </DetailSection>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this customer?"
        message="Their account will be permanently deleted. Existing orders stay on record."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

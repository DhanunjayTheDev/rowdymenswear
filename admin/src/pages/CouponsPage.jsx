import { useState, useEffect } from 'react'
import apiClient from '../lib/apiClient'
import { Plus, Edit, Trash2, Percent as PercentIcon, Eye, Calendar, Users as UsersIcon, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'
import Select from '../components/Select'
import Modal from '../components/Modal'
import Drawer from '../components/Drawer'
import ToggleSwitch from '../components/ToggleSwitch'
import { DetailHero, Pill, DetailSection, DetailGrid, DetailField } from '../components/DetailView'

const emptyForm = {
  code: '', description: '', discountType: 'PERCENT', value: '',
  minOrderAmount: '', maxDiscountValue: '', validFrom: '', validTo: '',
  usageLimit: '', isActive: true,
}

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENT', label: 'Percentage' },
  { value: 'FLAT', label: 'Flat Amount' },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewing, setViewing] = useState(null)

  const fetchCoupons = async () => {
    try {
      const { data } = await apiClient.get('/coupons')
      setCoupons(data.coupons)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscountValue: Number(form.maxDiscountValue) || 0,
        usageLimit: Number(form.usageLimit) || 0,
      }
      if (editing) {
        await apiClient.put(`/coupons/${editing._id}`, payload)
      } else {
        await apiClient.post('/coupons', payload)
      }
      setShowForm(false); setEditing(null); setForm({ ...emptyForm })
      fetchCoupons()
    } catch (err) { toast.error(err.message) }
  }

  const handleEdit = (coupon) => {
    setEditing(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountValue: coupon.maxDiscountValue || '',
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validTo: coupon.validTo?.split('T')[0] || '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = async () => {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await apiClient.delete(`/coupons/${id}`)
      fetchCoupons()
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleActive = async (coupon) => {
    try {
      await apiClient.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive })
      fetchCoupons()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={() => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
          <Plus size={17} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Code</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Discount</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Valid</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Used</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {coupons.map(c => (
              <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3 font-bold text-slate-800">{c.code}</td>
                <td className="px-5 py-3 text-slate-700">{c.discountType === 'PERCENT' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="px-5 py-3 text-xs text-slate-500">{new Date(c.validFrom).toLocaleDateString()} - {new Date(c.validTo).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-slate-700">{c.usedCount}{c.usageLimit > 0 ? `/${c.usageLimit}` : ''}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <ToggleSwitch checked={c.isActive} onChange={() => handleToggleActive(c)} />
                    <span className={`text-xs font-semibold ${c.isActive ? 'text-green-700' : 'text-red-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => setViewing(c)} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(c)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                    <button onClick={() => setDeleteTarget(c._id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && !loading && (
              <tr><td colSpan={6} className="py-16 text-center">
                <PercentIcon size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">No coupons yet</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Coupon' : 'Add Coupon'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            <input className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Select value={form.discountType} onChange={v => setForm({ ...form, discountType: v })} options={DISCOUNT_TYPE_OPTIONS} />
            <input type="number" className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder={form.discountType === 'PERCENT' ? 'Discount %' : 'Discount ₹'} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
            <input type="number" className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Min Order ₹" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} />
            <input type="number" className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Max Discount ₹" value={form.maxDiscountValue} onChange={e => setForm({ ...form, maxDiscountValue: e.target.value })} />
            <input type="date" className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} required />
            <input type="date" className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} required />
            <input type="number" className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Usage limit (0=unlimited)" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-primary-600" />
            <label className="text-sm font-medium">Active</label>
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
              leading={<div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0"><PercentIcon size={26} /></div>}
              title={viewing.code}
              subtitle={viewing.description || 'No description'}
              meta={<Pill dark tone={viewing.isActive ? 'green' : 'red'}>{viewing.isActive ? 'Active' : 'Inactive'}</Pill>}
            />

            <DetailSection icon={IndianRupee} title="Discount">
              <DetailGrid>
                <DetailField label="Value" value={viewing.discountType === 'PERCENT' ? `${viewing.value}%` : `₹${viewing.value}`} />
                <DetailField label="Min Order" value={`₹${viewing.minOrderAmount || 0}`} />
                {viewing.maxDiscountValue > 0 && <DetailField label="Max Discount" value={`₹${viewing.maxDiscountValue}`} full />}
              </DetailGrid>
            </DetailSection>

            <DetailSection icon={Calendar} title="Validity">
              <DetailGrid>
                <DetailField label="From" value={new Date(viewing.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <DetailField label="To" value={new Date(viewing.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </DetailGrid>
            </DetailSection>

            <DetailSection icon={UsersIcon} title="Usage">
              <DetailField label="Redeemed" full value={`${viewing.usedCount} used${viewing.usageLimit > 0 ? ` of ${viewing.usageLimit}` : ' · unlimited'}`} />
            </DetailSection>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this coupon?"
        message="Customers will no longer be able to apply this code."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import apiClient from '../lib/apiClient'
import { Plus, Edit, Trash2, Tag as TagIcon, ImagePlus, X, Eye, Link2, Calendar, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'
import Modal from '../components/Modal'
import Drawer from '../components/Drawer'
import ToggleSwitch from '../components/ToggleSwitch'
import { DetailHero, Pill, DetailSection, DetailGrid, DetailField } from '../components/DetailView'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewing, setViewing] = useState(null)

  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get('/categories')
      setCategories(data.categories)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCategories() }, [])

  const resetForm = () => {
    setEditing(null); setName(''); setDescription(''); setImageFile(null); setImagePreview('')
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      if (imageFile) formData.append('image', imageFile)

      if (editing) {
        await apiClient.put(`/categories/${editing._id}`, formData, { headers: { 'Content-Type': undefined } })
      } else {
        await apiClient.post('/categories', formData, { headers: { 'Content-Type': undefined } })
      }
      setShowForm(false); resetForm()
      fetchCategories()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleEdit = (cat) => {
    setEditing(cat); setName(cat.name); setDescription(cat.description || '')
    setImageFile(null); setImagePreview(cat.image || ''); setShowForm(true)
  }

  const handleDelete = async () => {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await apiClient.delete(`/categories/${id}`)
      fetchCategories()
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleActive = async (cat) => {
    try {
      await apiClient.put(`/categories/${cat._id}`, { isActive: !cat.isActive })
      fetchCategories()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
          <Plus size={17} /> Add Category
        </button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Category name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img src={imagePreview} alt="" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-700">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
                  <ImagePlus size={20} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </label>
              )}
              <p className="text-xs text-slate-400">Shown on the storefront's "Shop by Category" section. Square-ish images work best.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Image</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Name</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Slug</th>
              <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.map(c => (
              <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <TagIcon size={16} />
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-5 py-3 text-slate-500 font-mono text-xs">{c.slug}</td>
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
            {categories.length === 0 && !loading && (
              <tr><td colSpan={5} className="py-16 text-center">
                <TagIcon size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm">No categories yet</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer open={!!viewing} onClose={() => setViewing(null)} title="">
        {viewing && (
          <div className="space-y-6 text-sm">
            <DetailHero
              leading={viewing.image
                ? <img src={viewing.image} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/15 shadow-lg flex-shrink-0" />
                : <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0"><TagIcon size={24} /></div>}
              title={viewing.name}
              subtitle={`/${viewing.slug}`}
              meta={<Pill dark tone={viewing.isActive ? 'green' : 'red'}>{viewing.isActive ? 'Active' : 'Inactive'}</Pill>}
            />

            <DetailSection icon={Link2} title="Details">
              <DetailGrid>
                <DetailField label="Slug" icon={Link2} value={<span className="font-mono">{viewing.slug}</span>} />
                <DetailField label="Created" icon={Calendar} value={new Date(viewing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
              </DetailGrid>
            </DetailSection>

            {viewing.description && (
              <DetailSection icon={FileText} title="Description">
                <p className="text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{viewing.description}</p>
              </DetailSection>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this category?"
        message="Products in this category will remain but lose their category link."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, ImagePlus, X, Palette, Info, Images, Tag, ListPlus, Ruler, Eye,
} from 'lucide-react'
import Select from '../components/Select'
import ToggleSwitch from '../components/ToggleSwitch'
import { nearestColorName } from '../lib/colorNames'

const MAX_IMAGES = 10
const FIELD = 'w-full h-12 px-4 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-colors'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const FIT_OPTIONS = ['Regular','Slim','Oversized','Relaxed','Athletic','Skinny'].map(f => ({ value: f, label: f }))
const FABRIC_OPTIONS = ['Cotton','Polyester','Denim','Fleece','French Terry','Jersey','Linen','Wool'].map(f => ({ value: f, label: f }))
const emptyVariant = () => ({ color: '', colorHex: '#111111', images: [], sizes: SIZES.map(s => ({ size: s, stock: 0 })) })

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Icon size={17} className="text-primary-600" />
        </div>
        <div>
          <h2 className="font-heading text-base font-bold text-slate-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [variants, setVariants] = useState([])
  const [form, setForm] = useState({
    name: '', description: '', category: '', mrp: '', salePrice: '',
    color: '', colorHex: '#111111', fit: '', fabric: '',
    tags: '', isActive: true, sizes: SIZES.map(s => ({ size: s, stock: 0 })),
    customAttributes: [],
  })

  useEffect(() => {
    apiClient.get('/categories?active=true').then(({ data }) => setCategories(data.categories)).catch(() => {})
    if (id) {
      apiClient.get(`/products/${id}`).then(({ data }) => {
        const p = data.product
        setForm({
          name: p.name, description: p.description, category: p.category?._id || '',
          mrp: p.mrp, salePrice: p.salePrice, color: p.color || '', colorHex: p.colorHex || '#111111',
          fit: p.fit || '', fabric: p.fabric || '',
          tags: (p.tags || []).join(', '),
          isActive: p.isActive, sizes: p.sizes || SIZES.map(s => ({ size: s, stock: 0 })),
          customAttributes: p.customAttributes?.length ? p.customAttributes : [],
        })
        setExistingImages(p.images || [])
        setVariants((p.variants || []).map(v => ({
          _id: v._id, color: v.color, colorHex: v.colorHex || '#111111',
          images: v.images || [], sizes: v.sizes?.length ? v.sizes : SIZES.map(s => ({ size: s, stock: 0 })),
        })))
      }).catch(() => toast.error('Product not found'))
    }
  }, [id])

  const totalImageCount = existingImages.length + newImages.length

  const handleImagesPick = (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    const room = MAX_IMAGES - totalImageCount
    if (room <= 0) return toast.error(`Max ${MAX_IMAGES} images per product`)
    const accepted = files.slice(0, room)
    if (files.length > accepted.length) toast.error(`Only added ${accepted.length} — max ${MAX_IMAGES} images per product`)
    setNewImages(prev => [...prev, ...accepted.map(file => ({ file, preview: URL.createObjectURL(file) }))])
  }

  const removeExistingImage = (url) => setExistingImages(prev => prev.filter(u => u !== url))
  const removeNewImage = (idx) => setNewImages(prev => prev.filter((_, i) => i !== idx))

  const addVariant = () => setVariants(prev => [...prev, emptyVariant()])
  const removeVariant = (idx) => setVariants(prev => prev.filter((_, i) => i !== idx))
  const updateVariant = (idx, patch) => setVariants(prev => prev.map((v, i) => i === idx ? { ...v, ...patch } : v))
  const updateVariantSize = (idx, size, stock) => {
    setVariants(prev => prev.map((v, i) => i === idx
      ? { ...v, sizes: v.sizes.map(s => s.size === size ? { ...s, stock: Number(stock) } : s) }
      : v))
  }
  const pickVariantColor = (idx, hex) => updateVariant(idx, { colorHex: hex, color: nearestColorName(hex) })

  const uploadVariantImages = async (idx, files) => {
    if (files.length === 0) return
    const room = MAX_IMAGES - variants[idx].images.length
    if (room <= 0) return toast.error(`Max ${MAX_IMAGES} images per variant`)
    const fd = new FormData()
    files.slice(0, room).forEach(f => fd.append('images', f))
    try {
      const { data } = await apiClient.post('/products/upload-images', fd, { headers: { 'Content-Type': undefined } })
      setVariants(prev => prev.map((v, i) => i === idx ? { ...v, images: [...v.images, ...data.images] } : v))
    } catch (err) { toast.error(err.message) }
  }

  const removeVariantImage = (idx, url) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, images: v.images.filter(u => u !== url) } : v))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (totalImageCount === 0) return toast.error('Add at least one product image')
    if (variants.some(v => !v.color.trim())) return toast.error('Every color variant needs a color')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('mrp', Number(form.mrp))
      formData.append('salePrice', Number(form.salePrice))
      formData.append('color', form.color)
      formData.append('colorHex', form.colorHex)
      formData.append('fit', form.fit)
      formData.append('fabric', form.fabric)
      formData.append('tags', form.tags)
      formData.append('isActive', form.isActive)
      formData.append('sizes', JSON.stringify(form.sizes.filter(s => s.stock > 0)))
      formData.append('customAttributes', JSON.stringify(form.customAttributes.filter(a => a.key.trim() && a.value.trim())))
      formData.append('existingImages', JSON.stringify(existingImages))
      formData.append('variants', JSON.stringify(variants.map(v => ({
        _id: v._id, color: v.color, colorHex: v.colorHex, images: v.images,
        sizes: v.sizes.filter(s => s.stock > 0),
      }))))
      newImages.forEach(img => formData.append('images', img.file))

      if (id) {
        await apiClient.put(`/products/${id}`, formData, { headers: { 'Content-Type': undefined } })
      } else {
        await apiClient.post('/products', formData, { headers: { 'Content-Type': undefined } })
      }
      navigate('/admin/products')
    } catch (err) { toast.error(err.response?.data?.message || err.message) }
    finally { setLoading(false) }
  }

  const updateSize = (size, stock) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.size === size ? { ...s, stock: Number(stock) } : s),
    }))
  }

  const handleColorPick = (hex) => {
    setForm(prev => ({ ...prev, colorHex: hex, color: nearestColorName(hex) }))
  }

  const addAttribute = () => {
    setForm(prev => ({ ...prev, customAttributes: [...prev.customAttributes, { key: '', value: '' }] }))
  }

  const updateAttribute = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.map((a, i) => i === idx ? { ...a, [field]: value } : a),
    }))
  }

  const removeAttribute = (idx) => {
    setForm(prev => ({ ...prev, customAttributes: prev.customAttributes.filter((_, i) => i !== idx) }))
  }

  const categoryOptions = categories.map(c => ({ value: c._id, label: c.name }))

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-5 pb-4">
      <SectionCard icon={Info} title="Basic Information" subtitle="Name, description, category and price">
        <div>
          <label className="block text-sm font-medium mb-1.5">Product Name</label>
          <input className={FIELD} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-colors min-h-[100px]" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Category</label>
            <Select value={form.category} onChange={v => setForm({ ...form, category: v })} options={categoryOptions} placeholder="Select category" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
            <input className={FIELD} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="street, casual, premium" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">MRP (₹)</label>
            <input type="number" className={FIELD} value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} required min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Sale Price (₹)</label>
            <input type="number" className={FIELD} value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} required min={0} />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Images} title="Product Images" subtitle={`${totalImageCount}/${MAX_IMAGES} — first image is the main thumbnail`}>
        <div className="flex flex-wrap gap-3">
          {existingImages.map(url => (
            <div key={url} className="relative w-24 h-24 flex-shrink-0">
              <img src={url} alt="" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
              <button type="button" onClick={() => removeExistingImage(url)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-700">
                <X size={14} />
              </button>
            </div>
          ))}
          {newImages.map((img, idx) => (
            <div key={img.preview} className="relative w-24 h-24 flex-shrink-0">
              <img src={img.preview} alt="" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
              <button type="button" onClick={() => removeNewImage(idx)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-700">
                <X size={14} />
              </button>
            </div>
          ))}
          {totalImageCount < MAX_IMAGES && (
            <label className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
              <ImagePlus size={20} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">Add</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesPick} />
            </label>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={Tag} title="Base Color & Attributes" subtitle="Color, fit and fabric for the default (no-variant) product">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Color</label>
            <div className="h-12 flex items-center gap-3 px-3 border border-slate-200 rounded-lg">
              <input type="color" value={form.colorHex} onChange={e => handleColorPick(e.target.value)}
                className="w-8 h-8 rounded-md border border-slate-200 cursor-pointer flex-shrink-0 bg-transparent" />
              <div className="min-w-0 leading-tight">
                <p className="text-sm font-medium text-slate-800">{form.color || 'Pick a color'}</p>
                <p className="text-[11px] text-slate-400 font-mono">{form.colorHex}</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Fit</label>
            <Select value={form.fit} onChange={v => setForm({ ...form, fit: v })} options={FIT_OPTIONS} placeholder="Select fit" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Fabric</label>
            <Select value={form.fabric} onChange={v => setForm({ ...form, fabric: v })} options={FABRIC_OPTIONS} placeholder="Select fabric" />
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Ruler} title="Stock by Size" subtitle="Default product's inventory per size">
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {form.sizes.map(s => (
            <div key={s.size} className="text-center">
              <p className="text-xs font-medium mb-1 text-slate-500">{s.size}</p>
              <input type="number" min={0} className="w-full h-11 px-2 border border-slate-200 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" value={s.stock} onChange={e => updateSize(s.size, e.target.value)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard icon={ListPlus} title="Custom Attributes" subtitle="Any extra spec — Neck Type, Sleeve, Occasion...">
        <div className="flex justify-end -mt-2 -mb-2">
          <button type="button" onClick={addAttribute} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700">
            <Plus size={14} /> Add attribute
          </button>
        </div>
        {form.customAttributes.length === 0 ? (
          <p className="text-xs text-slate-400">Add any extra spec the built-in fields don't cover — e.g. "Neck Type" / "Round Neck", "Sleeve" / "Full Sleeve".</p>
        ) : (
          <div className="space-y-2">
            {form.customAttributes.map((attr, idx) => (
              <div key={idx} className="flex gap-2">
                <input placeholder="Key (e.g. Neck Type)" value={attr.key} onChange={e => updateAttribute(idx, 'key', e.target.value)} className={`flex-1 ${FIELD}`} />
                <input placeholder="Value (e.g. Round Neck)" value={attr.value} onChange={e => updateAttribute(idx, 'value', e.target.value)} className={`flex-1 ${FIELD}`} />
                <button type="button" onClick={() => removeAttribute(idx)} className="w-11 h-12 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Palette} title="Color Variants" subtitle={`Each color gets its own page + URL slug — e.g. "${form.name ? form.name.toLowerCase().replace(/\s+/g, '-') : 'product-name'}-red"`}>
        <div className="flex justify-end -mt-2 -mb-2">
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700">
            <Plus size={14} /> Add variant
          </button>
        </div>

        {variants.length === 0 ? (
          <p className="text-xs text-slate-400">No extra colorways yet. The base color/images above are the only option customers will see.</p>
        ) : (
          <div className="space-y-4">
            {variants.map((v, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <Palette size={14} /> Variant {idx + 1}
                  </div>
                  <button type="button" onClick={() => removeVariant(idx)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="h-12 flex items-center gap-3 px-3 border border-slate-200 rounded-lg">
                  <input type="color" value={v.colorHex} onChange={e => pickVariantColor(idx, e.target.value)}
                    className="w-8 h-8 rounded-md border border-slate-200 cursor-pointer flex-shrink-0 bg-transparent" />
                  <div className="min-w-0 leading-tight">
                    <p className="text-sm font-medium text-slate-800">{v.color || 'Pick a color'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{v.colorHex}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1.5">Images ({v.images.length}/{MAX_IMAGES})</p>
                  <div className="flex flex-wrap gap-2">
                    {v.images.map(url => (
                      <div key={url} className="relative w-16 h-16 flex-shrink-0">
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                        <button type="button" onClick={() => removeVariantImage(idx, url)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-700">
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {v.images.length < MAX_IMAGES && (
                      <label className="w-16 h-16 flex-shrink-0 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-colors">
                        <ImagePlus size={16} className="text-slate-400" />
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={e => { uploadVariantImages(idx, Array.from(e.target.files || [])); e.target.value = '' }} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1.5">Stock by size</p>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {v.sizes.map(s => (
                      <div key={s.size} className="text-center">
                        <p className="text-[10px] font-medium mb-1 text-slate-500">{s.size}</p>
                        <input type="number" min={0} className="w-full h-10 px-2 border border-slate-200 rounded-lg text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          value={s.stock} onChange={e => updateVariantSize(idx, s.size, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Eye} title="Visibility">
        <div className="flex items-center gap-2.5">
          <ToggleSwitch checked={form.isActive} onChange={() => setForm({ ...form, isActive: !form.isActive })} />
          <span className={`text-sm font-semibold ${form.isActive ? 'text-green-700' : 'text-red-600'}`}>{form.isActive ? 'Active' : 'Inactive'} <span className="text-slate-400 font-normal">(visible to customers)</span></span>
        </div>
      </SectionCard>

      <div className="sticky bottom-4 bg-white rounded-2xl p-4 shadow-lg border border-slate-100 flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 sm:flex-none bg-primary-600 text-white px-6 h-12 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-sm shadow-primary-600/20">
          {loading ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" onClick={() => navigate('/admin/products')} className="border border-slate-200 px-6 h-12 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">Cancel</button>
      </div>
    </form>
  )
}

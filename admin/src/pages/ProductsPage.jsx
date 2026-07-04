import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import { Plus, Edit, Trash2, Search, PackageX, Eye, Tag, IndianRupee, Boxes, Palette, Ruler, Shirt, FileText, Images, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ConfirmDialog'
import Drawer from '../components/Drawer'
import ToggleSwitch from '../components/ToggleSwitch'
import { DetailHero, Pill, DetailSection, DetailGrid, DetailField } from '../components/DetailView'

export default function ProductsPage() {
  const [urlParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(urlParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [viewing, setViewing] = useState(null)

  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get(`/products?admin=true&page=${page}&limit=20&search=${search}`)
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts() }, [page, search])

  const handleDelete = async () => {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await apiClient.delete(`/products/${id}`)
      fetchProducts()
    } catch (err) { toast.error(err.message) }
  }

  const handleToggleActive = async (id, current) => {
    try {
      await apiClient.put(`/products/${id}`, { isActive: !current })
      fetchProducts()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/20">
          <Plus size={17} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Product</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Price</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Stock</th>
                <th className="text-left px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-[11px] uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => {
                const stock = p.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0
                return (
                <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.images?.[0] || '/placeholder.png'} alt="" className="w-11 h-11 object-cover rounded-xl border border-slate-100 flex-shrink-0" />
                      <span className="font-medium text-slate-800 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{p.category?.name || 'Uncategorized'}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-slate-800">₹{p.salePrice?.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400 line-through text-xs ml-1.5">₹{p.mrp?.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${stock < 10 ? 'text-red-600' : 'text-slate-700'}`}>{stock}</span>
                    {stock === 0 && <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">OUT OF STOCK</span>}
                    {stock > 0 && stock < 10 && <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">LOW STOCK</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleSwitch checked={p.isActive} onChange={() => handleToggleActive(p._id, p.isActive)} />
                      <span className={`text-xs font-semibold ${p.isActive ? 'text-green-700' : 'text-red-600'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setViewing(p)} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Eye size={16} /></button>
                      <Link to={`/admin/products/edit/${p._id}`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></Link>
                      <button onClick={() => setDeleteTarget(p._id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )})}
              {products.length === 0 && !loading && (
                <tr><td colSpan={6} className="py-16 text-center">
                  <PackageX size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No products found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-100">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'border border-slate-200 hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        message="This will permanently remove the product and its reviews. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <Drawer open={!!viewing} onClose={() => setViewing(null)} title="">
        {viewing && (() => {
          const totalStock = viewing.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0
          return (
          <div className="space-y-6 text-sm">
            <DetailHero
              leading={viewing.images?.[0]
                ? <img src={viewing.images[0]} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/15 shadow-lg flex-shrink-0" />
                : <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0"><Images size={24} /></div>}
              title={viewing.name}
              subtitle={viewing.category?.name || 'Uncategorized'}
              meta={<>
                <Pill dark tone={viewing.isActive ? 'green' : 'red'}>{viewing.isActive ? 'Active' : 'Inactive'}</Pill>
                <Pill dark tone={totalStock === 0 ? 'red' : totalStock < 10 ? 'amber' : 'blue'} dot={false}>{totalStock} in stock</Pill>
              </>}
            />

            {viewing.images?.length > 1 && (
              <DetailSection icon={Images} title="Gallery">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewing.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-xl border border-slate-100 flex-shrink-0" />
                  ))}
                </div>
              </DetailSection>
            )}

            <DetailSection icon={IndianRupee} title="Pricing">
              <DetailGrid>
                <DetailField label="Sale Price" icon={IndianRupee} value={`₹${viewing.salePrice?.toLocaleString('en-IN')}`} />
                <DetailField label="MRP" icon={Tag} value={<span className="line-through text-slate-400">₹{viewing.mrp?.toLocaleString('en-IN')}</span>} />
                {viewing.offerPercent > 0 && <DetailField label="Discount" value={`${viewing.offerPercent}% OFF`} full />}
              </DetailGrid>
            </DetailSection>

            {viewing.sizes?.length > 0 && (
              <DetailSection icon={Boxes} title="Stock by Size">
                <div className="grid grid-cols-3 gap-2">
                  {viewing.sizes.map(s => (
                    <div key={s.size} className={`rounded-xl p-2.5 text-center ${s.stock === 0 ? 'bg-red-50' : s.stock < 10 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.size}</p>
                      <p className={`text-sm font-bold ${s.stock === 0 ? 'text-red-600' : s.stock < 10 ? 'text-amber-600' : 'text-slate-800'}`}>{s.stock}</p>
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

            {(viewing.color || viewing.fit || viewing.fabric || viewing.customAttributes?.length > 0) && (
              <DetailSection icon={Palette} title="Attributes">
                <DetailGrid>
                  {viewing.color && (
                    <DetailField label="Color" icon={Palette} value={
                      <span className="flex items-center gap-1.5">
                        {viewing.colorHex && <span className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0" style={{ background: viewing.colorHex }} />}
                        {viewing.color}
                      </span>
                    } />
                  )}
                  {viewing.fit && <DetailField label="Fit" icon={Ruler} value={viewing.fit} />}
                  {viewing.fabric && <DetailField label="Fabric" icon={Shirt} value={viewing.fabric} />}
                  {viewing.customAttributes?.map((a, i) => (
                    <DetailField key={i} label={a.key} value={a.value} />
                  ))}
                </DetailGrid>
              </DetailSection>
            )}

            {viewing.variants?.length > 0 && (
              <DetailSection icon={Layers} title={`Color Variants (${viewing.variants.length})`}>
                <div className="space-y-2">
                  {viewing.variants.map((v, i) => {
                    const vStock = v.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0
                    return (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl p-2.5">
                        <img src={v.images?.[0] || viewing.images?.[0]} alt="" className="w-11 h-11 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                            {v.colorHex && <span className="w-2.5 h-2.5 rounded-full border border-slate-300 flex-shrink-0" style={{ background: v.colorHex }} />}
                            {v.color}
                          </p>
                          <p className="text-xs text-slate-400 font-mono truncate">/{v.slug}</p>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ${vStock === 0 ? 'text-red-600' : 'text-slate-600'}`}>{vStock} left</span>
                      </div>
                    )
                  })}
                </div>
              </DetailSection>
            )}

            {viewing.description && (
              <DetailSection icon={FileText} title="Description">
                <p className="text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{viewing.description}</p>
              </DetailSection>
            )}

            {viewing.tags?.length > 0 && (
              <DetailSection icon={Tag} title="Tags">
                <div className="flex flex-wrap gap-1.5">
                  {viewing.tags.map(t => <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">#{t}</span>)}
                </div>
              </DetailSection>
            )}
          </div>
          )
        })()}
      </Drawer>
    </div>
  )
}

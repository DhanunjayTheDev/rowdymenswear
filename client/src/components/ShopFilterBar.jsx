import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiSwitchVertical, HiViewGrid, HiTag, HiAdjustments, HiCheck } from 'react-icons/hi'
import MobileFilterSheet from './MobileFilterSheet'
import QuickFilterSheet from './QuickFilterSheet'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']

export default function ShopFilterBar({ categories }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSheet, setActiveSheet] = useState(null)

  const update = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const toggleSize = (val) => {
    const cur = searchParams.get('size')?.split(',').filter(Boolean) || []
    const idx = cur.indexOf(val)
    idx > -1 ? cur.splice(idx, 1) : cur.push(val)
    update('size', cur.join(','))
  }

  const hasFilters = [...searchParams.keys()].some(k => k !== 'page' && k !== 'sort')
  const currentSort = searchParams.get('sort') || 'newest'
  const currentCategory = searchParams.get('category') || ''
  const currentSizes = searchParams.get('size')?.split(',').filter(Boolean) || []

  const tabs = [
    { key: 'sort', label: 'Sort', icon: HiSwitchVertical, active: currentSort !== 'newest' },
    { key: 'category', label: 'Category', icon: HiViewGrid, active: !!currentCategory },
    { key: 'size', label: 'Size', icon: HiTag, active: currentSizes.length > 0 },
    { key: 'filters', label: 'Filters', icon: HiAdjustments, active: hasFilters },
  ]

  return (
    <>
      {/* Floating pill bar */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 lg:hidden bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.14)] border border-gray-100"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-stretch h-[58px]">
          {tabs.map((t, i) => (
            <button key={t.key} onClick={() => setActiveSheet(t.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                i > 0 ? 'border-l border-gray-100' : ''
              } ${t.active ? 'text-primary-600' : 'text-gray-500'}`}>
              <t.icon size={18} />
              <span className="text-[10.5px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sort — only sort options */}
      <QuickFilterSheet open={activeSheet === 'sort'} onClose={() => setActiveSheet(null)} title="Sort by">
        <div className="space-y-1 pb-2">
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => { update('sort', o.value === 'newest' ? '' : o.value); setActiveSheet(null) }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                currentSort === o.value ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50 text-gray-700'
              }`}>
              {o.label}
              {currentSort === o.value && <HiCheck size={18} />}
            </button>
          ))}
        </div>
      </QuickFilterSheet>

      {/* Category — only category chips */}
      <QuickFilterSheet open={activeSheet === 'category'} onClose={() => setActiveSheet(null)} title="Category">
        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map(c => (
            <button key={c._id} onClick={() => { update('category', c._id === currentCategory ? '' : c._id); setActiveSheet(null) }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                c._id === currentCategory ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'
              }`}>
              {c.name}
            </button>
          ))}
        </div>
      </QuickFilterSheet>

      {/* Size — only size grid */}
      <QuickFilterSheet open={activeSheet === 'size'} onClose={() => setActiveSheet(null)} title="Size">
        <div className="flex flex-wrap gap-2 pb-2">
          {SIZES.map(s => (
            <button key={s} onClick={() => toggleSize(s)}
              className={`w-12 h-12 rounded-xl text-sm font-medium border transition-all ${
                currentSizes.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setActiveSheet(null)} className="w-full mt-2 bg-brand-black text-white py-3.5 rounded-2xl font-semibold text-sm btn-press">
          Done
        </button>
      </QuickFilterSheet>

      {/* Filters — everything */}
      <MobileFilterSheet open={activeSheet === 'filters'} onClose={() => setActiveSheet(null)} categories={categories} />
    </>
  )
}

import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiX } from 'react-icons/hi'
import Select from './Select'
import PriceRangeSlider from './PriceRangeSlider'

const PRICE_MIN = 0
const PRICE_MAX = 100000
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const COLORS = ['Black','White','Red','Blue','Green','Grey','Navy','Olive','Brown','Beige']
const FITS = ['Regular','Slim','Oversized','Relaxed','Athletic','Skinny']
const FABRICS = ['Cotton','Polyester','Denim','Fleece','French Terry','Jersey','Linen','Wool']
const TAGS = ['street', 'formal', 'casual', 'sport', 'premium', 'sale']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

function FilterForm({ categories, searchParams, setSearchParams }) {
  const update = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.set('page', '1')
    setSearchParams(p)
  }

  const toggleArr = (key, val) => {
    const cur = searchParams.get(key)?.split(',').filter(Boolean) || []
    const idx = cur.indexOf(val)
    idx > -1 ? cur.splice(idx, 1) : cur.push(val)
    update(key, cur.join(','))
  }

  const hasFilters = [...searchParams.keys()].some(k => k !== 'page' && k !== 'sort')
  const currentSize = searchParams.get('size')?.split(',') || []
  const currentColor = searchParams.get('color') || ''
  const currentFit = searchParams.get('fit') || ''
  const currentFabric = searchParams.get('fabric') || ''
  const currentTags = searchParams.get('tags')?.split(',') || []
  const currentCategory = searchParams.get('category') || ''

  const chipClass = (active) =>
    `px-4 py-2.5 rounded-xl text-sm font-medium border transition-all btn-press ${
      active ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
    }`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold">Filters</h3>
        {hasFilters && (
          <button onClick={() => setSearchParams(new URLSearchParams())} className="text-xs font-medium text-primary-600 hover:underline">Clear all</button>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Category</h4>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button key={c._id} onClick={() => update('category', c._id === currentCategory ? '' : c._id)}
              className={chipClass(c._id === currentCategory)}>{c.name}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Price</h4>
        <PriceRangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          minValue={searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : PRICE_MIN}
          maxValue={searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : PRICE_MAX}
          onChange={(minVal, maxVal) => {
            const p = new URLSearchParams(searchParams)
            minVal > PRICE_MIN ? p.set('minPrice', minVal) : p.delete('minPrice')
            maxVal < PRICE_MAX ? p.set('maxPrice', maxVal) : p.delete('maxPrice')
            p.set('page', '1')
            setSearchParams(p)
          }}
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Size</h4>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map(s => (
            <button key={s} onClick={() => toggleArr('size', s)}
              className={`w-10 h-10 rounded-xl text-sm font-medium border transition-all btn-press ${
                currentSize.includes(s) ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Color</h4>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(c => (
            <button key={c} onClick={() => update('color', c === currentColor ? '' : c)}
              className={chipClass(c === currentColor)}>{c}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Fit</h4>
        <div className="flex flex-wrap gap-1.5">
          {FITS.map(f => (
            <button key={f} onClick={() => update('fit', f === currentFit ? '' : f)}
              className={chipClass(f === currentFit)}>{f}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Fabric</h4>
        <div className="flex flex-wrap gap-1.5">
          {FABRICS.map(f => (
            <button key={f} onClick={() => update('fabric', f === currentFabric ? '' : f)}
              className={chipClass(f === currentFabric)}>{f}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Style</h4>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(t => (
            <button key={t} onClick={() => toggleArr('tags', t)} className={chipClass(currentTags.includes(t))}>{t}</button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wider">Sort</h4>
        <Select value={searchParams.get('sort') || 'newest'} onChange={v => update('sort', v)} options={SORT_OPTIONS} />
      </div>
    </div>
  )
}

// Full mobile filter bottom sheet — controlled component, sits above BottomNav (z-[60] > BottomNav's z-50)
export default function MobileFilterSheet({ open, onClose, categories }) {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-up shadow-2xl flex flex-col" style={{ maxHeight: '88vh' }}>
        <div className="sticky top-0 bg-white z-10 pt-3 pb-2 rounded-t-3xl flex-shrink-0 flex items-center justify-center relative">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
          <button onClick={onClose} className="absolute right-4 top-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <HiX size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4 flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          <FilterForm categories={categories} searchParams={searchParams} setSearchParams={setSearchParams} />
        </div>
        <div className="flex-shrink-0 flex gap-3 px-5 pt-3 border-t border-gray-100" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <button onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-semibold text-sm btn-press hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onClose}
            className="flex-[2] bg-primary-600 text-white py-3.5 rounded-2xl font-semibold text-sm btn-press hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
            Show Results
          </button>
        </div>
      </div>
    </div>
  )
}

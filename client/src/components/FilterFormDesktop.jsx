import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiChevronDown } from 'react-icons/hi'
import PriceRangeSlider from './PriceRangeSlider'

const PRICE_MIN = 0
const PRICE_MAX = 100000

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const COLORS = ['Black','White','Red','Blue','Green','Grey','Navy','Olive','Brown','Beige']
const FITS = ['Regular','Slim','Oversized','Relaxed','Athletic','Skinny']
const FABRICS = ['Cotton','Polyester','Denim','Fleece','French Terry','Jersey','Linen','Wool']
const TAGS = ['street', 'formal', 'casual', 'sport', 'premium', 'sale']

function FilterSection({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 py-4 first:pt-0 last:border-0 last:pb-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between text-left group">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
          {title}
          {count > 0 && <span className="w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] font-bold flex items-center justify-center">{count}</span>}
        </span>
        <HiChevronDown size={16} className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3.5">{children}</div>}
    </div>
  )
}

export default function FilterFormDesktop({ categories }) {
  const [searchParams, setSearchParams] = useSearchParams()

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

  const currentSize = searchParams.get('size')?.split(',').filter(Boolean) || []
  const currentColor = searchParams.get('color') || ''
  const currentFit = searchParams.get('fit') || ''
  const currentFabric = searchParams.get('fabric') || ''
  const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const currentCategory = searchParams.get('category') || ''
  const hasPriceFilter = !!(searchParams.get('minPrice') || searchParams.get('maxPrice'))

  const chipClass = (active) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all btn-press ${
      active ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
    }`

  return (
    <div>
      <div className="pb-4">
        <input type="text" placeholder="Search..." value={searchParams.get('search') || ''}
          onChange={e => update('search', e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
      </div>

      <FilterSection title="Category" count={currentCategory ? 1 : 0} defaultOpen>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button key={c._id} onClick={() => update('category', c._id === currentCategory ? '' : c._id)}
              className={chipClass(c._id === currentCategory)}>{c.name}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price" count={hasPriceFilter ? 1 : 0}>
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
      </FilterSection>

      <FilterSection title="Color" count={currentColor ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map(c => (
            <button key={c} onClick={() => update('color', c === currentColor ? '' : c)}
              className={chipClass(c === currentColor)}>{c}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fit" count={currentFit ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {FITS.map(f => (
            <button key={f} onClick={() => update('fit', f === currentFit ? '' : f)}
              className={chipClass(f === currentFit)}>{f}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fabric" count={currentFabric ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {FABRICS.map(f => (
            <button key={f} onClick={() => update('fabric', f === currentFabric ? '' : f)}
              className={chipClass(f === currentFabric)}>{f}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size" count={currentSize.length}>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map(s => (
            <button key={s} onClick={() => toggleArr('size', s)}
              className={`w-9 h-9 rounded-lg text-xs font-medium border transition-all btn-press ${
                currentSize.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>{s}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style" count={currentTags.length}>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(t => (
            <button key={t} onClick={() => toggleArr('tags', t)} className={chipClass(currentTags.includes(t))}>{t}</button>
          ))}
        </div>
      </FilterSection>
    </div>
  )
}

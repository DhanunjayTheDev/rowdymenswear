import { useSearchParams } from 'react-router-dom'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price -- Low to High' },
  { value: 'price_desc', label: 'Price -- High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function SortTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentSort = searchParams.get('sort') || 'newest'

  const update = (value) => {
    const p = new URLSearchParams(searchParams)
    if (value && value !== 'newest') p.set('sort', value)
    else p.delete('sort')
    p.set('page', '1')
    setSearchParams(p)
  }

  return (
    <div className="hidden lg:flex items-center gap-6 border-b border-gray-100 pb-3 mb-6">
      <span className="text-sm font-bold text-gray-900 flex-shrink-0">Sort By</span>
      <div className="flex items-center gap-6">
        {SORT_OPTIONS.map(o => (
          <button key={o.value} onClick={() => update(o.value)}
            className={`text-sm font-medium pb-3 -mb-3 border-b-2 transition-colors ${
              currentSort === o.value ? 'text-primary-600 border-primary-600' : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

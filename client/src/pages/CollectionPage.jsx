import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../store/productsSlice'
import ProductCard from '../components/ProductCard'
import ShopFilterBar from '../components/ShopFilterBar'
import SortTabs from '../components/SortTabs'
import apiClient from '../lib/apiClient'
import { HiSearch, HiX } from 'react-icons/hi'

// Reuse the filter form for desktop sidebar
import FilterFormDesktop from '../components/FilterFormDesktop'

export default function CollectionPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { items, pagination, loading } = useSelector(s => s.products)
  const [categories, setCategories] = useState([])
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '')
  }, [searchParams])

  const updateSearch = (value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set('search', value)
    else p.delete('search')
    p.set('page', '1')
    setSearchParams(p)
  }

  // Debounce mobile search input so we don't refetch on every keystroke
  useEffect(() => {
    const current = searchParams.get('search') || ''
    if (searchInput === current) return
    const t = setTimeout(() => updateSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    dispatch(fetchProducts(Object.fromEntries(searchParams.entries())))
    apiClient.get('/categories?active=true').then(({ data }) => setCategories(data.categories)).catch(() => {})
  }, [dispatch, searchParams])

  const goPage = (p) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', p.toString())
    window.history.pushState(null, '', `?${params}`)
    dispatch(fetchProducts(Object.fromEntries(params.entries())))
  }

  const hasFilters = [...searchParams.keys()].some(k => k !== 'page' && k !== 'sort')

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 pb-20 lg:pb-6 page-enter">
      {/* Mobile header */}
      <div className="mb-4 lg:hidden">
        <h1 className="font-heading text-2xl font-bold">Collection</h1>
        {!loading && pagination && <p className="text-xs text-gray-500">{pagination.total} products</p>}
      </div>

      {/* Mobile search bar — native app style */}
      <div className="mb-4 lg:hidden relative">
        <HiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search for products..."
          className="w-full pl-11 pr-10 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all"
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <HiX size={16} />
          </button>
        )}
      </div>

      <div className="flex gap-6 lg:gap-8 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 self-start">
          <div className="sticky top-20">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
              <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
                <h2 className="font-heading text-lg font-bold">Filters</h2>
                {hasFilters && (
                  <button onClick={() => {
                    const p = new URLSearchParams()
                    window.history.pushState(null, '', `?${p}`)
                    dispatch(fetchProducts({}))
                  }} className="text-xs font-medium text-primary-600 hover:underline whitespace-nowrap">Clear</button>
                )}
              </div>
              <div className="overflow-y-auto px-5 pb-5 flex-1 -mr-2 pr-7">
                <div className="space-y-5 pt-5">
                  <FilterFormDesktop categories={categories} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Desktop top bar */}
          <div className="hidden lg:block mb-6">
            <h1 className="font-heading text-2xl font-bold">Collection</h1>
            {!loading && pagination && <p className="text-xs text-gray-500 mt-0.5">{pagination.total} products</p>}
          </div>

          <SortTabs />

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {items.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 pb-8">
                  {pagination.hasPrevPage && (
                    <button onClick={() => goPage(pagination.page - 1)}
                      className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium btn-press hover:bg-gray-50 transition-colors">Previous</button>
                  )}
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                      let p; const tp = pagination.totalPages; const cp = pagination.page
                      if (tp <= 7) p = i + 1
                      else if (cp <= 4) p = i + 1
                      else if (cp >= tp - 3) p = tp - 6 + i
                      else p = cp - 3 + i
                      return <button key={p} onClick={() => goPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all btn-press ${p === cp ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>{p}</button>
                    })}
                  </div>
                  {pagination.hasNextPage && (
                    <button onClick={() => goPage(pagination.page + 1)}
                      className="px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium btn-press hover:bg-gray-50 transition-colors">Next</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ShopFilterBar categories={categories} />
    </div>
  )
}

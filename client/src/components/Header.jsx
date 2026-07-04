import { useState } from 'react'
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { HiSearch, HiShoppingCart, HiHeart, HiUser, HiChevronLeft, HiTruck } from 'react-icons/hi'
import { logout } from '../store/authSlice'
import useWishlist from '../hooks/useWishlist'

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector(s => s.auth.user)
  const itemCount = useSelector(s => s.cart.items.reduce((sum, i) => sum + i.quantity, 0))
  const { products: wishlistProducts } = useWishlist()
  const showBack = location.pathname !== '/'

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100/80">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {showBack && (
            <button onClick={() => navigate(-1)} title="Back" className="p-2 -ml-2 mr-0.5 rounded-full hover:bg-gray-100 transition-colors">
              <HiChevronLeft size={22} className="text-gray-700" />
            </button>
          )}
          <Link to="/" className="font-heading text-xl font-bold tracking-tight flex items-center gap-1">
            <span className="text-brand-black">ROWDY MENS WEAR</span>
            <span className="text-primary-600">.</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          <NavLink to="/" className={({isActive}) => `transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-brand-black'}`}>Home</NavLink>
          <NavLink to="/collection" className={({isActive}) => `transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-brand-black'}`}>Shop All</NavLink>
          <NavLink to="/collection?category=t-shirts" className={({isActive}) => `transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-brand-black'}`}>T-Shirts</NavLink>
          <NavLink to="/collection?category=shirts" className={({isActive}) => `transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-brand-black'}`}>Shirts</NavLink>
          <NavLink to="/collection?category=jeans" className={({isActive}) => `transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-brand-black'}`}>Jeans</NavLink>
          <NavLink to="/contact" className={({isActive}) => `transition-colors ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-brand-black'}`}>Contact</NavLink>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1.5">
          {/* Track Order - mobile only, desktop has it under the user menu */}
          <Link to={user ? '/orders' : '/login?redirect=orders'} className="lg:hidden flex items-center gap-1.5 bg-primary-50 text-primary-600 pl-2.5 pr-3 py-2 rounded-full text-xs font-semibold hover:bg-primary-100 transition-colors">
            <HiTruck size={16} className="animate-truck flex-shrink-0" />
            Track
          </Link>

          <button onClick={() => setSearchOpen(!searchOpen)} className="hidden lg:flex p-2.5 rounded-full hover:bg-gray-100 transition-colors" title="Search">
            <HiSearch size={20} className="text-gray-700" />
          </button>

          {/* Wishlist - desktop only, mobile has BottomNav */}
          <Link to="/wishlist" className="hidden lg:flex relative p-2.5 rounded-full hover:bg-gray-100 transition-colors" title="Wishlist">
            <HiHeart size={20} className="text-gray-700" />
            {wishlistProducts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg shadow-primary-600/30">
                {wishlistProducts.length > 9 ? '9+' : wishlistProducts.length}
              </span>
            )}
          </Link>

          {/* Cart - desktop only, mobile has BottomNav */}
          <Link to="/cart" className="hidden lg:flex relative p-2.5 rounded-full hover:bg-gray-100 transition-colors" title="Cart">
            <HiShoppingCart size={20} className="text-gray-700" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg shadow-primary-600/30">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* User - desktop only, mobile has BottomNav Profile */}
          {user ? (
            <div className="hidden lg:block relative group">
              <button className="w-8 h-8 bg-brand-black text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-800 transition-colors">
                {user.name?.[0] || 'U'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                <div className="p-3 border-b bg-gray-50">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link to="/profile" className="block px-4 py-2.5 text-sm hover:bg-gray-50">My Profile</Link>
                <Link to="/orders" className="block px-4 py-2.5 text-sm hover:bg-gray-50">My Orders</Link>
                <Link to="/wishlist" className="block px-4 py-2.5 text-sm hover:bg-gray-50">Wishlist</Link>
                <button onClick={() => { dispatch(logout()); navigate('/') }} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-brand-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              <HiUser size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-gray-100 px-4 py-3 bg-white animate-fade-in">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              autoFocus
            />
            <button type="submit" className="px-5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors btn-press">
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  )
}

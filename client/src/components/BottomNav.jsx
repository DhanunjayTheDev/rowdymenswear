import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { HiHome, HiShoppingBag, HiShoppingCart, HiHeart, HiUser } from 'react-icons/hi'
import useWishlist from '../hooks/useWishlist'

export default function BottomNav() {
  const itemCount = useSelector(s => s.cart.items.reduce((sum, i) => sum + i.quantity, 0))
  const { products: wishlistProducts } = useWishlist()

  const links = [
    { to: '/', label: 'Home', icon: HiHome },
    { to: '/collection', label: 'Shop', icon: HiShoppingBag },
    { to: '/cart', label: 'Cart', icon: HiShoppingCart, badge: itemCount },
    { to: '/wishlist', label: 'Wishlist', icon: HiHeart, badge: wishlistProducts.length },
    { to: '/profile', label: 'Profile', icon: HiUser },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-gray-200/60 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around h-[64px]">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <div className="relative">
              <l.icon size={22} />
              {l.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg shadow-primary-600/30">
                  {l.badge > 9 ? '9+' : l.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">{l.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

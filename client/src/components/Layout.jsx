import Header from './Header'
import Footer from './Footer'
import BottomNav from './BottomNav'
import { useLocation } from 'react-router-dom'

export default function Layout({ children }) {
  const loc = useLocation()
  const isCheckout = loc.pathname === '/checkout'
  const isCollection = loc.pathname === '/collection'
  const hideBottomNav = isCheckout || isCollection

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className={`flex-1 ${hideBottomNav ? '' : 'pb-safe'}`}>
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
      <Footer />
    </div>
  )
}

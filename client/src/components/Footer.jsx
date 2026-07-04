import { Link } from 'react-router-dom'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { FaInstagram, FaFacebookF, FaYoutube } from 'react-icons/fa6'

const WORDMARK = 'ROWDY MENS WEAR'

const SOCIALS = [
  { icon: FaInstagram, href: 'https://www.instagram.com/rowdy_mens_wear_gurazala?utm_source=qr&igsh=MXdhbGF6NjN5djVpZA==', label: 'Instagram' },
  { icon: FaFacebookF, href: 'https://www.facebook.com/share/1F2jESDXnM/', label: 'Facebook' },
  { icon: FaYoutube, href: 'https://youtube.com/@rowdymenswear?si=k4nlOi71YNOXLsEx', label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-400 pb-24 lg:pb-0 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-14">
        <h2 className="footer-wordmark flex w-full font-heading font-bold text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-none select-none mb-12">
          {WORDMARK.split('').map((ch, i) => (
            <span key={i} className="flex-1 text-center">{ch === ' ' ? ' ' : ch}</span>
          ))}
          <span className="flex-none" style={{ color: '#dc2626', WebkitTextStroke: '0px' }}>.</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 pb-10">
          <div className="col-span-2 space-y-4">
            <p className="text-sm leading-relaxed max-w-xs">Premium streetwear for the bold. Designed with attitude, made to last.</p>
            <div className="flex items-center gap-3 pt-1">
              {SOCIALS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener" aria-label={s.label}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary-600 flex items-center justify-center text-white transition-colors">
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/collection" className="hover:text-white transition-colors">All</Link></li>
              <li><Link to="/collection?category=t-shirts" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/collection?category=shirts" className="hover:text-white transition-colors">Shirts</Link></li>
              <li><Link to="/collection?category=jeans" className="hover:text-white transition-colors">Jeans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><span className="cursor-default">Shipping</span></li>
              <li><span className="cursor-default">Returns</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Visit Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <HiLocationMarker size={16} className="text-primary-600 flex-shrink-0 mt-0.5" />
                <span>Main Rd, opposite mdo office, Gurazala, Andhra Pradesh 522415</span>
              </li>
              <li className="flex items-center gap-2">
                <HiPhone size={16} className="text-primary-600 flex-shrink-0" />
                <a href="tel:+919642836806" className="hover:text-white transition-colors">96428 36806</a>
              </li>
              <li className="flex items-center gap-2">
                <HiMail size={16} className="text-primary-600 flex-shrink-0" />
                <a href="mailto:juluri.bhaskar123@gmail.com" className="hover:text-white transition-colors break-all">juluri.bhaskar123@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-center">
          <p>&copy; {new Date().getFullYear()} Rowdy Mens Wear. All rights reserved.</p>
          <p className="text-gray-500">Made with Love By Dhanunjay Thumula.</p>
        </div>
      </div>
    </footer>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import ProductCard from '../components/ProductCard'
import TestimonialsSection from '../components/TestimonialsSection'
import LogoLoop from '../components/LogoLoop'
import useReveal from '../hooks/useReveal'
import { HiArrowRight, HiTruck, HiShieldCheck, HiSparkles, HiRefresh, HiChevronLeft, HiChevronRight } from 'react-icons/hi'

const features = [
  { icon: HiTruck, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: HiRefresh, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: HiShieldCheck, title: 'Secure Checkout', desc: '100% safe & encrypted' },
  { icon: HiSparkles, title: 'Premium Quality', desc: 'Built to last' },
]

const slides = [
  {
    id: 1, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
    pill: 'T-Shirts Collection', heading: 'Define Your', highlight: 'Vibe',
    text: 'Premium cotton tees with bold graphics. Street-ready fits that speak for themselves.',
    link: '/collection?category=t-shirts',
  },
  {
    id: 2, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
    pill: 'Hoodies Collection', heading: 'Warm Up Your', highlight: 'Swagger',
    text: 'Heavyweight fleece hoodies built for the streets. Comfort meets attitude.',
    link: '/collection?category=hoodies',
  },
  {
    id: 3, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&q=80',
    pill: 'Denim Collection', heading: 'Built to', highlight: 'Last',
    text: 'Slim and relaxed fit jeans with premium denim washes. Your everyday staple.',
    link: '/collection?category=jeans',
  },
  {
    id: 4, img: 'https://images.unsplash.com/photo-1593032458809-6734071a5953?w=1200&q=80',
    pill: 'Streetwear Drop', heading: 'Street', highlight: 'Ready',
    text: 'Limited drops. Bold silhouettes. Gear up before they are gone.',
    link: '/collection?tags=street',
  },
]

export default function HomePage() {
  const catRef = useReveal()
  const catScrollRef = useRef(null)
  const scrollCategories = (dir) => {
    const el = catScrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
  const newRef = useReveal()
  const bannerRef = useReveal()
  const bestRef = useReveal()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(0)
  const slideRef = useRef(0)

  useEffect(() => {
    Promise.all([
      apiClient.get('/products?limit=8&sort=newest'),
      apiClient.get('/categories?active=true'),
    ]).then(([prod, cat]) => {
      setFeatured(prod.data.products)
      setCategories(cat.data.categories)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const goSlide = useCallback((i) => {
    const idx = ((i % slides.length) + slides.length) % slides.length
    slideRef.current = idx
    setSlide(idx)
  }, [])

  useEffect(() => {
    const t = setInterval(() => goSlide(slideRef.current + 1), 5000)
    return () => clearInterval(t)
  }, [goSlide])

  const s = slides[slide]

  return (
    <div>
      {/* ============================== */}
      {/* HERO — IMAGE SLIDER             */}
      {/* ============================== */}
      <section className="relative h-[85vh] md:h-[90vh] bg-gray-950 overflow-hidden">
        {/* Background images — crossfade */}
        {slides.map((sd, i) => (
          <div key={sd.id}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${sd.img})`, opacity: i === slide ? 1 : 0 }} />
        ))}
        {/* Overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/85 via-gray-950/50 to-gray-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-gray-950/30" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex items-center">
          <div key={s.id} className="max-w-2xl">
            {/* Pill badge */}
            <div className="animate-hero-fade-in" style={{ animationDelay: '0ms' }}>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-white/70 text-[11px] tracking-[0.15em] uppercase font-medium mb-6">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {s.pill}
              </span>
            </div>

            {/* Heading */}
            <h1 className="animate-hero-fade-in font-heading text-[clamp(2.5rem,9vw,5.5rem)] font-bold leading-[0.92] text-white tracking-tighter"
              style={{ animationDelay: '150ms' }}>
              {s.heading}
              <br />
              <span className="text-red-500">{s.highlight}</span>
            </h1>

            {/* Subtext */}
            <p className="animate-hero-fade-in text-gray-300 text-base md:text-lg max-w-lg mt-5 leading-relaxed"
              style={{ animationDelay: '300ms' }}>
              {s.text}
            </p>

            {/* CTA */}
            <div className="animate-hero-fade-in flex flex-wrap items-center gap-3 mt-8"
              style={{ animationDelay: '450ms' }}>
              <Link to={s.link}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all btn-press shadow-lg shadow-red-600/25">
                Shop {s.pill.split(' ')[0]} <HiArrowRight size={16} />
              </Link>
              <Link to="/collection"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-7 py-3.5 rounded-xl font-medium transition-all">
                All Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Progress bars dots */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-6 pb-8 flex items-center gap-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goSlide(i)}
                className={`relative h-1 rounded-full transition-all duration-500 overflow-hidden ${
                  i === slide ? 'w-12 bg-white/20' : 'w-8 bg-white/20 hover:bg-white/40'
                }`}>
                {i === slide && (
                  <span className="absolute inset-0 bg-red-500 rounded-full animate-progress" />
                )}
              </button>
            ))}
            <span className="text-white/30 text-xs font-mono ml-auto">
              {String(slide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* MARQUEE FEATURES                  */}
      {/* ============================== */}
      <section className="py-8 border-y border-gray-100 overflow-hidden bg-white">
        <LogoLoop
          logos={features}
          speed={60}
          direction="left"
          gap={24}
          hoverSpeed={0}
          fadeOut
          fadeOutColor="#ffffff"
          ariaLabel="Store features"
          renderItem={(f) => (
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-6 py-4 border border-gray-100">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <f.icon className="text-red-600" size={20} />
              </div>
              <div className="whitespace-nowrap">
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          )}
        />
      </section>

      {/* ============================== */}
      {/* CATEGORIES image top, name below */}
      {/* ============================== */}
      <section ref={catRef} className="py-14 px-4 reveal reveal-up">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-red-600 text-xs font-semibold tracking-[0.2em] uppercase">Collections</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">Shop by Category</h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">From street-ready tees to premium denim find your vibe.</p>
          </div>
          {loading ? (
            <div className="flex gap-4 md:gap-6 overflow-hidden">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="skeleton rounded-2xl flex-shrink-0 w-[42%] sm:w-[30%] md:w-[23%] lg:w-[18.4%]" style={{ aspectRatio: '1/1.2' }} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">No categories yet. Add them from the admin panel.</p>
          ) : (
            <>
              <div className="relative">
                {categories.length > 4 && (
                  <>
                    <button onClick={() => scrollCategories(-1)} aria-label="Scroll left"
                      className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full items-center justify-center hover:bg-gray-50 transition-colors">
                      <HiChevronLeft size={20} />
                    </button>
                    <button onClick={() => scrollCategories(1)} aria-label="Scroll right"
                      className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full items-center justify-center hover:bg-gray-50 transition-colors">
                      <HiChevronRight size={20} />
                    </button>
                  </>
                )}
                <div ref={catScrollRef} className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-2">
                {categories.map(cat => (
                  <Link key={cat._id} to={`/collection?category=${cat._id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex-shrink-0 snap-start w-[42%] sm:w-[30%] md:w-[23%] lg:w-[18.4%]">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="font-heading text-3xl font-bold text-gray-400">{cat.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-heading text-lg font-bold group-hover:text-red-600 transition-colors">{cat.name}</h3>
                      <p className="hidden lg:flex text-xs text-gray-400 mt-0.5 items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        Shop Now <HiArrowRight size={12} />
                      </p>
                    </div>
                  </Link>
                ))}
                </div>
              </div>
              <div className="text-center mt-8">
                <Link to="/collection"
                  className="inline-flex items-center gap-2 border-2 border-gray-200 hover:border-gray-900 px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all btn-press group">
                  View All Categories
                  <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============================== */}
      {/* NEW ARRIVALS                      */}
      {/* ============================== */}
      <section ref={newRef} className="py-10 px-4 reveal reveal-up">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-red-600 text-xs font-semibold tracking-[0.2em] uppercase">Fresh Drops</span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mt-1">New Arrivals</h2>
            </div>
            <Link to="/collection?sort=newest" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors group">
              View All <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="text-center sm:hidden mt-6">
            <Link to="/collection?sort=newest"
              className="inline-flex items-center gap-2 border-2 border-gray-200 px-8 py-3 rounded-2xl font-semibold text-sm btn-press">
              View All <HiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* BANNER                            */}
      {/* ============================== */}
      <section ref={bannerRef} className="mx-4 md:mx-8 rounded-3xl overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 my-10 reveal reveal-scale relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative px-8 py-16 md:py-20 text-center">
          <span className="text-red-400 text-xs font-semibold tracking-[0.2em] uppercase">Limited Edition</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mt-2">Street Ready</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mt-3 mb-8">Gear up with our latest streetwear collection. Limited drops once they're gone, they're gone.</p>
          <Link to="/collection?tags=street"
            className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-semibold text-sm btn-press shadow-2xl shadow-red-600/25 transition-all group">
            Explore Streetwear <HiArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ============================== */}
      {/* BEST SELLERS                      */}
      {/* ============================== */}
      <section ref={bestRef} className="py-10 px-4 reveal reveal-up">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-red-600 text-xs font-semibold tracking-[0.2em] uppercase">Most Loved</span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mt-1">Best Sellers</h2>
            </div>
            <Link to="/collection?sort=popularity" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors group">
              View All <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.slice(4, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
          <div className="text-center sm:hidden mt-6">
            <Link to="/collection?sort=popularity"
              className="inline-flex items-center gap-2 border-2 border-gray-200 px-8 py-3 rounded-2xl font-semibold text-sm btn-press">
              View All <HiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* TESTIMONIALS                      */}
      {/* ============================== */}
      <TestimonialsSection />

      {/* ============================== */}
      {/* NEWSLETTER                        */}
      {/* ============================== */}
      <section className="mx-4 md:mx-8 my-12 rounded-3xl bg-gray-950 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative px-8 py-14 md:py-16 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-2">Join the Crew</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">Be the first to know about drops, deals, and street culture.</p>
          <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email"
              className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500 transition-colors" />
            <button type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm btn-press transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

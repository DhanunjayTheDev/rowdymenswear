import { useState, useEffect, useCallback, useRef } from 'react'
import { HiChevronLeft, HiChevronRight, HiStar } from 'react-icons/hi'

const testimonials = [
  {
    id: 1, name: 'Arjun Mehta', handle: '@arjunm', location: 'Mumbai',
    text: 'The quality of these tees is insane. Been wearing Rowdy for months and they still look fresh. True streetwear energy.',
    rating: 5,
  },
  {
    id: 2, name: 'Rohit Sharma', handle: '@rohitsharma', location: 'Delhi',
    text: 'Best menswear brand in India hands down. The fits are perfect and the fabric feels premium. My go-to for casual wear.',
    rating: 5,
  },
  {
    id: 3, name: 'Vikram Singh', handle: '@vikramsingh', location: 'Bangalore',
    text: 'Ordered a hoodie and jeans. Delivery was fast, packaging was dope, and the quality exceeded my expectations.',
    rating: 5,
  },
  {
    id: 4, name: 'Priya Kapoor', handle: '@priyakapoor', location: 'Pune',
    text: 'Got the oversized tee for my boyfriend and he absolutely loves it. The streetwear aesthetic is on point.',
    rating: 5,
  },
  {
    id: 5, name: 'Karan Patel', handle: '@karanp', location: 'Ahmedabad',
    text: 'From the website experience to the product quality, everything is top notch. Highly recommend.',
    rating: 5,
  },
  {
    id: 6, name: 'Aditya Verma', handle: '@adityav', location: 'Hyderabad',
    text: 'The joggers are incredibly comfortable. Perfect for both chilling and casual outings. Worth every penny.',
    rating: 4,
  },
]

function Avatar({ name }) {
  const colors = ['bg-red-600', 'bg-gray-900', 'bg-amber-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600']
  const c = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-12 h-12 ${c} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {name.split(' ').map(n => n[0]).join('')}
    </div>
  )
}

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)
  const total = testimonials.length
  const perPage = 1

  const goTo = useCallback((idx) => {
    setCurrent(((idx % total) + total) % total)
  }, [total])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(next, 4000)
    return () => clearInterval(timerRef.current)
  }, [isPaused, next])

  const t = testimonials[current]

  return (
    <section className="py-20 px-4 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section heading */}
        <div className="text-center mb-14">
          <span className="text-red-600 text-xs font-semibold tracking-[0.2em] uppercase">Testimonials</span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mt-3 text-gray-900">
            What Our Crew Says
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">
            Real words from real people who wear Rowdy every day.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}>

          {/* Large decorative quote */}
          <div className="hidden md:block absolute -top-8 -left-4 text-[120px] font-heading font-bold text-red-600/10 leading-none select-none pointer-events-none">
            &ldquo;
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="md:flex md:items-start md:gap-10">
              {/* Avatar column */}
              <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 md:pt-2 mb-6 md:mb-0 md:w-32 flex-shrink-0">
                <Avatar name={t.name} />
                <div className="text-center">
                  <p className="font-heading font-bold text-lg md:text-xl">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HiStar key={i} size={18}
                      className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
                <blockquote className="text-lg md:text-2xl text-gray-800 leading-relaxed font-medium">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <p className="text-gray-400 text-xs mt-6">{t.handle}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={prev}
              className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all btn-press">
              <HiChevronLeft size={18} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-2 mx-3">
              {Array.from({ length: total }).map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-500 ${
                    i === current ? 'w-8 h-2.5 bg-gray-900' : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                  }`} />
              ))}
            </div>

            <button onClick={next}
              className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all btn-press">
              <HiChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bottom avatars strip as mini dots */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                i === current
                  ? 'bg-gray-900 text-white scale-110'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}>
              {testimonials[i].name.split(' ').map(n => n[0]).join('')}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

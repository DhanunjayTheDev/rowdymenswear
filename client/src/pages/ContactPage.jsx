import { useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '../lib/apiClient'
import { HiMail, HiPhone, HiLocationMarker, HiArrowRight } from 'react-icons/hi'

const contactInfo = [
  { icon: HiMail, title: 'Email', value: 'juluri.bhaskar123@gmail.com' },
  { icon: HiPhone, title: 'Phone', value: '96428 36806' },
  { icon: HiLocationMarker, title: 'Studio', value: 'Main Rd, opposite mdo office, Gurazala, Andhra Pradesh 522415' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post('/contact', form)
      toast.success("Message sent — we'll get back to you soon!")
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter">
      <section className="mx-4 md:mx-8 mt-6 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-black via-[#1a1a2e] to-brand-black relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative px-8 py-16 md:py-20 text-center">
          <span className="text-red-400 text-xs font-semibold tracking-[0.2em] uppercase">Get In Touch</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mt-2">We'd Love to Hear From You</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mt-3">Questions about an order, a product, or just want to say hi? Drop us a message.</p>
        </div>
      </section>

      <section className="px-4 py-12 max-w-5xl mx-auto grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2 space-y-4">
          {contactInfo.map((c, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <c.icon className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">{c.title}</p>
                <p className="text-sm font-semibold text-gray-900">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="John Doe" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Subject</label>
            <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
              placeholder="Order query, feedback, etc." required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Message</label>
            <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 min-h-[140px] transition-all"
              placeholder="Tell us what's up..." minLength={10} required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full sm:w-auto bg-brand-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm btn-press transition-all disabled:opacity-50 shadow-lg shadow-black/10 flex items-center justify-center gap-2 group">
            {loading ? 'Sending...' : <>Send Message <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
          </button>
        </form>
      </section>

      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm h-[350px]">
          <iframe
            title="Rowdy mens Wear location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.400462152496!2d79.6308338783509!3d16.55633828548738!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35455463da1cfd%3A0x72030d955269b0b8!2srowdy%20men's%20wear!5e0!3m2!1sen!2sin!4v1783143875816!5m2!1sen!2sin"
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
    </div>
  )
}

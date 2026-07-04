import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../lib/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await loginUser(email, password)
      if (data.user.role !== 'admin') {
        toast.error('Admin access required')
        return
      }
      toast.success('Welcome back!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative text-center px-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <ShieldCheck size={14} className="text-primary-500" />
            <span className="text-white/70 text-sm font-medium tracking-wide">ADMIN CONSOLE</span>
          </div>
          <h1 className="font-heading text-6xl font-bold text-white leading-[1.1]">
            ROWDY<br /><span className="text-primary-500">MENS WEAR</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-sm mx-auto leading-relaxed">
            Manage products, orders, coupons and customers from one place.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-heading text-3xl font-bold">ROWDY <span className="text-primary-600">ADMIN</span></h1>
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Admin Email</label>
              <input type="email" placeholder="you@rowdymenswear.com"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 group">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-gray-400">Restricted access — administrators only.</p>
        </div>
      </div>
    </div>
  )
}

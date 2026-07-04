import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../store/authSlice'
import { HiEye, HiEyeOff, HiArrowRight } from 'react-icons/hi'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading, error } = useSelector(s => s.auth)

  useEffect(() => { if (user) navigate(searchParams.get('redirect') || '/') }, [user, navigate, searchParams])

  const handleSubmit = (e) => { e.preventDefault(); dispatch(login({ email, password })) }

  return (
    <div className="min-h-[90vh] flex page-enter">
      {/* Left - Visual Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-black via-[#1a1a2e] to-brand-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }} />
        <div className="relative text-center px-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-white/70 text-sm font-medium">ROWDY mens WEAR</span>
          </div>
          <h1 className="font-heading text-6xl font-bold text-white leading-[1.1]">
            Welcome<br />Back to<br /><span className="text-gradient">Rowdy</span>
          </h1>
          <p className="text-gray-400 mt-4 max-w-sm mx-auto leading-relaxed">
            Sign in to access your orders, wishlist, and exclusive member prices.
          </p>
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary-600" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold lg:hidden">Welcome Back</h1>
            <h1 className="font-heading text-3xl font-bold hidden lg:block">Sign In</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="you@example.com" required />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 pr-12 transition-all"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-600 rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-black hover:bg-gray-800 text-white py-3.5 rounded-2xl font-semibold text-sm btn-press transition-all disabled:opacity-50 shadow-lg shadow-black/10 flex items-center justify-center gap-2 group">
              {loading ? 'Signing in...' : <>Sign In <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            New here?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

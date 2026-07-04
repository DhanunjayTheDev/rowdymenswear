import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { verifyRegisterOtp, clearError } from '../store/authSlice'
import * as authApi from '../lib/auth'
import toast from 'react-hot-toast'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import { HiEye, HiEyeOff, HiArrowRight, HiArrowLeft } from 'react-icons/hi'

const RESEND_COOLDOWN = 60

export default function RegisterPage() {
  const [step, setStep] = useState('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector(s => s.auth)
  const cooldownRef = useRef(null)

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    cooldownRef.current = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(cooldownRef.current)
  }, [cooldown])

  const startCooldown = () => setCooldown(RESEND_COOLDOWN)

  const sendOtp = async () => {
    setSendingOtp(true)
    setOtpError('')
    try {
      await authApi.sendRegisterOtp(name, email, password)
      toast.success('OTP sent — check the server terminal')
      setStep('otp')
      startCooldown()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setSendingOtp(false)
    }
  }

  const handleDetailsSubmit = (e) => {
    e.preventDefault()
    dispatch(clearError())
    sendOtp()
  }

  const handleResend = () => {
    if (cooldown > 0) return
    sendOtp()
  }

  const handleVerify = (e) => {
    e.preventDefault()
    dispatch(verifyRegisterOtp({ email, otp }))
  }

  return (
    <div className="min-h-[90vh] flex page-enter">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {step === 'details' ? (
            <>
              <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold">Join the Crew</h1>
                <p className="text-gray-500 text-sm mt-1">Create your Rowdy account and start shopping</p>
              </div>

              {otpError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-600 text-sm text-center">{otpError}</p>
                </div>
              )}

              <form onSubmit={handleDetailsSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                    placeholder="John Doe" required />
                </div>
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
                      placeholder="••••••••" required minLength={6} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPw ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} />
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" className="w-4 h-4 accent-primary-600 rounded mt-0.5" required />
                  <span className="text-xs text-gray-500">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:underline font-medium">Terms</a> and{' '}
                    <a href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</a>
                  </span>
                </div>

                <button type="submit" disabled={sendingOtp}
                  className="w-full bg-brand-black hover:bg-gray-800 text-white py-3.5 rounded-2xl font-semibold text-sm btn-press transition-all disabled:opacity-50 shadow-lg shadow-black/10 flex items-center justify-center gap-2 group">
                  {sendingOtp ? 'Sending OTP...' : <>Continue <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep('details')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <HiArrowLeft size={16} /> Back
              </button>
              <div className="mb-8">
                <h1 className="font-heading text-3xl font-bold">Verify Your Email</h1>
                <p className="text-gray-500 text-sm mt-1">Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{email}</span></p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">OTP Code</label>
                  <input type="text" inputMode="numeric" value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-center text-xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                    placeholder="000000" maxLength={6} required autoFocus />
                </div>

                <button type="submit" disabled={loading || otp.length !== 6}
                  className="w-full bg-brand-black hover:bg-gray-800 text-white py-3.5 rounded-2xl font-semibold text-sm btn-press transition-all disabled:opacity-50 shadow-lg shadow-black/10 flex items-center justify-center gap-2 group">
                  {loading ? 'Verifying...' : <>Create Account <HiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" /></>}
                </button>
              </form>

              <p className="text-center mt-8 text-sm text-gray-500">
                Didn't get the code?{' '}
                <button onClick={handleResend} disabled={cooldown > 0 || sendingOtp}
                  className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors disabled:opacity-50 disabled:no-underline">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right - Visual Brand */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-black via-[#1a1a2e] to-brand-black items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }} />
        <div className="relative text-center px-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-white/70 text-sm font-medium">FREE SHIPPING ABOVE ₹499</span>
          </div>
          <h1 className="font-heading text-6xl font-bold text-white leading-[1.1]">
            Become<br />Part of<br />the <span className="text-gradient">Movement</span>
          </h1>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {[
              { num: '10K+', label: 'Happy Customers' },
              { num: '500+', label: 'Products' },
              { num: '4.9★', label: 'Avg. Rating' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-heading text-2xl font-bold">{s.num}</p>
                <p className="text-gray-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { forgotPassword, resetPassword } from '../lib/auth'
import toast from 'react-hot-toast'
import { HiArrowLeft } from 'react-icons/hi'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleForgot = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    setSubmitting(true)
    try {
      await resetPassword(token, password)
      toast.success('Password reset! Please sign in.')
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }

  if (token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold">Reset Password</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your new password</p>
          </div>
          <form onSubmit={handleReset} className="space-y-4">
            <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" required minLength={6} />
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" required minLength={6} />
            <button type="submit" disabled={submitting}
              className="w-full bg-brand-black text-white py-3.5 rounded-2xl font-semibold text-sm btn-press disabled:opacity-50">
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="text-center mt-6"><Link to="/login" className="text-sm text-primary-600 hover:underline font-medium">Back to Sign In</Link></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">We'll send you a reset link</p>
        </div>
        {sent ? (
          <div className="text-center bg-green-50 rounded-2xl p-6 border border-green-200">
            <p className="font-medium text-green-700 mb-1">Check your email</p>
            <p className="text-sm text-green-600">Reset link sent to {email}</p>
            <Link to="/login" className="inline-block mt-4 text-sm font-medium text-primary-600 hover:underline">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="space-y-4">
            <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" required />
            <button type="submit" disabled={submitting}
              className="w-full bg-brand-black text-white py-3.5 rounded-2xl font-semibold text-sm btn-press disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <p className="text-center mt-6"><Link to="/login" className="text-sm text-primary-600 hover:underline font-medium">Back to Sign In</Link></p>
      </div>
    </div>
  )
}

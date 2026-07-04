import { useState } from 'react'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import { HiStar } from 'react-icons/hi'

export default function ReviewForm({ productId, existingReview, onSuccess, onCancel }) {
  const [rating, setRating] = useState(existingReview?.rating || 5)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (existingReview) {
        const { data } = await apiClient.put(`/reviews/${existingReview._id}`, { rating, comment })
        onSuccess(data.review)
        toast.success('Review updated')
      } else {
        const { data } = await apiClient.post(`/reviews/product/${productId}`, { rating, comment })
        onSuccess(data.review)
        toast.success('Review posted!')
      }
    } catch (err) { toast.error(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-4">
      {/* Star rating */}
      <div>
        <p className="text-sm font-medium mb-2">Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setRating(n)}
              className={`p-1 text-2xl transition-all btn-press ${n <= rating ? 'text-yellow-500 scale-110' : 'text-gray-300'}`}>
              <HiStar size={28} className={n <= rating ? 'fill-yellow-500' : ''} />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <textarea value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Share your thoughts..."
        className="w-full px-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 min-h-[100px] resize-none"
        required />

      {/* Actions */}
      <div className="flex gap-3">
        <button type="submit" disabled={submitting}
          className="flex-1 bg-brand-black text-white py-3 rounded-2xl text-sm font-medium btn-press disabled:opacity-50 transition-colors">
          {submitting ? 'Posting...' : existingReview ? 'Update Review' : 'Post Review'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-3 border border-gray-200 rounded-2xl text-sm font-medium btn-press hover:bg-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

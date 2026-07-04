import { useState } from 'react'
import ReviewForm from './ReviewForm'
import { useSelector } from 'react-redux'
import apiClient from '../lib/apiClient'
import toast from 'react-hot-toast'
import { HiStar, HiPencil, HiTrash } from 'react-icons/hi'
import ConfirmDialog from './ConfirmDialog'

export default function ReviewList({ productId, reviews: initialReviews, averageRating, totalReviews, onUpdate }) {
  const [reviews, setReviews] = useState(initialReviews || [])
  const [showForm, setShowForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const user = useSelector(s => s.auth.user)
  const userReview = reviews.find(r => r.user?._id === user?._id)

  const handleDelete = async () => {
    const id = deleteTarget
    setDeleteTarget(null)
    try {
      await apiClient.delete(`/reviews/${id}`)
      setReviews(prev => prev.filter(r => r._id !== id))
      toast.success('Review deleted')
      onUpdate?.()
    } catch (err) { toast.error(err.message) }
  }

  const handleSuccess = (review) => {
    if (userReview) {
      setReviews(prev => prev.map(r => r._id === userReview._id ? review : r))
    } else {
      setReviews(prev => [review, ...prev])
    }
    setShowForm(false)
    onUpdate?.()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-xl font-bold">Reviews</h3>
          {averageRating > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
              <HiStar className="text-yellow-500 fill-yellow-500" size={16} />
              {averageRating} · {totalReviews} reviews
            </p>
          )}
        </div>
        {user && !userReview && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-brand-black text-white px-5 py-2.5 rounded-2xl text-sm font-medium btn-press">
            <HiPencil size={16} /> Write
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <ReviewForm productId={productId} existingReview={userReview} onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
      )}

      {/* User's own review highlighted */}
      {userReview && (
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-black text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {userReview.user?.name?.[0] || 'Y'}
              </div>
              <div>
                <p className="font-semibold text-sm">{userReview.user?.name || 'You'}</p>
                <p className="text-yellow-500 text-xs">{'★'.repeat(userReview.rating)}{'☆'.repeat(5 - userReview.rating)}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {showForm ? null : <button onClick={() => setShowForm(true)} className="p-2 text-gray-400 hover:text-primary-600 rounded-xl hover:bg-white transition-colors"><HiPencil size={16} /></button>}
              <button onClick={() => setDeleteTarget(userReview._id)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-white transition-colors"><HiTrash size={16} /></button>
            </div>
          </div>
          {!showForm && <p className="text-sm text-gray-700 mt-3 leading-relaxed">{userReview.comment || 'No comment'}</p>}
          {showForm && (
            <div className="mt-3">
              <ReviewForm productId={productId} existingReview={userReview} onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
            </div>
          )}
        </div>
      )}

      {/* Other reviews */}
      {reviews.filter(r => r.user?._id !== user?._id).map(review => (
        <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-gray-600">
              {review.user?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-medium text-sm">{review.user?.name || 'Anonymous'}</p>
              <p className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pl-12">{review.comment}</p>
        </div>
      ))}

      {reviews.length === 0 && !showForm && (
        <div className="text-center py-10 text-gray-400">
          <p className="text-lg mb-1">No reviews yet</p>
          <p className="text-sm">Be the first to review this product</p>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete your review?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { FiStar, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'
import api from '../lib/api'
import { formatDate } from '../lib/utils'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    avatar?: string
  }
}

interface ReviewsProps {
  productId: string
  rating: number
  reviewCount: number
}

const Reviews = ({ productId, rating, reviewCount }: ReviewsProps) => {
  const { isAuthenticated } = useAuthStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/products/${productId}/reviews`)
        setReviews(data.reviews || data)
      } catch {
        // Reviews endpoint might not exist yet
        setReviews([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchReviews()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Silakan login untuk memberikan ulasan')
      return
    }

    setIsSubmitting(true)
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, {
        rating: newRating,
        comment,
      })
      setReviews(prev => [data, ...prev])
      setComment('')
      setNewRating(5)
      setShowForm(false)
      toast.success('Ulasan berhasil dikirim!')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengirim ulasan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (interactive ? (hoverRating || newRating) : count) ? 'active' : ''}`}
            onClick={() => interactive && setNewRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            aria-label={`${star} bintang`}
          >
            <FiStar
              size={interactive ? 20 : 14}
              fill={star <= (interactive ? (hoverRating || newRating) : count) ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>
    )
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>Ulasan Produk</h3>
        {isAuthenticated && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Batal' : 'Tulis Ulasan'}
          </button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-overall">
          <span className="rating-number">{rating > 0 ? rating.toFixed(1) : '-'}</span>
          {renderStars(Math.round(rating))}
          <span className="rating-count">{reviewCount} ulasan</span>
        </div>
        <div className="rating-bars">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="rating-bar-row">
              <span className="rating-bar-label">{star}</span>
              <div className="rating-bar-track">
                <div className="rating-bar-fill" style={{ width: `${percentage}%` }} />
              </div>
              <span className="rating-bar-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <h4>Berikan Ulasan</h4>
          <div className="form-group">
            <label>Rating</label>
            {renderStars(newRating, true)}
          </div>
          <div className="form-group">
            <label>Komentar</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Ceritakan pengalaman Anda dengan produk ini..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <FiSend size={14} /> {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {isLoading ? (
          <div className="reviews-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="review-card">
                <div className="review-header">
                  <div className="skeleton skeleton-text short" style={{ height: '1rem', width: 120 }} />
                  <div className="skeleton skeleton-text" style={{ height: '0.875rem', width: 80 }} />
                </div>
                <div className="skeleton skeleton-text" style={{ height: '0.875rem', marginTop: '0.75rem' }} />
                <div className="skeleton skeleton-text medium" style={{ height: '0.875rem', marginTop: '0.5rem' }} />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            <p>Belum ada ulasan untuk produk ini</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-user">
                  <div className="review-avatar">
                    {review.user.avatar ? (
                      <img src={review.user.avatar} alt={review.user.name} />
                    ) : (
                      <span>{review.user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="review-name">{review.user.name}</p>
                    <p className="review-date">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Reviews

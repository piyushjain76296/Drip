'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Camera, Send } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onSubmitted: () => void;
}

export function ReviewForm({ productId, onSubmitted }: ReviewFormProps) {
  const { user, getToken } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          <a href="/auth/login" className="text-violet font-semibold hover:underline">Sign in</a> to leave a review
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }

    setLoading(true);
    const token = await getToken();
    if (!token) { setLoading(false); return; }

    try {
      await api.reviews.create({ productId, rating, title, comment }, token);
      toast.success('Review submitted! 🎉');
      setRating(0); setTitle(''); setComment('');
      onSubmitted();
    } catch (e: any) {
      toast.error(e.message || 'Failed to submit review');
    }
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="font-bold text-sm mb-4">Write a Review</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Your Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)}>
                <Star size={24} className={`transition-colors ${star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title (optional)"
          className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet" />

        {/* Comment */}
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this product..."
          rows={4} className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet resize-none" />

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
          className="bg-violet text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50">
          <Send size={14} />
          {loading ? 'Submitting...' : 'Submit Review'}
        </motion.button>
      </form>
    </div>
  );
}

// ============================================================
// Review List
// ============================================================
interface ReviewListProps {
  productId: string;
  refreshKey?: number;
}

export function ReviewList({ productId, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  const fetchReviews = async () => {
    try {
      const data = await api.reviews.list(productId, { sort });
      setReviews(data.reviews);
      setBreakdown(data.breakdown);
      setTotal(data.pagination.total);
      if (data.pagination.total > 0) {
        const sum = Object.entries(data.breakdown).reduce((acc, [rating, count]) => acc + Number(rating) * (count as number), 0);
        setAvgRating(Math.round((sum / data.pagination.total) * 10) / 10);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Refetch on refreshKey or sort change
  useState(() => { fetchReviews(); });

  if (loading) return <div className="text-center py-8"><div className="w-6 h-6 border-2 border-violet border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Big number */}
          <div className="text-center sm:text-left">
            <p className="text-5xl font-black">{avgRating || '—'}</p>
            <div className="flex gap-0.5 justify-center sm:justify-start mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{total} reviews</p>
          </div>

          {/* Breakdown bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-3 text-muted-foreground">{star}</span>
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: total > 0 ? `${(breakdown[star] / total) * 100}%` : '0%' }} />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right">{breakdown[star]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{total} Reviews</p>
        <select value={sort} onChange={(e) => { setSort(e.target.value); }}
          className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
          <option value="newest">Newest</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-violet/10 flex items-center justify-center text-xs font-bold text-violet">
                  {review.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold">{review.user?.name || 'Anonymous'}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'} />
                      ))}
                    </div>
                    {review.verified && <span className="text-[10px] font-semibold bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">✓ Verified</span>}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground ml-auto">{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              {review.title && <p className="text-sm font-semibold mb-1">{review.title}</p>}
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

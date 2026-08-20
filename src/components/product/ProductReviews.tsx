"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    const response = await fetch(`/api/products/${productId}/reviews`);
    const result = await response.json();
    if (response.ok) {
      setReviews(result.reviews ?? []);
      setAverage(result.average ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => { loadReviews(); }, [productId]);

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not save your review.");
    } else {
      setMessage("Thanks, your feedback has been saved.");
      setComment("");
      setRating(0);
      await loadReviews();
    }
    setSaving(false);
  }

  return (
    <section className="product-reviews" aria-labelledby="reviews-heading">
      <div className="product-reviews__header">
        <div>
          <p className="section-eyebrow">Customer feedback</p>
          <h2 id="reviews-heading" className="section-title">Reviews</h2>
        </div>
        <div className="product-reviews__summary" aria-label={`${average} out of 5 stars from ${reviews.length} reviews`}>
          <strong>{average ? average.toFixed(1) : "New"}</strong>
          <span>{average ? "★" : ""} {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
        </div>
      </div>

      <form className="product-reviews__form" onSubmit={submitReview}>
        <div className="product-reviews__form-heading">
          <h3>Share your experience</h3>
          <span>Sign in is required to keep feedback genuine.</span>
        </div>
        <div className="product-reviews__stars" role="radiogroup" aria-label="Your rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" className={value <= rating ? "is-selected" : ""} onClick={() => setRating(value)} role="radio" aria-checked={value === rating} aria-label={`${value} star${value === 1 ? "" : "s"}`}>
              ★
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did you like about this product?" minLength={10} maxLength={1000} required rows={3} />
        <div className="product-reviews__form-footer">
          <span>{message || "10 to 1000 characters"}</span>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving || rating === 0}>{saving ? "Saving..." : "Post review"}</button>
        </div>
      </form>

      {loading ? <p className="product-reviews__empty">Loading reviews...</p> : reviews.length === 0 ? (
        <p className="product-reviews__empty">No reviews yet. Be the first customer to share feedback.</p>
      ) : (
        <div className="product-reviews__list">
          {reviews.map((review) => (
            <article key={review.id} className="product-review">
              <div className="product-review__topline">
                <strong>{review.reviewer_name}</strong>
                <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString()}</time>
              </div>
              <div className="product-review__stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      )}
      <p className="product-reviews__login-note">Want to leave feedback? <Link href="/login">Sign in to your account</Link>.</p>
    </section>
  );
}
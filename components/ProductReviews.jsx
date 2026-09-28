"use client";

import { useState, useEffect } from "react";
import { Reveal } from "@/components/Reveal";

/* ── Star helpers ─────────────────────────── */
function Stars({ count, max = 5 }) {
  const n = Math.min(Math.max(parseInt(count) || 0, 0), max);
  return (
    <span className="review-stars" aria-label={`${n} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" aria-hidden="true"
          className={i < n ? "review-star review-star--filled" : "review-star"}>
          <path d="M8 1l1.85 3.75 4.14.6-3 2.92.7 4.1L8 10.35l-3.7 1.95.71-4.1-2.99-2.92 4.14-.6z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });
  return (
    <article className="review-card">
      <div className="review-card__meta">
        <Stars count={review.star} />
        <span className="review-card__author">{review.customer_name}</span>
        <time className="review-card__date eyebrow">{date}</time>
      </div>
      {review.title && <h3 className="review-card__title">{review.title}</h3>}
      <p className="review-card__comment">{review.comment}</p>
    </article>
  );
}

/* ── Main component ───────────────────────── */
export default function ProductReviews({ product }) {
  const [reviews, setReviews]         = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [formData, setFormData] = useState({
    customer_name: "", customer_email: "", star: "", comment: ""
  });
  const [errors,        setErrors]        = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  /* Fetch published reviews */
  useEffect(() => {
    if (!product?.product_id) return;
    const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
    fetch(`${base}/api/products/${product.product_id}/reviews`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setReviews(Array.isArray(data) ? data.filter(r => r.status === "published") : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [product?.product_id]);

  /* Form helpers */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.customer_name.trim()) e.customer_name = "Name is required.";
    if (!formData.customer_email.trim()) e.customer_email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) e.customer_email = "Enter a valid email.";
    if (!formData.star) e.star = "Please select a rating.";
    if (!formData.comment.trim()) e.comment = "Review is required.";
    else if (formData.comment.trim().length < 10) e.comment = "Minimum 10 characters.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res  = await fetch(`${base}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          product_id:     product?.product_id,
          star:           String(formData.star),
          comment:        formData.comment.trim(),
          customer_name:  formData.customer_name.trim(),
          customer_email: formData.customer_email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatusMessage({ type: "success", text: data?.message || "Thank you! Your review will appear after approval." });
        setFormData({ customer_name: "", customer_email: "", star: "", comment: "" });
      } else {
        const be = {};
        if (data?.errors) Object.keys(data.errors).forEach(k => { be[k] = Array.isArray(data.errors[k]) ? data.errors[k][0] : data.errors[k]; });
        setErrors(be);
        setStatusMessage({ type: "error", text: data?.message || "Could not submit. Please check your inputs." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Unable to connect. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + parseInt(r.star || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="product-reviews">

      {/* Section header */}
      <Reveal>
        <div className="product-reviews__header">
          <p className="eyebrow">Reviews</p>
          <div className="product-reviews__header-row">
            <h2>What stays in the air.</h2>
            {avg && (
              <div className="product-reviews__avg">
                <span className="product-reviews__avg-score">{avg}</span>
                <Stars count={Math.round(avg)} />
                <span className="product-reviews__avg-count eyebrow">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* Two-column: reviews left, form right */}
      <div className="product-reviews__body">

        {/* Left — published reviews list */}
        <div className="product-reviews__list">
          {reviewsLoading ? (
            <p className="product-reviews__empty eyebrow">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <div className="product-reviews__empty">
              <p className="eyebrow">No reviews yet</p>
              <p>Be the first to share how this fragrance moved with you.</p>
            </div>
          ) : (
            <div className="review-list">
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
          )}
        </div>

        {/* Right — submission form */}
        <Reveal className="review-form-card">
          <p className="eyebrow">Write a Review</p>

          {statusMessage && (
            <div className={`review-status review-status--${statusMessage.type}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label>
              <span>Your Name *</span>
              <input name="customer_name" type="text" value={formData.customer_name}
                onChange={handleChange} placeholder="e.g. Eleanor Vance"
                maxLength={100} disabled={isSubmitting} />
              {errors.customer_name && <span className="field-error">{errors.customer_name}</span>}
            </label>

            <label>
              <span>Your Email *</span>
              <input name="customer_email" type="email" value={formData.customer_email}
                onChange={handleChange} placeholder="e.g. eleanor@example.com"
                maxLength={100} disabled={isSubmitting} />
              {errors.customer_email && <span className="field-error">{errors.customer_email}</span>}
            </label>

            <label>
              <span>Rating *</span>
              <select name="star" value={formData.star} onChange={handleChange} disabled={isSubmitting}>
                <option value="" disabled>Select rating</option>
                <option value="5">★★★★★ — Stayed beautifully</option>
                <option value="4">★★★★☆ — Memorable</option>
                <option value="3">★★★☆☆ — Still discovering</option>
                <option value="2">★★☆☆☆ — Not my air</option>
                <option value="1">★☆☆☆☆ — Disappointing</option>
              </select>
              {errors.star && <span className="field-error">{errors.star}</span>}
            </label>

            <label>
              <span>Your Review *</span>
              <textarea name="comment" rows="5" value={formData.comment}
                onChange={handleChange}
                placeholder="How did it open, settle and remain?"
                disabled={isSubmitting} />
              {errors.comment && <span className="field-error">{errors.comment}</span>}
            </label>

            <div className="review-form-card__actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit Review"}
              </button>
              <p className="review-form__note eyebrow">Reviews are published after approval.</p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

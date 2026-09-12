"use client";

import { useState } from "react";
import { LineReveal, Reveal, Stagger, StaggerItem } from "@/components/Reveal";

const reviewPrompts = [
  ["01", "How it opened", "First impression, freshness and immediate character."],
  ["02", "How it settled", "What stayed close to skin after the first hour."],
  ["03", "What remained", "The trail, memory and final presence in the air."]
];

export default function ProductReviews({ product }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    star: "",
    title: "",
    comment: ""
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!product?.product_id) {
      newErrors.product_id = "Product information is missing.";
    }

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Name is required.";
    } else if (formData.customer_name.trim().length > 100) {
      newErrors.customer_name = "Name must not exceed 100 characters.";
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email.trim())) {
      newErrors.customer_email = "Please enter a valid email address.";
    } else if (formData.customer_email.trim().length > 100) {
      newErrors.customer_email = "Email must not exceed 100 characters.";
    }

    if (!formData.star) {
      newErrors.star = "Please select a rating.";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Review title is required.";
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Review comment is required.";
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = "Review comment must be at least 10 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://phpstack-1664344-6634175.cloudwaysapps.com/public/";
      const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      const endpoint = `${cleanBaseUrl}api/reviews`;

      const payload = {
        product_id: product?.product_id,
        star: String(formData.star),
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim()
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: data?.message || "Thank you! Your review has been submitted successfully."
        });
        setFormData({
          customer_name: "",
          customer_email: "",
          star: "",
          title: "",
          comment: ""
        });
      } else {
        const backendErrors = {};
        if (data?.errors && typeof data.errors === "object") {
          Object.keys(data.errors).forEach((key) => {
            const errVal = data.errors[key];
            backendErrors[key] = Array.isArray(errVal) ? errVal[0] : errVal;
          });
          setErrors(backendErrors);
        }
        setStatusMessage({
          type: "error",
          text: data?.message || "Failed to submit review. Please check your inputs and try again."
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Unable to submit review. Please check your internet connection and try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="product-reviews">
      <Reveal>
        <div className="product-reviews__header">
          <p className="eyebrow">User Reviews</p>
          <h2><LineReveal>Let the air speak after wearing.</LineReveal></h2>
          <p className="body-copy">Reviews for {product?.name || product?.product_name || "this fragrance"} will appear here after customer accounts and verified purchases are connected.</p>
        </div>
      </Reveal>

      <div className="product-reviews__grid">
        <Stagger className="review-prompt-grid">
          {reviewPrompts.map(([number, title, copy]) => (
            <StaggerItem key={title}>
              <article>
                <p className="eyebrow">{number}</p>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="review-form-card">
          <p className="eyebrow">Write a Review</p>

          {statusMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                border: `1px solid ${statusMessage.type === "success" ? "#15803d" : "#b91c1c"}`,
                color: statusMessage.type === "success" ? "#15803d" : "#b91c1c",
                backgroundColor: statusMessage.type === "success" ? "#f0fdf4" : "#fff5f5",
                fontSize: "13px"
              }}
            >
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <label>
              <span>Your Name *</span>
              <input
                name="customer_name"
                type="text"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="e.g. Eleanor Vance"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.customer_name && <span className="field-error">{errors.customer_name}</span>}
            </label>

            <label>
              <span>Your Email *</span>
              <input
                name="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={handleChange}
                placeholder="e.g. eleanor@example.com"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.customer_email && <span className="field-error">{errors.customer_email}</span>}
            </label>

            <label>
              <span>Rating *</span>
              <select
                name="star"
                value={formData.star}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="" disabled>Select rating</option>
                <option value="5">5 - Stayed beautifully</option>
                <option value="4">4 - Memorable</option>
                <option value="3">3 - Still discovering</option>
                <option value="2">2 - Not my air</option>
                <option value="1">1 - Disappointing</option>
              </select>
              {errors.star && <span className="field-error">{errors.star}</span>}
            </label>

            <label>
              <span>Review title *</span>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="A quiet trace after dark"
                disabled={isSubmitting}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </label>

            <label>
              <span>Your review *</span>
              <textarea
                name="comment"
                rows="5"
                value={formData.comment}
                onChange={handleChange}
                placeholder="How did it open, settle and remain? (min 10 characters)"
                disabled={isSubmitting}
              />
              {errors.comment && <span className="field-error">{errors.comment}</span>}
            </label>

            {errors.product_id && <span className="field-error">{errors.product_id}</span>}

            <div className="review-form-card__actions">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit review"}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

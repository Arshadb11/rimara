import Link from "next/link";
import { LineReveal, Reveal, Stagger, StaggerItem } from "@/components/Reveal";

const reviewPrompts = [
  ["01", "How it opened", "First impression, freshness and immediate character."],
  ["02", "How it settled", "What stayed close to skin after the first hour."],
  ["03", "What remained", "The trail, memory and final presence in the air."]
];

export default function ProductReviews({ product }) {
  return (
    <section className="product-reviews">
      <Reveal>
        <div className="product-reviews__header">
          <p className="eyebrow">User Reviews</p>
          <h2><LineReveal>Let the air speak after wearing.</LineReveal></h2>
          <p className="body-copy">Reviews for {product.name} will appear here after customer accounts and verified purchases are connected.</p>
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
          <form>
            <label>
              <span>Rating</span>
              <select name="rating" defaultValue="">
                <option value="" disabled>Select rating</option>
                <option>5 - Stayed beautifully</option>
                <option>4 - Memorable</option>
                <option>3 - Still discovering</option>
                <option>2 - Not my air</option>
              </select>
            </label>
            <label>
              <span>Review title</span>
              <input name="title" type="text" placeholder="A quiet trace after dark" />
            </label>
            <label>
              <span>Your review</span>
              <textarea name="review" rows="5" placeholder="How did it open, settle and remain?" />
            </label>
            <div className="review-form-card__actions">
              <button type="button">Submit review</button>
              <Link href="/login">Login to review</Link>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

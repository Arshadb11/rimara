"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { HairlineDraw, LineReveal, Reveal, ease } from "@/components/Reveal";

/* Fragrance index order */
// All weight arrays are indexed as: [quiet-blossom, wild-air, air-that-stays, last-light]
const SLUGS = ["quiet-blossom", "wild-air", "air-that-stays", "last-light"];

/* Weight tables */
const EVENT_WEIGHTS = {
  date:     [2, 0, 2, 1],
  casual:   [1, 2, 0, 1],
  occasion: [1, 0, 2, 2],
  party:    [0, 2, 1, 1],
};

const FEELING_WEIGHTS = {
  intimate: [3, 0, 3, 1],
  wild:     [0, 3, 1, 0],
  warm:     [1, 0, 2, 3],
  lasting:  [2, 0, 3, 2],
};

const PRESENCE_WEIGHTS = {
  "soft & close":     [3, 0, 1, 1],
  "clean & moving":   [1, 3, 0, 1],
  "warm & intimate":  [1, 0, 3, 3],
  "deep & memorable": [1, 0, 3, 3],
};

const TEXTURE_WEIGHTS = {
  clean:  [2, 3, 0, 1],
  floral: [3, 0, 0, 0],
  musky:  [3, 0, 1, 1],
  woody:  [0, 2, 3, 3],
};

const CITY_WEIGHTS = {
  paris:      [3, 0, 1, 1],
  santorini:  [3, 1, 0, 1],
  "new york": [0, 3, 1, 1],
  tokyo:      [0, 3, 0, 1],
  london:     [0, 0, 3, 2],
  marrakech:  [0, 0, 3, 2],
  milan:      [0, 1, 1, 3],
  dubai:      [0, 0, 2, 3],
};

/* Gender exclusion mask */
function genderMask(who) {
  switch ((who || "").toLowerCase()) {
    case "him":    return [false, true,  true,  true];
    case "her":    return [true,  false, true,  true];
    case "unisex": return [false, false, true,  true];
    default:       return [true,  true,  true,  true];
  }
}

/* Tie-break priority */
const TIE_BREAK_ORDER = {
  him:    [1, 2, 3, 0],
  her:    [2, 3, 0, 1],
  unisex: [2, 3, 0, 1],
};

function tiePriority(who, idx) {
  const order = TIE_BREAK_ORDER[(who || "").toLowerCase()] || [0, 1, 2, 3];
  const pos = order.indexOf(idx);
  return pos === -1 ? 999 : pos;
}

/* Scoring engine */
function scoreFragrances(form) {
  const { who, event, feeling, presence, texture, city } = form;
  const scores = [0, 0, 0, 0];

  const add = (table, key) => {
    const row = table[(key || "").toLowerCase()];
    if (row) row.forEach((w, i) => { scores[i] += w; });
  };

  add(EVENT_WEIGHTS,    event);
  add(FEELING_WEIGHTS,  feeling);
  add(PRESENCE_WEIGHTS, presence);
  add(TEXTURE_WEIGHTS,  texture);
  add(CITY_WEIGHTS,     city);

  const mask = genderMask(who);

  return SLUGS
    .map((slug, i) => ({ slug, score: mask[i] ? scores[i] : -1, idx: i }))
    .filter((f) => f.score >= 0)
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : tiePriority(who, a.idx) - tiePriority(who, b.idx)
    );
}

/* Product colour map */
const productSettings = {
  "quiet-blossom": { color: "#d4a0a8", ctx: "Explore Quiet Blossom" },
  "wild-air":      { color: "#8ab0c8", ctx: "Explore Wild Air" },
  "last-light":    { color: "#e0a040", ctx: "Explore Last Light" },
  "air-that-stays":{ color: "#b3a469", ctx: "Explore Air That Stays" },
  "discovery-pack":{ color: "#4a4a46", ctx: "Discover the pack" },
};

function slugify(name = "") {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function enrichProduct(product) {
  const slug = slugify(product.product_name);
  const settings = productSettings[slug] || {};
  return { ...product, ...settings, slug };
}

/* Diagnostic Result Modal */
function DiagnosticModal({ product, onClose, onReset }) {
  const href =
    product.slug === "discovery-pack"
      ? "/shop/discovery-pack"
      : `/shop/fragrances/${product.slug}`;

  const images = (() => {
    try { return JSON.parse(product.images); }
    catch { return []; }
  })();
  const baseImg = images[0]
    ? `${process.env.NEXT_PUBLIC_API_URL}storage/${images[0]}`
    : null;

  const description = (product.description || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tags = (product.item_classification || "")
    .split(/[·,\/]/).map((t) => t.trim()).filter(Boolean);

  const price = product.price
    ? `AED ${parseFloat(product.price).toLocaleString()}`
    : null;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="diagnostic-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Your fragrance match: ${product.product_name}`}
    >
      <motion.div
        className="diagnostic-modal"
        style={{ "--modal-accent": product.color || "#b3a469" }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.48, ease }}
      >
        <button
          className="diagnostic-modal__close"
          onClick={onClose}
          aria-label="Close result"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
          </svg>
        </button>

        <div className="diagnostic-modal__media">
          {baseImg && (
            <Image
              className="diagnostic-modal__img"
              src={baseImg}
              alt={product.product_name}
              fill
              sizes="(max-width: 720px) 100vw, 50vw"
              priority
            />
          )}
        </div>

        <div className="diagnostic-modal__body">
          <p className="diagnostic-modal__match-label">Your Fragrance Match</p>
          <h2 className="diagnostic-modal__name">{product.product_name}</h2>
          {product.occasion && (
            <p className="diagnostic-modal__occasion">{product.occasion}</p>
          )}
          <div className="diagnostic-modal__divider" />

          {tags.length > 0 && (
            <div className="diagnostic-modal__classification">
              {tags.map((tag) => (
                <span key={tag} className="diagnostic-modal__tag">{tag}</span>
              ))}
            </div>
          )}

          {description && (
            <p className="diagnostic-modal__description">{description}</p>
          )}

          {price && (
            <p className="diagnostic-modal__price">
              {price}<span>incl. VAT</span>
            </p>
          )}

          <div className="diagnostic-modal__actions">
            <Link href={href} className="diagnostic-modal__cta-primary">
              Explore Fragrance &rarr;
            </Link>
            <button
              className="diagnostic-modal__cta-secondary"
              onClick={() => { onClose(); onReset(); }}
            >
              Start again
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* Field labels */
const FIELD_LABELS = {
  who:      "Who is this for",
  feeling:  "What is the Feeling",
  city:     "City",
  event:    "What is the Event",
  texture:  "Texture",
  presence: "Presence",
};

/* Main export */
export default function DiagnosticForm() {
  const [form, setForm] = useState({
    who:      "",
    feeling:  "",
    city:     "",
    event:    "",
    texture:  "",
    presence: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const resultsRef = useRef(null);

  const emptyFields = Object.keys(form).filter((k) => !form[k]);
  const allFilled   = emptyFields.length === 0;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (!allFilled) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const ranking = scoreFragrances(form);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "http://localhost:3000",
          },
          body: JSON.stringify({ limit: "20", page: "1" }),
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch fragrances.");

      const data = await response.json();
      const raw  = data?.products?.data || [];
      const enriched = raw.map((p) => enrichProduct(p));

      // Pick only the single best match
      const best = ranking
        .slice(0, 1)
        .map(({ slug, score }) => {
          const product = enriched.find((p) => p.slug === slug);
          return product ? { ...product, _score: score } : null;
        })
        .filter(Boolean);

      setResults(best.length > 0 ? best[0] : null);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }

  function handleReset() {
    setForm({ who: "", feeling: "", city: "", event: "", texture: "", presence: "" });
    setResults(null);
    setError(null);
    setSubmitted(false);
  }

  const hasResult = results !== null;

  return (
    <>
      <section className="diagnostic-form-section">
        <HairlineDraw />
        <Reveal>
          <div className="diagnostic-form-intro">
            <p className="eyebrow">Fragrance Form</p>
            <h2>
              <LineReveal>Tell us what should remain in the air.</LineReveal>
            </h2>
          </div>
        </Reveal>

        <form id="diagnostic-form" className="diagnostic-form" onSubmit={handleSubmit}>
          {/* Panel 01 - Who & Feeling */}
          <div className="diagnostic-form__panel diagnostic-form__panel--dark">
            <p className="eyebrow">01 / Mood</p>
            <label>
              <span>Who is this for?</span>
              <select name="who" value={form.who} onChange={handleChange} required
                className={submitted && !form.who ? "select--error" : ""}>
                <option value="" disabled>Select</option>
                <option>Him</option>
                <option>Her</option>
                <option>Unisex</option>
              </select>
            </label>
            <label>
              <span>What is the Feeling?</span>
              <select name="feeling" value={form.feeling} onChange={handleChange} required
                className={submitted && !form.feeling ? "select--error" : ""}>
                <option value="" disabled>Select a feeling</option>
                <option>Intimate</option>
                <option>Wild</option>
                <option>Warm</option>
                <option>Lasting</option>
              </select>
            </label>
          </div>

          {/* Panel 02 - City & Event */}
          <div className="diagnostic-form__panel">
            <p className="eyebrow">02 / Place &amp; Occasion</p>
            <label>
              <span>Which city are you in the mood of travelling?</span>
              <select name="city" value={form.city} onChange={handleChange} required
                className={submitted && !form.city ? "select--error" : ""}>
                <option value="" disabled>Select a city</option>
                <option>Paris</option>
                <option>Santorini</option>
                <option>New York</option>
                <option>Tokyo</option>
                <option>London</option>
                <option>Marrakech</option>
                <option>Milan</option>
                <option>Dubai</option>
              </select>
            </label>
            <label>
              <span>What is the Event?</span>
              <select name="event" value={form.event} onChange={handleChange} required
                className={submitted && !form.event ? "select--error" : ""}>
                <option value="" disabled>Select an event</option>
                <option>Date</option>
                <option>Casual</option>
                <option>Occasion</option>
                <option>Party</option>
              </select>
            </label>
          </div>

          {/* Panel 03 - Texture & Presence */}
          <div className="diagnostic-form__panel">
            <p className="eyebrow">03 / Scent</p>
            <label>
              <span>Texture</span>
              <select name="texture" value={form.texture} onChange={handleChange} required
                className={submitted && !form.texture ? "select--error" : ""}>
                <option value="" disabled>Select texture</option>
                <option>Clean</option>
                <option>Floral</option>
                <option>Musky</option>
                <option>Woody</option>
              </select>
            </label>
            <label>
              <span>Presence</span>
              <select name="presence" value={form.presence} onChange={handleChange} required
                className={submitted && !form.presence ? "select--error" : ""}>
                <option value="" disabled>Select presence</option>
                <option>Soft &amp; Close</option>
                <option>Clean &amp; Moving</option>
                <option>Warm &amp; Intimate</option>
                <option>Deep &amp; Memorable</option>
              </select>
            </label>
          </div>
        </form>

        {/* Buttons below form, centered */}
        <div className="diagnostic-form-footer">
          {submitted && !allFilled && (
            <p className="diagnostic-validation-msg" role="alert">
              Please complete:{" "}
              {emptyFields.map((k) => FIELD_LABELS[k]).join(", ")}
            </p>
          )}
          <div className="diagnostic-actions">
            <button type="submit" form="diagnostic-form" disabled={loading} id="find-fragrance-btn"
              onClick={handleSubmit}>
              {loading ? "Finding your air\u2026" : "Find your fragrance"}
            </button>
            {/* <Link href="/shop/fragrances">View All Fragrances</Link> */}
          </div>
          <div className="diagnostic-actions">
            {/* <button type="submit" form="diagnostic-form" disabled={loading} id="find-fragrance-btn"
              onClick={handleSubmit}>
              {loading ? "Finding your air\u2026" : "Find your fragrance"}
            </button> */}
            <Link href="/shop/fragrances">View All Fragrances</Link>
          </div>
        </div>
      </section>

      {/* Single Result Modal */}
      <AnimatePresence>
        {hasResult && results && (
          <DiagnosticModal
            key="diagnostic-modal"
            product={results}
            onClose={() => setResults(null)}
            onReset={handleReset}
          />
        )}
        {error && (
          <motion.div
            key="diagnostic-error"
            className="diagnostic-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            onClick={(e) => { if (e.target === e.currentTarget) setError(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: "var(--rimara-ivory)",
                padding: "48px",
                maxWidth: 480,
                width: "100%",
              }}
            >
              <p className="eyebrow">Something went wrong</p>
              <p style={{ margin: "16px 0 28px" }}>{error}</p>
              <button
                className="button-primary"
                onClick={() => { setError(null); setSubmitted(false); }}
              >
                Try again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={resultsRef} aria-hidden="true" />
    </>
  );
}

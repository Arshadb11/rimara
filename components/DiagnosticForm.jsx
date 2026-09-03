"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { HairlineDraw, LineReveal, Reveal, ease } from "@/components/Reveal";

const noteGroups = [
  {
    id: "top-note",
    label: "Top note",
    helper: "The first air around the fragrance.",
    options: ["Bergamot", "Pink pepper", "Green leaves", "Fresh air", "Soft citrus"],
  },
  {
    id: "middle-note",
    label: "Middle note",
    helper: "The heart that stays close to skin.",
    options: ["Lily", "Amber", "Moss", "Fougere", "Dry woods"],
  },
  {
    id: "low-note",
    label: "Low note",
    helper: "The final trace left in the room.",
    options: ["Oud", "Patchouli", "Ambered woods", "Musk", "Warm resin"],
  },
];

/* ── Scoring engine ──────────────────────────────────────────────────────── */
/**
 * Scores a product against the user's selections.
 * Design principles:
 *  1. Hour must be an EXACT phrase match — no loose fallbacks that hit every product.
 *  2. Notes use PRODUCT-SPECIFIC keywords, not generic adjectives.
 *  3. Minimum threshold of 8 is required to appear — loose one-word hits are not enough.
 *  4. Results are capped at 3 — this is a recommendation, not a catalogue.
 *
 * Known products and their distinguishing text in the real API:
 *  Air That Stays  — occasion: "deep desert night · 02:00" | classification: "Oud"
 *  Last Light      — occasion: "golden hour"               | classification: "Amber · Moss"
 *  Wild Air        — occasion: "midday heat"               | classification: "Fougere · Woody"
 *  Quiet Blossom   — occasion: "before dawn"               | classification: "Lily · Women's"
 */
function scoreProduct(product, form) {
  let score = 0;

  // Separate search targets for precision
  const occasion   = (product.occasion || "").toLowerCase();
  const classify   = (product.item_classification || "").toLowerCase();
  const prose      = (product.description || "").replace(/<[^>]+>/g, " ").toLowerCase();
  const all        = `${occasion} ${classify} ${prose}`;

  // ── Hour — EXACT phrase in the occasion field only ──────────────────────
  // Every product has a unique occasion. Only award points when it's a clear match.
  // No vague fallback keywords — that's what was causing everything to match.
  const hourPhrases = {
    "before dawn":       ["before dawn", "04:"],
    "midday heat":       ["midday heat", "midday", "13:"],
    "golden hour":       ["golden hour", "18:"],
    "deep desert night": ["deep desert night", "desert night", "02:"],
  };
  const hourKey = (form.hour || "").toLowerCase();
  if (hourKey && hourPhrases[hourKey]) {
    if (hourPhrases[hourKey].some((ph) => occasion.includes(ph))) {
      score += 8; // Strong signal — occasion is a near-unique identifier
    }
    // No else: a mismatched hour earns 0 pts (acts as a soft disqualifier)
  }

  // ── Feeling — prose adjectives that are SPECIFIC to each product ─────────
  // Avoid generic words ("soft", "deep", "open") that appear in every product.
  const feelingMap = {
    quiet:   ["quiet", "intimate", "before it is explained", "gentle"],         // Quiet Blossom
    wild:    ["wild", "movement", "alive", "forward motion", "energy"],          // Wild Air
    warm:    ["golden", "warmth", "low sun", "glow", "amber warmth"],            // Last Light
    lasting: ["stays after", "difficult to forget", "stays quietly", "oud", "trail that stays"], // Air That Stays
  };
  const feelingKey = (form.feeling || "").toLowerCase();
  if (feelingKey && feelingMap[feelingKey]) {
    const hits = feelingMap[feelingKey].filter((kw) => all.includes(kw)).length;
    score += hits * 3; // up to several points but requires real keyword hits
  }

  // ── Presence — trail character ────────────────────────────────────────────
  const presenceMap = {
    "soft and close":     ["close to skin", "stays near", "musky", "musk", "intimate"],
    "clean and moving":   ["clean", "fougere", "fougère", "movement", "forward motion"],
    "warm and intimate":  ["warm", "intimate", "amber", "vanilla"],
    "deep and memorable": ["stays after you leave", "memorable", "oud", "lasting trail"],
  };
  const presenceKey = (form.presence || "").toLowerCase();
  if (presenceKey && presenceMap[presenceKey]) {
    const hits = presenceMap[presenceKey].filter((kw) => all.includes(kw)).length;
    score += hits * 3;
  }

  // ── Top note — product-specific keywords ─────────────────────────────────
  // Only award points when the keyword is genuinely distinctive for that product
  const topNoteMap = {
    "bergamot":    ["bergamot"],               // Wild Air only
    "pink pepper": ["pepper", "pink pepper"],
    "green leaves": ["green", "leaves"],
    "fresh air":   ["fresh air", "open air"],
    "soft citrus": ["citrus", "lemon"],
  };
  const topKey = (form["top-note"] || "").toLowerCase();
  if (topKey && topNoteMap[topKey]) {
    if (topNoteMap[topKey].some((kw) => all.includes(kw))) score += 5;
  }

  // ── Middle note — heart of the fragrance ─────────────────────────────────
  const midNoteMap = {
    "lily":      ["lily", "white floral"],      // Quiet Blossom only
    "amber":     ["amber", "oakmoss"],          // Last Light
    "moss":      ["moss", "oakmoss"],            // Last Light only
    "fougere":   ["fougere", "fougère", "lavender"], // Wild Air only
    "dry woods": ["cedarwood", "cedar", "woody"],    // Wild Air
  };
  const midKey = (form["middle-note"] || "").toLowerCase();
  if (midKey && midNoteMap[midKey]) {
    if (midNoteMap[midKey].some((kw) => all.includes(kw))) score += 5;
  }

  // ── Low / base note ───────────────────────────────────────────────────────
  const baseNoteMap = {
    "oud":           ["oud"],                   // Air That Stays only
    "patchouli":     ["patchouli"],             // Air That Stays only
    "ambered woods": ["ambered woods", "dusk woods", "amber"],  // Last Light
    "musk":          ["musk"],                  // Quiet Blossom only
    "warm resin":    ["warm resin", "resin", "vanilla"],
  };
  const baseKey = (form["low-note"] || "").toLowerCase();
  if (baseKey && baseNoteMap[baseKey]) {
    if (baseNoteMap[baseKey].some((kw) => all.includes(kw))) score += 5;
  }

  // ── Texture — fragrance family ────────────────────────────────────────────
  const textureMap = {
    clean:   ["fougere", "fougère", "bergamot", "clean"],  // Wild Air
    floral:  ["lily", "white floral", "blossom"],           // Quiet Blossom
    woody:   ["fougere", "fougère", "cedarwood", "woody"],  // Wild Air
    ambered: ["amber", "oud", "patchouli", "vanilla"],      // Air That Stays / Last Light
  };
  const textureKey = (form.texture || "").toLowerCase();
  if (textureKey && textureMap[textureKey]) {
    const hits = textureMap[textureKey].filter((kw) => all.includes(kw)).length;
    score += hits * 3;
  }

  return score;
}

/* ── Product colour map ───────────────────────────────────────────────────── */
const productSettings = {
  "quiet-blossom": { color: "#d4a0a8", ctx: "Explore Quiet Blossom" },
  "wild-air": { color: "#8ab0c8", ctx: "Explore Wild Air" },
  "last-light": { color: "#e0a040", ctx: "Explore Last Light" },
  "air-that-stays": { color: "#b3a469", ctx: "Explore Air That Stays" },
  "discovery-pack": { color: "#4a4a46", ctx: "Discover the pack" },
};

function slugify(name = "") {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function enrichProduct(product) {
  const slug = slugify(product.product_name);
  const settings = productSettings[slug] || {};
  return { ...product, ...settings, slug };
}

/* ── Fragrance result card ───────────────────────────────────────────────── */
function FragranceResultCard({ product, rank }) {
  const href =
    product.slug === "discovery-pack"
      ? "/shop/discovery-pack"
      : `/shop/fragrances/${product.slug}`;

  const images = (() => {
    try {
      return JSON.parse(product.images);
    } catch {
      return [];
    }
  })();

  const baseImg = images[0]
    ? `${process.env.NEXT_PUBLIC_API_URL}storage/${images[0]}`
    : null;
  const hoverImg = images[1]
    ? `${process.env.NEXT_PUBLIC_API_URL}storage/${images[1]}`
    : baseImg;

  return (
    <motion.article
      className="fragrance-result-card"
      style={{ "--result-accent": product.color || "#b3a469" }}
      initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.76, ease, delay: rank * 0.12 }}
    >
      {rank === 0 && (
        <div className="fragrance-result-card__badge">
          <span>Best match</span>
        </div>
      )}
      <Link href={href} className="fragrance-result-card__inner">
        {baseImg && (
          <div className="fragrance-result-card__media">
            <Image
              className="fragrance-result-card__img fragrance-result-card__img--base"
              src={baseImg}
              alt={product.product_name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {hoverImg && (
              <Image
                className="fragrance-result-card__img fragrance-result-card__img--hover"
                src={hoverImg}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
        )}
        <div className="fragrance-result-card__body">
          <span className="fragrance-result-card__accent" />
          <p className="eyebrow">{product.occasion || "Rimara"}</p>
          <h3>{product.product_name}</h3>
          <p className="fragrance-result-card__notes">{product.item_classification}</p>
          <p className="fragrance-result-card__copy">
            {(product.description || "").replace(/<\/?p>/g, "")}
          </p>
          <span className="fragrance-result-card__cta">
            {product.ctx || "Explore fragrance"}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

/* ── No results state ────────────────────────────────────────────────────── */
function NoResults({ onReset }) {
  return (
    <motion.div
      className="diagnostic-no-results"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.72, ease }}
    >
      <p className="eyebrow">No matches found</p>
      <h3>Your air is still finding its match.</h3>
      <p>
        No fragrances matched your selections exactly. Try broadening your choices — or{" "}
        <Link href="/shop/fragrances">browse the full collection</Link>.
      </p>
      <button className="button-primary" onClick={onReset} style={{ marginTop: 24 }}>
        Start again
      </button>
    </motion.div>
  );
}

/* ── Field labels (for validation messages) ─────────────────────────────── */
const FIELD_LABELS = {
  hour:          "Hour",
  feeling:       "Feeling",
  presence:      "Presence",
  "top-note":    "Top note",
  "middle-note": "Middle note",
  "low-note":    "Low note",
  for:           "For",
  texture:       "Texture",
};

/* ── Main export ─────────────────────────────────────────────────────────── */
export default function DiagnosticForm() {
  const [form, setForm] = useState({
    hour: "",
    feeling: "",
    presence: "",
    "top-note": "",
    "middle-note": "",
    "low-note": "",
    for: "",
    texture: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const resultsRef = useRef(null);

  // Which fields are still empty?
  const emptyFields = Object.keys(form).filter((k) => !form[k]);
  const allFilled = emptyFields.length === 0;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (!allFilled) return; // block submission — show validation message
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin:
              process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "http://localhost:3000",
          },
          body: JSON.stringify({ limit: "20", page: "1" }),
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch fragrances.");

      const data = await response.json();
      const raw = data?.products?.data || [];

      const scored = raw
        .map((p) => ({ ...enrichProduct(p), _score: scoreProduct(p, form) }))
        .filter((p) => p._score >= 8)      // must meaningfully match — not just a stray word
        .sort((a, b) => b._score - a._score)
        .slice(0, 3);                       // diagnostic shows at most 3 recommendations

      setResults(scored);
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
    setForm({
      hour: "",
      feeling: "",
      presence: "",
      "top-note": "",
      "middle-note": "",
      "low-note": "",
      for: "",
      texture: "",
    });
    setResults(null);
    setError(null);
    setSubmitted(false);
  }

  const hasResults = results !== null;

  return (
    <>
      {/* ── Form ─────────────────────────────────────────────────────────── */}
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

        <form className="diagnostic-form" onSubmit={handleSubmit}>
          {/* Panel 01 – Mood */}
          <div className="diagnostic-form__panel diagnostic-form__panel--dark">
            <p className="eyebrow">01 / Mood</p>
            <label>
              <span>Hour</span>
              <select name="hour" value={form.hour} onChange={handleChange} required
                className={submitted && !form.hour ? "select--error" : ""}>
                <option value="" disabled>Select an hour</option>
                <option>Before dawn</option>
                <option>Midday heat</option>
                <option>Golden hour</option>
                <option>Deep desert night</option>
              </select>
            </label>
            <label>
              <span>Feeling</span>
              <select name="feeling" value={form.feeling} onChange={handleChange} required
                className={submitted && !form.feeling ? "select--error" : ""}>
                <option value="" disabled>Select a feeling</option>
                <option>Quiet</option>
                <option>Wild</option>
                <option>Warm</option>
                <option>Lasting</option>
              </select>
            </label>
            <label>
              <span>Presence</span>
              <select name="presence" value={form.presence} onChange={handleChange} required
                className={submitted && !form.presence ? "select--error" : ""}>
                <option value="" disabled>Select presence</option>
                <option>Soft and close</option>
                <option>Clean and moving</option>
                <option>Warm and intimate</option>
                <option>Deep and memorable</option>
              </select>
            </label>
          </div>

          {/* Panel 02 – Notes */}
          <div className="diagnostic-form__panel">
            <p className="eyebrow">02 / Notes</p>
            {noteGroups.map((group) => (
              <label key={group.id}>
                <span>{group.label}</span>
                <select
                  name={group.id}
                  value={form[group.id]}
                  onChange={handleChange}
                  required
                  className={submitted && !form[group.id] ? "select--error" : ""}
                >
                  <option value="" disabled>
                    Choose {group.label.toLowerCase()}
                  </option>
                  {group.options.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <small>{group.helper}</small>
              </label>
            ))}
          </div>

          {/* Panel 03 – Wear */}
          <div className="diagnostic-form__panel">
            <p className="eyebrow">03 / Wear</p>
            <label>
              <span>For</span>
              <select name="for" value={form.for} onChange={handleChange} required
                className={submitted && !form.for ? "select--error" : ""}>
                <option value="" disabled>Select wearer</option>
                <option>Self</option>
                <option>Gift</option>
                <option>Shared ritual</option>
              </select>
            </label>
            <label>
              <span>Texture</span>
              <select name="texture" value={form.texture} onChange={handleChange} required
                className={submitted && !form.texture ? "select--error" : ""}>
                <option value="" disabled>Select texture</option>
                <option>Clean</option>
                <option>Floral</option>
                <option>Woody</option>
                <option>Ambered</option>
              </select>
            </label>
            <div className="diagnostic-actions">
              {submitted && !allFilled && (
                <p className="diagnostic-validation-msg" role="alert">
                  Please complete:{" "}
                  {emptyFields.map((k) => FIELD_LABELS[k]).join(", ")}
                </p>
              )}
              <button type="submit" disabled={loading} id="find-fragrance-btn">
                {loading ? "Finding your air\u2026" : "Find your fragrance"}
              </button>
              <Link href="/shop/fragrances">View fragrances</Link>
            </div>
          </div>
        </form>
      </section>

      {/* ── Results / View Fragrance ──────────────────────────────────────── */}
      <div ref={resultsRef}>
        <AnimatePresence mode="wait">
          {hasResults && (
            <motion.section
              key="vf-results"
              className="diagnostic-results view-fragrance-results"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.68, ease }}
              aria-live="polite"
              aria-label="Fragrance results"
            >
              {/* Section header */}
              <div className="view-fragrance-header">
                <Reveal>
                  <div>
                    <p className="eyebrow">View Fragrance</p>
                    <h2>
                      <LineReveal>
                        {results.length > 0
                          ? `${results.length} fragrance${results.length !== 1 ? "s" : ""} matched your air.`
                          : "Your air is still finding its match."}
                      </LineReveal>
                    </h2>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <button
                    className="view-fragrance-reset"
                    onClick={handleReset}
                    aria-label="Reset and start the diagnostic again"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 6.5A5.5 5.5 0 1 0 2.07 3.07"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1 1.5v2.5H3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Start again
                  </button>
                </Reveal>
              </div>

              {/* Error */}
              {error && (
                <Reveal>
                  <div className="diagnostic-no-results">
                    <p className="eyebrow">Something went wrong</p>
                    <p>{error}</p>
                    <button
                      className="button-primary"
                      onClick={handleReset}
                      style={{ marginTop: 24 }}
                    >
                      Try again
                    </button>
                  </div>
                </Reveal>
              )}

              {/* No results */}
              {!error && results.length === 0 && (
                <NoResults onReset={handleReset} />
              )}

              {/* Matched cards */}
              {!error && results.length > 0 && (
                <>
                  <div className="view-fragrance-grid">
                    {results.map((product, i) => (
                      <FragranceResultCard
                        key={product.product_id ?? product.product_name}
                        product={product}
                        rank={i}
                      />
                    ))}
                  </div>

                  <Reveal delay={0.32}>
                    <div className="view-fragrance-footer">
                      <p className="body-copy">
                        Not feeling these? Browse everything we carry.
                      </p>
                      <Link className="button-secondary" href="/shop/fragrances">
                        View all fragrances
                      </Link>
                    </div>
                  </Reveal>
                </>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

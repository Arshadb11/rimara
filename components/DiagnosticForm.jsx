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
 * Real API fields per product:
 *   product_name       e.g. "Air That Stays"
 *   occasion           e.g. "Deep desert night · 02:00"
 *   item_classification e.g. "Oud · Hero Fragrance · Men's"
 *   description        long prose paragraph(s) with HTML tags
 *
 * We search all four fields as a single lowercase string and award points
 * when the user's selection keyword appears in that text.
 */
function scoreProduct(product, form) {
  let score = 0;

  // Build a single searchable string from real API fields only
  const text = [
    product.product_name   || "",
    product.occasion       || "",
    product.item_classification || "",
    // Strip HTML tags from description so we search clean prose
    (product.description   || "").replace(/<[^>]+>/g, " "),
    product.collection_name|| "",
  ]
    .join(" ")
    .toLowerCase();

  // ── 01 / Hour (matches occasion field, which contains time & place) ─────
  // occasion examples:
  //   "Before dawn · found by scent, not sight · 04:30"
  //   "Midday heat · open ground · moving · 13:00"
  //   "Golden hour · final breath · 18:42"
  //   "Deep desert night · 02:00"
  const hourMap = {
    "before dawn":      ["before dawn", "04:", "dawn"],
    "midday heat":      ["midday", "mid day", "13:", "heat", "open ground"],
    "golden hour":      ["golden hour", "golden", "18:"],
    "deep desert night":["deep desert", "desert night", "02:", "deep desert night"],
  };
  const hourKey = (form.hour || "").toLowerCase();
  if (hourKey && hourMap[hourKey]) {
    // Exact phrase match first (worth more), then keyword match
    if (text.includes(hourKey)) {
      score += 5;
    } else if (hourMap[hourKey].some((kw) => text.includes(kw))) {
      score += 3;
    }
  }

  // ── 02 / Feeling (matches description prose) ─────────────────────────────
  // Each feeling maps to adjectives/moods that appear in the description copy
  const feelingMap = {
    quiet:   ["quiet", "soft", "close", "gentle", "intimate", "still", "dawn"],
    wild:    ["wild", "open", "movement", "fresh", "alive", "energy", "moving"],
    warm:    ["warm", "golden", "amber", "warmth", "glow", "heat"],
    lasting: ["lasting", "stays", "memorable", "unforgettable", "linger", "deep", "trail"],
  };
  const feelingKey = (form.feeling || "").toLowerCase();
  if (feelingKey && feelingMap[feelingKey]) {
    const hits = feelingMap[feelingKey].filter((kw) => text.includes(kw)).length;
    score += Math.min(hits, 3) * 2; // up to +6
  }

  // ── 02 / Presence (trail style — also description prose) ─────────────────
  const presenceMap = {
    "soft and close":     ["soft", "close", "musky", "intimate", "skin", "near"],
    "clean and moving":   ["clean", "fresh", "moving", "open", "fougere", "movement"],
    "warm and intimate":  ["warm", "intimate", "amber", "vanilla", "skin", "warmth"],
    "deep and memorable": ["deep", "memorable", "oud", "lasting", "stays", "trail"],
  };
  const presenceKey = (form.presence || "").toLowerCase();
  if (presenceKey && presenceMap[presenceKey]) {
    const hits = presenceMap[presenceKey].filter((kw) => text.includes(kw)).length;
    score += Math.min(hits, 3) * 2; // up to +6
  }

  // ── 02 / Notes — matched against item_classification + description ────────
  // item_classification examples:
  //   "Oud · Hero Fragrance · Men's"
  //   "Amber · Moss · Men's"
  //   "Fougère · Woody · Men's"
  //   "Lily · Women's"
  //
  // Top note form options → keywords likely found in classification/description
  const topNoteMap = {
    "bergamot":    ["bergamot", "citrus", "fresh"],
    "pink pepper": ["pink pepper", "pepper", "spice"],
    "green leaves":["green", "leaf", "leafy"],
    "fresh air":   ["fresh", "open", "clean"],
    "soft citrus": ["citrus", "lemon", "lime", "soft citrus"],
  };
  const topKey = (form["top-note"] || "").toLowerCase();
  if (topKey && topNoteMap[topKey]) {
    if (topNoteMap[topKey].some((kw) => text.includes(kw))) score += 4;
  }

  // Middle note options → heart of the fragrance
  const midNoteMap = {
    "lily":      ["lily", "floral", "white floral", "bloom", "blossom"],
    "amber":     ["amber", "golden", "resinous", "luminous"],
    "moss":      ["moss", "oakmoss", "earthy", "mossy"],
    "fougere":   ["fougere", "fougère", "woody", "aromatic", "lavender"],
    "dry woods": ["wood", "woody", "cedar", "cedarwood", "dry"],
  };
  const midKey = (form["middle-note"] || "").toLowerCase();
  if (midKey && midNoteMap[midKey]) {
    if (midNoteMap[midKey].some((kw) => text.includes(kw))) score += 4;
  }

  // Low/base note options → the lasting trail
  const baseNoteMap = {
    "oud":          ["oud", "hero"],
    "patchouli":    ["patchouli", "earthy", "textured"],
    "ambered woods":["amber", "ambered", "warm", "resin"],
    "musk":         ["musk", "musky", "intimate", "skin"],
    "warm resin":   ["resin", "warm", "vanilla", "balsam"],
  };
  const baseKey = (form["low-note"] || "").toLowerCase();
  if (baseKey && baseNoteMap[baseKey]) {
    if (baseNoteMap[baseKey].some((kw) => text.includes(kw))) score += 4;
  }

  // ── 03 / Texture (broad fragrance family) ────────────────────────────────
  // Maps to real words in item_classification / description
  const textureMap = {
    clean:   ["clean", "fresh", "fougere", "fougère", "citrus", "bergamot"],
    floral:  ["floral", "lily", "bloom", "blossom", "white floral"],
    woody:   ["woody", "wood", "cedar", "fougere", "dry"],
    ambered: ["amber", "oud", "resin", "warm", "vanilla", "patchouli"],
  };
  const textureKey = (form.texture || "").toLowerCase();
  if (textureKey && textureMap[textureKey]) {
    const hits = textureMap[textureKey].filter((kw) => text.includes(kw)).length;
    score += Math.min(hits, 2) * 3; // up to +6
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
        .filter((p) => p._score > 0)
        .sort((a, b) => b._score - a._score);

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

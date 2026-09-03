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
function scoreProduct(product, form) {
  let score = 0;

  const text = [
    product.product_name || "",
    product.occasion || "",
    product.item_classification || "",
    product.description || "",
    product.primary_note || "",
    product.middle_note || "",
    product.base_note || "",
    product.texture || "",
    product.feeling || "",
    product.gender || "",
    product.accord || "",
    product.type || "",
  ]
    .join(" ")
    .toLowerCase();

  // Hour
  const hourMap = {
    "before dawn": ["before dawn", "dawn", "04:", "quiet", "early"],
    "midday heat": ["midday", "mid day", "daytime", "day", "13:", "heat", "open", "wild"],
    "golden hour": ["golden", "sunset", "18:", "amber", "warm"],
    "deep desert night": ["night", "desert", "deep", "02:", "dark", "oud"],
  };
  const hourKey = (form.hour || "").toLowerCase();
  if (hourKey && hourMap[hourKey]) {
    if (hourMap[hourKey].some((kw) => text.includes(kw))) score += 3;
  }

  // Feeling
  const feelingMap = {
    quiet: ["quiet", "soft", "close", "gentle", "intimate"],
    wild: ["wild", "open", "fresh", "movement", "daytime"],
    warm: ["warm", "golden", "amber", "resin", "musk"],
    lasting: ["lasting", "deep", "oud", "dark", "memorable", "patchouli"],
  };
  const feelingKey = (form.feeling || "").toLowerCase();
  if (feelingKey && feelingMap[feelingKey]) {
    if (feelingMap[feelingKey].some((kw) => text.includes(kw))) score += 2;
  }

  // Presence
  const presenceMap = {
    "soft and close": ["soft", "close", "musky", "musk", "intimate"],
    "clean and moving": ["clean", "fresh", "moving", "open", "fougere"],
    "warm and intimate": ["warm", "intimate", "amber", "vanilla"],
    "deep and memorable": ["deep", "oud", "memorable", "lasting", "dark"],
  };
  const presenceKey = (form.presence || "").toLowerCase();
  if (presenceKey && presenceMap[presenceKey]) {
    if (presenceMap[presenceKey].some((kw) => text.includes(kw))) score += 2;
  }

  // Notes
  if (form["top-note"] && text.includes((form["top-note"] || "").toLowerCase())) score += 4;
  if (form["middle-note"] && text.includes((form["middle-note"] || "").toLowerCase())) score += 4;
  if (form["low-note"] && text.includes((form["low-note"] || "").toLowerCase())) score += 4;

  // Texture
  const textureMap = {
    clean: ["clean", "fresh", "bergamot", "citrus"],
    floral: ["floral", "lily", "rose", "blossom", "bloom"],
    woody: ["woody", "wood", "cedar", "fougere"],
    ambered: ["amber", "oud", "resin", "vanilla", "patchouli"],
  };
  const textureKey = (form.texture || "").toLowerCase();
  if (textureKey && textureMap[textureKey]) {
    if (textureMap[textureKey].some((kw) => text.includes(kw))) score += 3;
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
  const resultsRef = useRef(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
              <select name="hour" value={form.hour} onChange={handleChange}>
                <option value="" disabled>Select an hour</option>
                <option>Before dawn</option>
                <option>Midday heat</option>
                <option>Golden hour</option>
                <option>Deep desert night</option>
              </select>
            </label>
            <label>
              <span>Feeling</span>
              <select name="feeling" value={form.feeling} onChange={handleChange}>
                <option value="" disabled>Select a feeling</option>
                <option>Quiet</option>
                <option>Wild</option>
                <option>Warm</option>
                <option>Lasting</option>
              </select>
            </label>
            <label>
              <span>Presence</span>
              <select name="presence" value={form.presence} onChange={handleChange}>
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
              <select name="for" value={form.for} onChange={handleChange}>
                <option value="" disabled>Select wearer</option>
                <option>Self</option>
                <option>Gift</option>
                <option>Shared ritual</option>
              </select>
            </label>
            <label>
              <span>Texture</span>
              <select name="texture" value={form.texture} onChange={handleChange}>
                <option value="" disabled>Select texture</option>
                <option>Clean</option>
                <option>Floral</option>
                <option>Woody</option>
                <option>Ambered</option>
              </select>
            </label>
            <div className="diagnostic-actions">
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

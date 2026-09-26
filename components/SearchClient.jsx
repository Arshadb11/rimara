"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Stagger, HairlineDraw } from "@/components/Reveal";
import Link from "next/link";

const productSettings = {
  "quiet-blossom": { color: "#d4a0a8", ctx: "Explore Quiet Blossom" },
  "wild-air":      { color: "#8ab0c8", ctx: "Explore Wild Air" },
  "last-light":    { color: "#e0a040", ctx: "Explore Last Light" },
  "air-that-stays":{ color: "#b3a469", ctx: "Explore Air That Stays" },
  "discovery-pack":{ color: "#4a4a46", ctx: "Discover the set" },
};

function slugify(name = "") {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

function enrichProduct(product) {
  const slug = slugify(product.product_name);
  return { ...product, ...(productSettings[slug] || {}) };
}

function matches(product, term) {
  if (!term) return true;
  const haystack = [
    product.product_name,
    product.occasion,
    product.item_classification,
    (product.description || "").replace(/<[^>]+>/g, " "),
    product.top_note,
    product.heart_note,
    product.base_note,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef(null);

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Fetch all products once on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Origin: process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "http://localhost:3000",
            },
            body: JSON.stringify({ limit: "50", page: "1" }),
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const raw = data?.products?.data || [];
        setAllProducts(raw.map(enrichProduct));
      } catch {
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    inputRef.current?.focus();
  }, []);

  // Sync query into URL param without full navigation
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [query]);

  const term = query.trim().toLowerCase();
  const results = useMemo(
    () => allProducts.filter((p) => matches(p, term)),
    [allProducts, term]
  );

  return (
    <main>
      <section className="search-hero">
        <h1>Find your fragrance.</h1>
        <label className="search-field">
          <span className="sr-only">Search fragrances</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, note or mood…"
          />
          {!loading && term && (
            <span>
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>
          )}
        </label>
      </section>

      {/* No query — show quick links */}
      {!term && (
        <section className="catalog-feature">
          {/* <div>
            <p className="eyebrow">Start here</p>
            <h2>Our collection.</h2>
          </div> */}
          <div>
            <p className="eyebrow" style={{ marginBottom: "20px" }}>QUICK LINKS</p>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                ["Quiet Blossom", "/shop/fragrances/quiet-blossom"],
                ["Wild Air", "/shop/fragrances/wild-air"],
                ["Last Light", "/shop/fragrances/last-light"],
                ["Air That Stays", "/shop/fragrances/air-that-stays"],
              ].map(([label, href]) => (
                <Link key={label} className="nav-link" href={href}>{label} →</Link>
              ))}
            </nav>
          </div>
        </section>
      )}

      {/* Active search states */}
      {term && loading && (
        <section className="empty-state">
          <p>Searching the collection…</p>
        </section>
      )}

      {term && fetchError && !loading && (
        <section className="empty-state">
          <h2>Unable to load fragrances.</h2>
          <p>Please check your connection and try again.</p>
        </section>
      )}

      {term && !loading && !fetchError && results.length === 0 && (
        <section className="empty-state">
          <h2>No fragrance found.</h2>
          <p>Try oud, floral, fresh, amber, woody or a product name.</p>
        </section>
      )}

      {term && !loading && !fetchError && results.length > 0 && (
        <Stagger className="catalog-grid hairline-frame search-results">
          <HairlineDraw />
          {results.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </Stagger>
      )}
    </main>
  );
}

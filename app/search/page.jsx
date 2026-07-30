"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products, discoveryPack } from "@/lib/products";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const allProducts = [...products, discoveryPack];
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allProducts;
    return allProducts.filter((product) => [product.name, product.mood, product.notes, product.copy].join(" ").toLowerCase().includes(term));
  }, [query]);

  return <main>
    <section className="search-hero"><p className="eyebrow">Search Rimara</p><h1>Find your fragrance.</h1><label className="search-field"><span className="sr-only">Search fragrances</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, note or mood" autoFocus /><span>{results.length} {results.length === 1 ? "result" : "results"}</span></label></section>
    {results.length ? <div className="product-grid search-results">{results.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <section className="empty-state"><h2>No fragrance found.</h2><p>Try oud, floral, fresh, amber, woody or a product name.</p></section>}
  </main>;
}

import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export const metadata = {
  title: "Search",
  description: "Search Rimara fragrances by name, note or mood.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main>
        <section className="search-hero">
          <h1>Find your fragrance.</h1>
        </section>
        <section className="empty-state">
          <p>Loading…</p>
        </section>
      </main>
    }>
      <SearchClient />
    </Suspense>
  );
}

"use client";

import { createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// CatalogContext
//
// Provides product categories, shipping charges, VAT and currency fetched once
// from /api/productCategoriesTemp (server-side in layout.jsx, 60s ISR cache).
//
// The API response shape:
// {
//   productCategories: [...],
//   shipping_service_charges: [
//     { label: "shipping", price: "20.00", free_above: "500.00" },
//     { label: "service",  price: "0.00" },
//     { label: "cod",      price: "5.00" },
//   ],
//   tax: { percentage: 5 },
//   currency: "AED",
// }
// ─────────────────────────────────────────────────────────────────────────────

const CatalogContext = createContext({
  categories:        [],
  shippingCharges:   [],   // raw shipping_service_charges array from API
  vatRate:           5,    // percentage number (e.g. 5 for 5%)
  currency:          "AED",
  freeShippingAbove: 500,  // parsed from shippingCharges[0].free_above
});

/**
 * CatalogProvider
 *
 * Accepts pre-fetched data from the server layout and makes it available to
 * all client components via useCatalog().
 */
export function CatalogProvider({ categories = [], shippingCharges = [], vatRate = 5, currency = "AED", children }) {
  // Derive the free-shipping threshold from the API response
  const freeShippingAbove = parseFloat(shippingCharges[0]?.free_above ?? 500);

  return (
    <CatalogContext.Provider value={{ categories, shippingCharges, vatRate, currency, freeShippingAbove }}>
      {children}
    </CatalogContext.Provider>
  );
}

/**
 * useCatalog — read the full catalog context from any client component.
 *
 * @returns {{
 *   categories:        Array,
 *   shippingCharges:   Array,
 *   vatRate:           number,
 *   currency:          string,
 *   freeShippingAbove: number,
 * }}
 */
export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
}
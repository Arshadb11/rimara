import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import { CartProvider } from "@/components/CartProvider";
import { CatalogProvider } from "@/components/CatalogContext";

export const metadata = {
  title: {
    default: "Rimara | Own the Air",
    template: "%s | Rimara"
  },
  description: "Fine fragrance shaped by air, time and memory.",
  icons: {
    icon: "/assets/images/homepage/favicon.svg"
  }
};

// ── Server-side fetch — runs once per request, cached for 60 s ──────────────
async function fetchCatalogData() {
  const defaults = {
    categories:      [],
    shippingCharges: [],
    vatRate:         5,
    currency:        "AED",
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}api/productCategoriesTemp`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({}),
        next:    { revalidate: 60 }, // ISR: refresh at most every 60 seconds
      }
    );

    if (!res.ok) {
      console.error("[CatalogContext] API error:", res.status);
      return defaults;
    }

    const json = await res.json();

    return {
      // Categories: API returns { productCategories: [...] }
      categories: Array.isArray(json?.productCategories)
        ? json.productCategories
        : Array.isArray(json)
          ? json
          : [],

      // Shipping: [{ label, price, free_above }, ...]
      shippingCharges: Array.isArray(json?.shipping_service_charges)
        ? json.shipping_service_charges
        : [],

      // VAT: { percentage: 5 }
      vatRate: parseFloat(json?.tax?.percentage ?? 5),

      // Currency
      currency: json?.currency ?? "AED",

      top_header: Array.isArray(json?.top_header)
        ? json.top_header
        : [],
    };
  } catch (err) {
    console.error("[CatalogContext] fetch failed:", err.message);
    return defaults;
  }
}

// ── Root layout ──────────────────────────────────────────────────────────────
export default async function RootLayout({ children }) {
  const { categories, shippingCharges, vatRate, currency, top_header } = await fetchCatalogData();

  return (
    <html lang="en">
      <body>
        <CatalogProvider
          categories={categories}
          shippingCharges={shippingCharges}
          vatRate={vatRate}
          currency={currency}
        >
          <CartProvider>
            <MotionProvider>
              <Header topHeader={top_header}/>
              {children}
              <Footer />
            </MotionProvider>
          </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
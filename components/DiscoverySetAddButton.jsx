"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

const PRICE = 160;

export default function DiscoverySetAddButton() {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem({
      id: "discovery-pack",
      name: "Discovery Set",
      image: "/assets/images/catalog/discovery-pack.png",
      size: "4 × 10 ml",
      price: PRICE,
      product_id: "discovery-pack",
      product_name: "Discovery Set",
      product_name_ar: null,
      images: JSON.stringify(["catalog/discovery-pack.png"]),
      collection_name: null,
      description: "Try the full Rimara collection on skin. Four 10 ml fragrances.",
      product_qty: 99,
      maximum_order_quantity: 0,
      permalink: { key: "discovery-pack" },
      sales: 0,
      discount: null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "16px" }}>
      <button
        className="button-primary"
        type="button"
        onClick={handleAdd}
        aria-live="polite"
        style={{ width: "fit-content" }}
      >
        {added ? "Discovery Set added" : `Add Discovery Set · AED ${PRICE}`}
      </button>
      <Link className="button-secondary" href="/shop/fragrances">
        View Fragrances
      </Link>
    </div>
  );
}

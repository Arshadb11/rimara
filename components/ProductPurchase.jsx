"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/commerce";

export default function ProductPurchase({ product }) {
  // Build price map dynamically from whatever variations the API returns
  const priceMap = Object.fromEntries(
    (product.variations || []).map((v) => [v.name, parseFloat(v.price)])
  );

  // Default to first variation (not a hardcoded size)
  const [size, setSize] = useState(() => product.variations?.[0]?.name ?? "");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function addToBag() {
    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[0]}`;
    addItem({
      // cart keys
      id: product.product_id,
      name: product.product_name,
      image: imageUrl,
      size,
      price: priceMap[size] ?? 0,
      // full backend product fields for checkout payload
      product_id: product.product_id,
      product_name: product.product_name,
      product_name_ar: product.product_name_ar || null,
      images: product.images,
      collection_name: product.collection_name || null,
      description: product.description || "",
      product_qty: product.product_qty ?? 10,
      maximum_order_quantity: product.maximum_order_quantity ?? 0,
      permalink: product.permalink || { key: product.product_id },
      sales: product.sales ?? 0,
      discount: product.discount || null,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <fieldset className="size-selector">
        <legend>Choose size</legend>
        <div className="size-selector__options">
          {product.variations.map((option) => (
            <label key={option.name} className={size === option.name ? "is-selected" : ""}>
              <input
                type="radio"
                name={`fragrance-size-${product.product_id}`}
                value={option.name}
                checked={size === option.name}
                onChange={() => { setSize(option.name); setAdded(false); }}
              />
              <span>{option.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="product-actions">
        <button className="button-primary" type="button" onClick={addToBag} aria-live="polite">
          {added ? `${product.product_name} ${size} added` : `Add ${size} · ${formatPrice(priceMap[size] ?? 0)}`}
        </button>
        <Link className="button-secondary" href="/shop/discovery-pack">Try in Discovery Pack</Link>
      </div>
    </>
  );
}
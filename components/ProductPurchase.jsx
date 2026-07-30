"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice, sizePrices } from "@/lib/commerce";

const sizes = ["10ML", "100ML"];

export default function ProductPurchase({ product }) {
  const [size, setSize] = useState("100ML");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function addToBag() {
    addItem({ id: product.id, name: product.name, image: product.image, href: product.href, size, price: sizePrices[size] });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <fieldset className="size-selector">
        <legend>Choose size</legend>
        <div className="size-selector__options">
          {sizes.map((option) => (
            <label key={option} className={size === option ? "is-selected" : ""}>
              <input
                type="radio"
                name="fragrance-size"
                value={option}
                checked={size === option}
                onChange={() => { setSize(option); setAdded(false); }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="product-actions">
        <button className="button-primary" type="button" onClick={addToBag} aria-live="polite">
          {added ? `${product.name} ${size} added` : `Add ${size} · ${formatPrice(sizePrices[size])}`}
        </button>
        <Link className="button-secondary" href="/shop/discovery-pack">Try in Discovery Pack</Link>
      </div>
    </>
  );
}

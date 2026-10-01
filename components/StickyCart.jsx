"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/commerce";

export default function StickyCart({ product, anchorId = "product-atc-btn", isDiscoverySet = false }) {
  const [visible, setVisible]   = useState(false);
  const [added,   setAdded]     = useState(false);
  const defaultVariation = (product.variations || []).find(v => v.name?.includes("100")) ?? product.variations?.[0];
  const [size,    setSize]      = useState(() => defaultVariation?.name ?? "");
  const [productId, setProductId] = useState(() => defaultVariation?.id ?? "");
  const { addItem } = useCart();

  const priceMap = Object.fromEntries(
    (product.variations || []).map((v) => [v.name, parseFloat(v.price)])
  );
  const displayPrice = isDiscoverySet
    ? parseFloat(product.price ?? 0)
    : (priceMap[size] ?? 0);

  // Watch the main ATC button; show bar when it scrolls off-screen
  useEffect(() => {
    const target = document.getElementById(anchorId);
    if (!target) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [anchorId]);

  function addToBag() {
    const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[0]}`;
    addItem({
      id:          product.product_id,
      name:        product.product_name,
      image:       imageUrl,
      size,
      price:       isDiscoverySet ? parseFloat(product.price ?? 0) : (priceMap[size] ?? 0),
      product_id:  productId,
      product_name:    product.product_name,
      product_name_ar: product.product_name_ar || null,
      images:          product.images,
      collection_name: product.collection_name || null,
      description:     product.description || "",
      product_qty:         product.product_qty ?? 10,
      maximum_order_quantity: product.maximum_order_quantity ?? 0,
      permalink:   product.permalink || { key: product.product_id },
      sales:       product.sales ?? 0,
      discount:    product.discount || null,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className={`sticky-cart${visible ? " sticky-cart--visible" : ""}`} aria-hidden={!visible}>
      <div className="sticky-cart__inner">

        {/* Product identity — thumbnail + name */}
        <div className="sticky-cart__identity">
          <div className="sticky-cart__thumb">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[0]}`}
              alt={product.product_name}
              width={40}
              height={40}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          <div className="sticky-cart__text">
            <span className="sticky-cart__name">{product.product_name}</span>
            <span className="sticky-cart__meta eyebrow">
              {product.fragrance_type || product.item_profile}
            </span>
          </div>
        </div>

        {/* Size pills — hidden for discovery set */}
        {!isDiscoverySet && (
          <div className="sticky-cart__sizes">
            {product.variations.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`sticky-cart__size-pill${size === v.name ? " is-active" : ""}`}
                onClick={() => { setSize(v.name); setProductId(v.id); setAdded(false); }}
                aria-pressed={size === v.name}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="sticky-cart__actions">
          <span className="sticky-cart__price">{formatPrice(displayPrice)}</span>
          <button
            type="button"
            className="button-primary sticky-cart__btn"
            onClick={addToBag}
            aria-live="polite"
          >
            {added ? "Added ✓" : isDiscoverySet ? "ADD DISCOVERY SET" : "Add to Bag"}
          </button>
        </div>

      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogContext";
import { formatPrice } from "@/lib/commerce";

const API_URL = "https://phpstack-1448119-6605392.cloudwaysapps.com/public/api/storeOrder";

// ── Discount helpers ──────────────────────────────────────────────────────────

function isDiscountActive(discount) {
  if (!discount) return false;
  const now = new Date();
  return new Date(discount.start_date) <= now && now <= new Date(discount.end_date);
}

function effectivePrice(basePrice, discount) {
  if (!isDiscountActive(discount)) return basePrice;
  if (discount.discount_type === "percent")
    return basePrice - (basePrice * Number(discount.value || 0)) / 100;
  if (discount.discount_type === "amount")
    return Number(discount.final_price || basePrice);
  return basePrice;
}

function discountLabel(discount) {
  if (!isDiscountActive(discount)) return null;
  if (discount.discount_type === "percent") return discount.value + "% off";
  if (discount.discount_type === "amount")  return "Save " + discount.value;
  return null;
}

// ── Build products payload ────────────────────────────────────────────────────
function buildProducts(items) {
  return items.map((item) => ({
    price:                  effectivePrice(item.price, item.discount).toFixed(2),
    product_id:             item.id,
    product_name:           item.name,
    product_name_ar:        null,
    image:                  item.image  || null,
    images:                 item.images || null,
    collection_name:        null,
    description:            item.description || null,
    product_qty:            item.stock ?? 0,
    maximum_order_quantity: 0,
    permalink:              { key: item.id },
    sales:                  0,
    discount:               item.discount || null,
    coupon:                 [],
    quantity:               item.quantity,
  }));
}

// ── Order confirmed screen ────────────────────────────────────────────────────
function OrderConfirmed({ snapshot }) {
  const { orderRef, address, items, pricing, payMethod } = snapshot;

  const methodLabel = payMethod === "cod" ? "Cash on Delivery" : "Credit / Debit Card";

  return (
    <main className="commerce-page">
      {/* ── Header ── */}
      <header className="commerce-heading" style={{ borderBottom: "1px solid var(--rimara-border)", paddingBottom: "32px", marginBottom: "48px" }}>
        <p className="eyebrow" style={{ color: "var(--rimara-ink)" }}>Order confirmed</p>
        <h1>Thank you, {address.first_name}.</h1>
        <p className="body-copy" style={{ marginTop: "8px", maxWidth: "560px" }}>
          {orderRef
            ? "Your order reference is " + orderRef + ". We\u2019ll be in touch shortly with shipping details."
            : "Your order has been placed. We\u2019ll be in touch shortly with shipping details."
          }
        </p>
      </header>

      <div className="checkout-layout">

        {/* ── Left: Items ordered ── */}
        <div style={{ display: "grid", gap: "32px" }}>

          {/* Items */}
          <section style={{ border: "1px solid var(--rimara-border)", padding: "28px" }}>
            <h2 style={{ fontSize: "clamp(18px,2vw,24px)", marginBottom: "24px" }}>Items ordered</h2>
            <div style={{ display: "grid", gap: "20px" }}>
              {items.map((item) => {
                const unitEff  = effectivePrice(item.price, item.discount);
                const isOnSale = unitEff < item.price;
                const label    = discountLabel(item.discount);
                return (
                  <div key={item.id + "-" + item.size}
                    style={{ display: "flex", gap: "16px", alignItems: "flex-start", paddingBottom: "20px", borderBottom: "1px solid var(--rimara-border)" }}>
                    {/* Image */}
                    {item.image && (
                      <img src={item.image} alt={item.name}
                        style={{ width: 72, height: 72, objectFit: "cover", background: "var(--rimara-stone)", flexShrink: 0 }} />
                    )}
                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <p style={{ font: "13px var(--font-label)", letterSpacing: ".06em", textTransform: "uppercase", margin: "0 0 4px" }}>
                        {item.name}
                      </p>
                      <p style={{ font: "13px var(--font-body)", opacity: 0.6, margin: "0 0 4px" }}>
                        {item.size} &times; {item.quantity}
                      </p>
                      {label && (
                        <p style={{ font: "11px var(--font-label)", letterSpacing: ".06em", textTransform: "uppercase", opacity: 0.6, margin: 0 }}>
                          {label}
                        </p>
                      )}
                    </div>
                    {/* Price */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {isOnSale && (
                        <s style={{ display: "block", font: "12px var(--font-body)", opacity: 0.4 }}>
                          {formatPrice(item.price * item.quantity)}
                        </s>
                      )}
                      <strong style={{ font: "14px var(--font-body)" }}>
                        {formatPrice(unitEff * item.quantity)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Delivery address */}
          <section style={{ border: "1px solid var(--rimara-border)", padding: "28px" }}>
            <h2 style={{ fontSize: "clamp(18px,2vw,24px)", marginBottom: "20px" }}>Delivery address</h2>
            <address style={{ fontStyle: "normal", display: "grid", gap: "4px", font: "14px var(--font-body)", lineHeight: 1.7, opacity: 0.8 }}>
              <span>{address.first_name} {address.last_name}</span>
              {address.address && <span>{address.address}</span>}
              {(address.city || address.pincode) && (
                <span>{[address.city, address.pincode].filter(Boolean).join(", ")}</span>
              )}
              {address.state && <span>{address.state}</span>}
              <span>United Arab Emirates</span>
              {address.mobile && <span style={{ marginTop: "8px" }}>{address.mobile}</span>}
              {address.email  && <span>{address.email}</span>}
            </address>
          </section>

          {/* Payment */}
          <section style={{ border: "1px solid var(--rimara-border)", padding: "28px" }}>
            <h2 style={{ fontSize: "clamp(18px,2vw,24px)", marginBottom: "12px" }}>Payment</h2>
            <p style={{ font: "13px var(--font-label)", letterSpacing: ".06em", textTransform: "uppercase", opacity: 0.75, margin: 0 }}>
              {methodLabel}
            </p>
          </section>

        </div>

        {/* ── Right: Order summary ── */}
        <aside className="order-summary">
          <p className="eyebrow">Order summary</p>

          {pricing.hasDiscount && (
            <div>
              <span>Original subtotal</span>
              <s style={{ opacity: 0.45 }}>{formatPrice(pricing.originalSubtotal)}</s>
            </div>
          )}
          {pricing.hasDiscount && (
            <div>
              <span style={{ font: "11px var(--font-label)", letterSpacing: ".06em", textTransform: "uppercase" }}>Discount</span>
              <strong>&minus;{formatPrice(pricing.totalDiscount)}</strong>
            </div>
          )}

          <div><span>Subtotal</span><strong>{formatPrice(pricing.totalPrice)}</strong></div>
          <div>
            <span>Shipping</span>
            <strong>{pricing.isFreeShipping ? "Complimentary" : formatPrice(pricing.shippingPrice)}</strong>
          </div>
          {pricing.serviceFeeNum > 0 && (
            <div><span>Service fee</span><strong>{formatPrice(pricing.serviceFeeNum)}</strong></div>
          )}
          {pricing.codPrice > 0 && (
            <div><span>COD fee</span><strong>{formatPrice(pricing.codPrice)}</strong></div>
          )}

          <div className="order-total"><span>Total paid</span><strong>{formatPrice(pricing.grandTotal)}</strong></div>

          <Link className="button-primary" href="/" style={{ marginTop: "8px" }}>Return home</Link>
          <Link className="button-secondary" href="/shop/fragrances" style={{ marginTop: "4px" }}>Continue shopping</Link>
        </aside>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, clearCart, ready } = useCart();

  // ── Shipping + VAT config from API ────────────────────────────────────────
  const { shippingCharges, vatRate, freeShippingAbove } = useCatalog();

  const deliveryFee   = parseFloat(shippingCharges[0]?.price  ?? 20);
  const serviceFeeNum = parseFloat(shippingCharges[1]?.price  ?? 0);
  const codFeeNum     = parseFloat(shippingCharges[2]?.price  ?? 0);

  // ── Pricing ───────────────────────────────────────────────────────────────
  const discountedSubtotal = items.reduce(
    (sum, item) => sum + effectivePrice(item.price, item.discount) * item.quantity, 0
  );
  const totalDiscount = parseFloat((subtotal - discountedSubtotal).toFixed(2));
  const hasDiscount   = totalDiscount > 0;

  const isFreeShipping   = discountedSubtotal >= freeShippingAbove;
  const shippingPrice    = isFreeShipping ? 0 : deliveryFee;
  const shippingPriceVat = parseFloat(((shippingPrice / (1 + vatRate / 100)) * (vatRate / 100)).toFixed(2));
  const servicePrice     = shippingCharges[1]?.price ?? "0.00";
  const servicePriceVat  = parseFloat(((serviceFeeNum / (1 + vatRate / 100)) * (vatRate / 100)).toFixed(2));
  const totalPrice       = parseFloat(discountedSubtotal.toFixed(2));
  const finalPrice       = parseFloat((totalPrice + shippingPrice + serviceFeeNum).toFixed(2));

  const [state,         setState]         = useState("idle");
  const [apiError,      setApiError]      = useState("");
  const [orderRef,      setOrderRef]      = useState("");
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [payMethod,     setPayMethod]     = useState("cod");

  const codPrice    = payMethod === "cod" ? codFeeNum : 0;
  const codPriceVat = parseFloat(((codPrice / (1 + vatRate / 100)) * (vatRate / 100)).toFixed(2));
  const grandTotal  = parseFloat((finalPrice + codPrice).toFixed(2));

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submitOrder(event) {
    event.preventDefault();
    if (!items.length) return;
    setState("loading");
    setApiError("");

    const fd = new FormData(event.currentTarget);
    const address = {
      first_name: fd.get("firstName"),
      last_name:  fd.get("lastName"),
      mobile:     fd.get("phone"),
      email:      fd.get("email"),
      country:    "AE",
      state:      fd.get("state"),
      address:    fd.get("address"),
      city:       fd.get("city"),
      pincode:    fd.get("postalCode"),
    };

    const payload = {
      shippingAddress: address,
      billingAddress:  address,
      shippingAdd:     false,
      products:        buildProducts(items),
      payment_method:  payMethod,
      shippingPrice,
      shippingPriceVat,
      servicePrice,
      servicePriceVat,
      vatTax:      vatRate,
      totalPrice,
      finalPrice:  grandTotal,
      customer_id: null,
      locale:      "en",
      couponCode:  "",
      couponData:  null,
      codPrice,
      codPriceVat,
      paymentId:   null,
      status:      null,
      message:     null,
    };

    try {
      const res = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Snapshot BEFORE clearing the cart so success screen can render details
        setOrderSnapshot({
          orderRef:  data?.order_id || data?.id || data?.reference || "",
          address,
          items:     [...items],
          payMethod,
          pricing: {
            originalSubtotal: subtotal,
            totalDiscount,
            hasDiscount,
            totalPrice,
            isFreeShipping,
            shippingPrice,
            serviceFeeNum,
            codPrice,
            grandTotal,
          },
        });
        clearCart();
        setOrderRef(data?.order_id || data?.id || data?.reference || "");
        setState("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const msg =
          data?.message ||
          data?.error ||
          (data?.errors ? Object.values(data.errors).flat().join(" ") : "") ||
          ("Server responded with " + res.status + ". Please try again.");
        setApiError(msg);
        setState("error");
      }
    } catch {
      setApiError("Unable to reach the server. Please check your connection and try again.");
      setState("error");
    }
  }

  // ── Screens ───────────────────────────────────────────────────────────────
  if (state === "success" && orderSnapshot) {
    return <OrderConfirmed snapshot={orderSnapshot} />;
  }

  if (ready && !items.length) {
    return (
      <main className="commerce-page">
        <section className="empty-state">
          <h1>Your bag is empty.</h1>
          <Link className="button-primary" href="/shop/fragrances">Shop fragrances</Link>
        </section>
      </main>
    );
  }

  const isLoading = state === "loading";

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <main className="commerce-page">
      <header className="commerce-heading">
        <p className="eyebrow">Secure checkout</p>
        <h1>Complete your order.</h1>
      </header>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submitOrder} noValidate>

          {/* Contact */}
          <section>
            <h2>Contact</h2>
            <label>Email<input required type="email" name="email" autoComplete="email" disabled={isLoading} /></label>
            <label>Phone<input required type="tel"   name="phone" autoComplete="tel"   disabled={isLoading} /></label>
          </section>

          {/* Delivery address */}
          <section>
            <h2>Delivery address</h2>
            <div className="form-grid">
              <label>First name<input required name="firstName" autoComplete="given-name"  disabled={isLoading} /></label>
              <label>Last name <input required name="lastName"  autoComplete="family-name" disabled={isLoading} /></label>
            </div>
            <label>Address<input required name="address" autoComplete="street-address" disabled={isLoading} /></label>
            <div className="form-grid">
              <label>City        <input required name="city"       autoComplete="address-level2" disabled={isLoading} /></label>
              <label>Postal / PIN<input required name="postalCode" autoComplete="postal-code"    disabled={isLoading} /></label>
            </div>
            <label>State / Emirate<input required name="state" autoComplete="address-level1" disabled={isLoading} /></label>
          </section>

          {/* Payment — reuses .size-selector tile pattern from globals.css */}
          <section className="payment-notice">
            <h2>Payment</h2>
            <fieldset className="size-selector" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="sr-only">Choose payment method</legend>
              <div className="size-selector__options">

                <label className={"size-selector__label" + (payMethod === "cod" ? " is-selected" : "")}
                  style={{ minWidth: 0, padding: "16px 20px", flexDirection: "column", alignItems: "flex-start", gap: 4, cursor: "pointer" }}>
                  <input type="radio" name="paymentMethod" value="cod"
                    checked={payMethod === "cod"} onChange={() => setPayMethod("cod")}
                    disabled={isLoading} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
                  <span style={{ font: "11px var(--font-label)", letterSpacing: ".08em", textTransform: "uppercase" }}>Cash on Delivery</span>
                  <span style={{ font: "10px var(--font-body)", opacity: 0.65 }}>Collected at delivery</span>
                  {codFeeNum > 0 && (
                    <span style={{ font: "11px var(--font-body)", opacity: 0.65 }}>+{formatPrice(codFeeNum)} fee</span>
                  )}
                </label>

                <label className={"size-selector__label" + (payMethod === "card" ? " is-selected" : "")}
                  style={{ minWidth: 0, padding: "16px 20px", flexDirection: "column", alignItems: "flex-start", gap: 4, cursor: "pointer" }}>
                  <input type="radio" name="paymentMethod" value="card"
                    checked={payMethod === "card"} onChange={() => setPayMethod("card")}
                    disabled={isLoading} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
                  <span style={{ font: "11px var(--font-label)", letterSpacing: ".08em", textTransform: "uppercase" }}>Credit / Debit Card</span>
                </label>

              </div>
            </fieldset>
          </section>

          {state === "error" && apiError && (
            <p className="checkout-error" role="alert">{apiError}</p>
          )}

          <button className="button-primary" type="submit" disabled={isLoading || !ready} aria-busy={isLoading}>
            {isLoading ? "Placing order\u2026" : "Place order \u00b7 " + formatPrice(grandTotal)}
          </button>
        </form>

        {/* Order summary sidebar */}
        <aside className="order-summary">
          <p className="eyebrow">Your order</p>

          {items.map((item) => {
            const unitEff  = effectivePrice(item.price, item.discount);
            const isOnSale = unitEff < item.price;
            const label    = discountLabel(item.discount);
            return (
              <div key={item.id + "-" + item.size}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <span style={{ flex: 1 }}>
                  {item.name} &middot; {item.size} &times; {item.quantity}
                  {label && (
                    <span style={{ display: "block", font: "10px var(--font-label)", letterSpacing: ".06em", textTransform: "uppercase", opacity: 0.6, marginTop: 2 }}>
                      {label}
                    </span>
                  )}
                </span>
                <span style={{ textAlign: "right", flexShrink: 0 }}>
                  {isOnSale && (
                    <s style={{ display: "block", font: "12px var(--font-body)", opacity: 0.4 }}>
                      {formatPrice(item.price * item.quantity)}
                    </s>
                  )}
                  <strong>{formatPrice(unitEff * item.quantity)}</strong>
                </span>
              </div>
            );
          })}

          <hr />

          {hasDiscount && (
            <div><span>Original subtotal</span><s style={{ opacity: 0.45 }}>{formatPrice(subtotal)}</s></div>
          )}
          {hasDiscount && (
            <div>
              <span style={{ font: "11px var(--font-label)", letterSpacing: ".06em", textTransform: "uppercase" }}>Discount</span>
              <strong>&minus;{formatPrice(totalDiscount)}</strong>
            </div>
          )}
          <div><span>Subtotal</span><strong>{formatPrice(totalPrice)}</strong></div>
          <div>
            <span>Shipping</span>
            <strong>{isFreeShipping ? "Complimentary" : formatPrice(shippingPrice)}</strong>
          </div>
          {serviceFeeNum > 0 && (
            <div><span>Service fee</span><strong>{formatPrice(serviceFeeNum)}</strong></div>
          )}
          {codPrice > 0 && (
            <div><span>COD fee</span><strong>{formatPrice(codPrice)}</strong></div>
          )}
          <div className="order-total"><span>Total</span><strong>{formatPrice(grandTotal)}</strong></div>
        </aside>
      </div>
    </main>
  );
}

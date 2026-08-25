"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogContext";
import { formatPrice } from "@/lib/commerce";

const API_URL = "https://phpstack-1448119-6605392.cloudwaysapps.com/public/api/storeOrder";

// ── Validation rules ──────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

function validate(fields) {
  const errors = {};
  if (!fields.firstName.trim())   errors.firstName  = "First name is required.";
  if (!fields.lastName.trim())    errors.lastName   = "Last name is required.";
  if (!fields.email.trim())       errors.email      = "Email address is required.";
  else if (!EMAIL_RE.test(fields.email.trim())) errors.email = "Please enter a valid email address.";
  if (!fields.phone.trim())       errors.phone      = "Phone number is required.";
  else if (!PHONE_RE.test(fields.phone.trim())) errors.phone = "Please enter a valid phone number.";
  if (!fields.address.trim())     errors.address    = "Street address is required.";
  if (!fields.city.trim())        errors.city       = "City is required.";
  if (!fields.postalCode.trim())  errors.postalCode = "Postal / PIN code is required.";
  else if (fields.postalCode.trim().length < 3) errors.postalCode = "Please enter a valid postal code.";
  if (!fields.state.trim())       errors.state      = "State / Emirate is required.";
  return errors;
}

// ── Field wrapper with inline error message ───────────────────────────────────
function Field({ label, error, children }) {
  return (
    <label>
      {label}
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </label>
  );
}

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
  const [fieldErrors,   setFieldErrors]   = useState({});
  const formRef = useRef(null);

  const codPrice    = payMethod === "cod" ? codFeeNum : 0;
  const codPriceVat = parseFloat(((codPrice / (1 + vatRate / 100)) * (vatRate / 100)).toFixed(2));
  const grandTotal  = parseFloat((finalPrice + codPrice).toFixed(2));

  // Clear error for a field as the user types
  const handleChange = useCallback((name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function submitOrder(event) {
    event.preventDefault();
    if (!items.length) return;

    const fd = new FormData(event.currentTarget);
    const fields = {
      firstName:  String(fd.get("firstName")  ?? ""),
      lastName:   String(fd.get("lastName")   ?? ""),
      email:      String(fd.get("email")      ?? ""),
      phone:      String(fd.get("phone")      ?? ""),
      address:    String(fd.get("address")    ?? ""),
      city:       String(fd.get("city")       ?? ""),
      postalCode: String(fd.get("postalCode") ?? ""),
      state:      String(fd.get("state")      ?? ""),
    };

    // Run client-side validation before touching the API
    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = formRef.current?.querySelector(`[name="${firstKey}"]`);
      if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => el.focus(), 350); }
      return;
    }

    setState("loading");
    setApiError("");

    const address = {
      first_name: fields.firstName,
      last_name:  fields.lastName,
      mobile:     fields.phone,
      email:      fields.email,
      country:    "AE",
      state:      fields.state,
      address:    fields.address,
      city:       fields.city,
      pincode:    fields.postalCode,
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
  const fe = fieldErrors;
  const inputCls = (name) => fe[name] ? "is-invalid" : "";

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <main className="commerce-page">
      <header className="commerce-heading">
        <p className="eyebrow">Secure checkout</p>
        <h1>Complete your order.</h1>
      </header>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submitOrder} noValidate ref={formRef}>

          {/* Contact */}
          <section>
            <h2>Contact</h2>
            <Field label="Email" error={fe.email}>
              <input type="email" name="email" autoComplete="email" disabled={isLoading}
                className={inputCls("email")} onChange={() => handleChange("email")} aria-invalid={!!fe.email} />
            </Field>
            <Field label="Phone" error={fe.phone}>
              <input type="tel" name="phone" autoComplete="tel" disabled={isLoading}
                className={inputCls("phone")} onChange={() => handleChange("phone")} aria-invalid={!!fe.phone} />
            </Field>
          </section>

          {/* Delivery address */}
          <section>
            <h2>Delivery address</h2>
            <div className="form-grid">
              <Field label="First name" error={fe.firstName}>
                <input name="firstName" autoComplete="given-name" disabled={isLoading}
                  className={inputCls("firstName")} onChange={() => handleChange("firstName")} aria-invalid={!!fe.firstName} />
              </Field>
              <Field label="Last name" error={fe.lastName}>
                <input name="lastName" autoComplete="family-name" disabled={isLoading}
                  className={inputCls("lastName")} onChange={() => handleChange("lastName")} aria-invalid={!!fe.lastName} />
              </Field>
            </div>
            <Field label="Address" error={fe.address}>
              <input name="address" autoComplete="street-address" disabled={isLoading}
                className={inputCls("address")} onChange={() => handleChange("address")} aria-invalid={!!fe.address} />
            </Field>
            <div className="form-grid">
              <Field label="City" error={fe.city}>
                <input name="city" autoComplete="address-level2" disabled={isLoading}
                  className={inputCls("city")} onChange={() => handleChange("city")} aria-invalid={!!fe.city} />
              </Field>
              <Field label="Postal / PIN" error={fe.postalCode}>
                <input name="postalCode" autoComplete="postal-code" disabled={isLoading}
                  className={inputCls("postalCode")} onChange={() => handleChange("postalCode")} aria-invalid={!!fe.postalCode} />
              </Field>
            </div>
            <Field label="State / Emirate" error={fe.state}>
              <input name="state" autoComplete="address-level1" disabled={isLoading}
                className={inputCls("state")} onChange={() => handleChange("state")} aria-invalid={!!fe.state} />
            </Field>
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

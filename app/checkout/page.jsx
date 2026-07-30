"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/commerce";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, ready } = useCart();
  const [complete, setComplete] = useState(false);
  const shipping = subtotal >= 5000 ? 0 : 250;

  function submitOrder(event) {
    event.preventDefault();
    setComplete(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (complete) return <main className="commerce-page"><section className="empty-state"><p className="eyebrow">Order request received</p><h1>Thank you.</h1><p>Your test order has been recorded in this browser. Connect a payment and order-management provider before accepting live customer orders.</p><Link className="button-primary" href="/">Return home</Link></section></main>;
  if (ready && !items.length) return <main className="commerce-page"><section className="empty-state"><h1>Your bag is empty.</h1><Link className="button-primary" href="/shop/fragrances">Shop fragrances</Link></section></main>;

  return <main className="commerce-page"><header className="commerce-heading"><p className="eyebrow">Secure checkout</p><h1>Complete your order.</h1></header><div className="checkout-layout">
    <form className="checkout-form" onSubmit={submitOrder}>
      <section><h2>Contact</h2><label>Email<input required type="email" name="email" autoComplete="email" /></label><label>Phone<input required type="tel" name="phone" autoComplete="tel" /></label></section>
      <section><h2>Delivery address</h2><div className="form-grid"><label>First name<input required name="firstName" autoComplete="given-name" /></label><label>Last name<input required name="lastName" autoComplete="family-name" /></label></div><label>Address<input required name="address" autoComplete="street-address" /></label><div className="form-grid"><label>City<input required name="city" autoComplete="address-level2" /></label><label>PIN code<input required name="postalCode" inputMode="numeric" pattern="[0-9]{6}" autoComplete="postal-code" /></label></div><label>State<input required name="state" autoComplete="address-level1" /></label></section>
      <section className="payment-notice"><h2>Payment</h2><p>Live online payment is not connected yet. Submitting creates a test order request only.</p></section>
      <button className="button-primary" type="submit">Place test order · {formatPrice(subtotal + shipping)}</button>
    </form>
    <aside className="order-summary"><p className="eyebrow">Your order</p>{items.map((item) => <div key={`${item.id}-${item.size}`}><span>{item.name} · {item.size} × {item.quantity}</span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}<hr /><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Shipping</span><strong>{shipping ? formatPrice(shipping) : "Complimentary"}</strong></div><div className="order-total"><span>Total</span><strong>{formatPrice(subtotal + shipping)}</strong></div></aside>
  </div></main>;
}

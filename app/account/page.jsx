"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { products } from "@/lib/products";
import { LineReveal, Reveal, Stagger, StaggerItem } from "@/components/Reveal";

const orders = [
  ["RM-1042", "Discovery Pack", "In review", "Estimated dispatch after account integration"],
  ["RM-1028", "Air That Stays", "Delivered", "Review your fragrance experience"]
];

const coupons = [
  ["WELCOME10", "10% off your first full-size fragrance", "Available"],
  ["DISCOVER15", "15% off after Discovery Pack purchase", "Demo"]
];

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem("rimaraUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && parsed.email) {
          setUser({ name: parsed.name, email: parsed.email, isDemo: false });
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    // Redirect to login if no stored user
    window.location.href = "/login";
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("rimaraUser");
  };

  if (isLoading) {
    return (
      <main style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <p style={{ font: "14px var(--font-label)", letterSpacing: ".1em", textTransform: "uppercase" }}>
          Loading account...
        </p>
      </main>
    );
  }

  return (
    <main>
      <section className="account-hero">
        <Reveal>
          <p className="eyebrow">{user.isDemo ? "Demo Dashboard" : "Customer Dashboard"}</p>
          <h1><LineReveal>Your fragrance account.</LineReveal></h1>
          <p className="body-copy">A client-review view for purchases, order tracking, coupons and saved fragrances.</p>
        </Reveal>
        <Reveal className="account-profile">
          <p className="eyebrow">{user.isDemo ? "Demo User" : "Customer Profile"}</p>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <Link className="button-secondary" href="/login" onClick={handleLogout}>Logout</Link>
        </Reveal>
      </section>

      <section className="account-dashboard">
        <Stagger className="account-summary-grid">
          {[
            ["Orders", "02", "Purchases and current order status"],
            ["Coupons", "02", "Available offers and review codes"],
            ["Saved", "04", "Fragrances kept for later"],
            ["Tracking", "01", "Shipment currently in progress"]
          ].map(([label, value, copy]) => (
            <StaggerItem key={label}>
              <article>
                <p className="eyebrow">{label}</p>
                <h2>{value}</h2>
                <p>{copy}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <div className="account-panel-grid">
          <Reveal className="account-panel">
            <p className="eyebrow">Your Purchase</p>
            <h2><LineReveal>Recent orders.</LineReveal></h2>
            <div className="account-list">
              {orders.map(([id, item, status, note]) => (
                <article key={id}>
                  <span>{id}</span>
                  <strong>{item}</strong>
                  <em>{status}</em>
                  <p>{note}</p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal className="account-panel">
            <p className="eyebrow">Order Tracking</p>
            <h2><LineReveal>RM-1042</LineReveal></h2>
            <div className="tracking-steps">
              {["Order placed", "Packed", "Dispatched", "Delivered"].map((step, index) => (
                <div className={index < 2 ? "is-active" : ""} key={step}>
                  <span />
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="account-panel">
            <p className="eyebrow">Coupons</p>
            <h2><LineReveal>Quiet offers.</LineReveal></h2>
            <div className="coupon-list">
              {coupons.map(([code, copy, status]) => (
                <article key={code}>
                  <strong>{code}</strong>
                  <p>{copy}</p>
                  <span>{status}</span>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal className="account-panel">
            <p className="eyebrow">Saved Fragrances</p>
            <h2><LineReveal>Your air, saved.</LineReveal></h2>
            <div className="saved-fragrances">
              {products.map((product) => (
                <Link href={product.href} key={product.id} style={{ "--saved-accent": product.color }}>
                  <span />
                  {product.name}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

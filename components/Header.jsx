"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

const nav = [
  ["Home", "/"],
  ["Our Story", "/story"],
  ["Brand Concept", "/concept"],
  ["What's Your Air?", "/diagnostic"],
  ["Shop", "/shop/fragrances"],
  // ["Perfumers", "/perfumers"],
  // ["Contact", "/contact"]
];

function Icon({ type }) {
  if (type === "search") return <svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.5 4.5" /></svg>;
  if (type === "account") return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>;
  if (type === "home") return <svg viewBox="0 0 24 24"><path d="M3 11L12 3l9 8v10h-6v-6H9v6H3V11Z" /></svg>;
  if (type === "shop") return <svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="15" rx="1"/><path d="M3 6l2-4h14l2 4"/><path d="M9 11h6"/></svg>;
  if (type === "diagnostic") return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
  if (type === "cart") return (
    <svg viewBox="0 0 24 24">
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M3 10h18l-1.5 10a1 1 0 0 1-1 .9H5.5a1 1 0 0 1-1-.9L3 10Z" />
    </svg>
  );
  return null;
}

export default function Header({ topHeader }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  return (
    <>
      <header className="site-header">
        <div className="announcement" aria-label="Announcement">
          <div className="announcement__container">
            <div className="announcement__track">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span className="announcement__item" key={i}>
                  {topHeader?.[0]?.title || 'Rimara is inspired by movement, change, and the quiet power of becoming.'}
                  <span className="announcement__sep" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <nav className="nav-shell" aria-label="Primary navigation">
          <button className="mobile-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? "Close" : "Menu"}</button>
          <Link className="brand-logo" href="/" aria-label="Rimara home">
            <Image src="/assets/images/rimara.svg" alt="Rimara logo" width={160} height={70} priority />
          </Link>
          <ul className="nav-left">
            {nav.map(([label, href]) => <li key={label}><Link className="nav-link" href={href}>{label}</Link></li>)}
          </ul>
          <div className="nav-right">
            <Link className="nav-action" href="/search" aria-label="Search"><Icon type="search" /></Link>
            <Link className="nav-action nav-action--account" href="/login" aria-label="Account"><Icon type="account" /></Link>
            <Link className="nav-action cart-action" href="/cart" aria-label={`Cart with ${count} items`}><Icon type="cart" />{count > 0 ? <span className="cart-count">{count}</span> : null}</Link>
          </div>
        </nav>
        <div id="mobile-navigation" className={`mobile-navigation${menuOpen ? " is-open" : ""}`}>
          {nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
        <Link className={`mobile-bottom-nav__item${pathname === "/" ? " is-active" : ""}`} href="/">
          <span className="mobile-bottom-nav__icon"><Icon type="home" /></span>
          <span className="mobile-bottom-nav__label">Home</span>
        </Link>
        <Link className={`mobile-bottom-nav__item${pathname?.startsWith("/shop") ? " is-active" : ""}`} href="/shop/fragrances">
          <span className="mobile-bottom-nav__icon"><Icon type="shop" /></span>
          <span className="mobile-bottom-nav__label">Shop</span>
        </Link>
        <Link className={`mobile-bottom-nav__item${pathname === "/diagnostic" ? " is-active" : ""}`} href="/diagnostic">
          <span className="mobile-bottom-nav__icon"><Icon type="diagnostic" /></span>
          <span className="mobile-bottom-nav__label">Discover</span>
        </Link>
        <Link className={`mobile-bottom-nav__item${pathname === "/login" || pathname === "/account" ? " is-active" : ""}`} href="/login">
          <span className="mobile-bottom-nav__icon"><Icon type="account" /></span>
          <span className="mobile-bottom-nav__label">Profile</span>
        </Link>
        <Link className={`mobile-bottom-nav__item cart-action${pathname === "/cart" ? " is-active" : ""}`} href="/cart" aria-label={`Cart, ${count} items`}>
          <span className="mobile-bottom-nav__icon">
            <Icon type="cart" />
            {count > 0 ? <span className="cart-count">{count}</span> : null}
          </span>
          <span className="mobile-bottom-nav__label">Cart</span>
        </Link>
      </nav>
    </>
  );
}

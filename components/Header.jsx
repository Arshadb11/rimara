"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

const nav = [
  ["Home", "/"],
  ["Shop", "/shop/fragrances"],
  ["Concept", "/concept"],
  ["Diagnostic", "/diagnostic"],
  ["Story", "/story"],
  ["Perfumers", "/perfumers"],
  ["Contact", "/contact"]
];

function Icon({ type }) {
  if (type === "search") return <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
  if (type === "account") return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.6-4 4.2-6 8-6s6.4 2 8 6" /></svg>;
  return <svg viewBox="0 0 24 24"><path d="M6 8h12l-1 13H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="announcement">Rimara Fine Fragrance - Own the Air</div>
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
          <Link className="nav-action" href="/contact" aria-label="Account"><Icon type="account" /></Link>
          <Link className="nav-action cart-action" href="/cart" aria-label={`Cart with ${count} items`}><Icon type="cart" />{count > 0 ? <span className="cart-count">{count}</span> : null}</Link>
        </div>
      </nav>
      <div id="mobile-navigation" className={`mobile-navigation${menuOpen ? " is-open" : ""}`}>
        {nav.map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/commerce";

export default function CartPage() {
  const { items, ready, subtotal, updateQuantity, removeItem } = useCart();

  return <main className="commerce-page">
    <header className="commerce-heading"><p className="eyebrow">Your selection</p><h1>Shopping Bag</h1></header>
    {!ready ? <p>Loading your bag…</p> : items.length === 0 ? <section className="empty-state"><h2>Your bag is waiting.</h2><p>Explore the collection and choose the air that stays with you.</p><Link className="button-primary" href="/shop/fragrances">Shop fragrances</Link></section> :
      <div className="cart-layout">
        <section className="cart-items" aria-label="Shopping bag items">
          {items.map((item) => <article className="cart-item" key={`${item.id}-${item.size}`}>
            <Link className="cart-item__image" href={item.href}><Image src={item.image} alt={item.name} width={180} height={225} /></Link>
            <div className="cart-item__details"><p className="eyebrow">Eau de Parfum · {item.size}</p><h2>{item.name}</h2><p>{formatPrice(item.price)}</p>
              <div className="quantity-control" aria-label={`Quantity for ${item.name} ${item.size}`}>
                <button type="button" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button className="text-button" type="button" onClick={() => removeItem(item.id, item.size)}>Remove</button>
            </div>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </article>)}
        </section>
        <aside className="order-summary"><p className="eyebrow">Order summary</p><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Shipping</span><span>Calculated at checkout</span></div><p className="order-note">Taxes and shipping are confirmed before payment.</p><Link className="button-primary" href="/checkout">Continue to checkout</Link><Link className="button-secondary" href="/shop/fragrances">Continue shopping</Link></aside>
      </div>}
  </main>;
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCatalog } from "@/components/CatalogContext";

/* ─────────────────────────────────────────────────────────────────────────────
   Customer dashboard – every value comes from the backend:
     POST api/customerDetails        { customer_id }
     GET  api/customerOrders         ?customer_id&page&pageSize&status&with_products
     POST api/customerOrderDetails   { order_id }
     POST api/customerAddressDetails { customer_id }
     POST api/customerAddressUpdate  { address_id (-1 = new), ... }
     POST api/customerAddressDelete  { address_id, customer_id }
     POST api/customerUpdate         { customer_id, customer_name, ... }
   ───────────────────────────────────────────────────────────────────────────── */

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 5;

// order codes from the API already contain a leading '#'
const isActiveOrder = (o) => !["completed", "cancelled", "returned"].includes(String(o?.status?.value || o?.status || "").toLowerCase());
const EMIRATES = ["Abu Dhabi", "Al Ain", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];
const orderCode = (code) => `#${String(code ?? "").replace(/^#+/, "")}`;

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "orders", label: "Orders" },
  { key: "addresses", label: "Addresses" },
  { key: "profile", label: "Profile & Security" },
  // { key: "coupons", label: "Coupons" },
  // { key: "saved", label: "Saved Fragrances" },
];

const ORDER_FILTERS = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const TIMELINE = [
  { key: "placed", label: "Order placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Delivered" },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */

function readSession() {
  try {
    const raw = window.localStorage.getItem("rimaraUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(patch) {
  const current = readSession() || {};
  window.localStorage.setItem("rimaraUser", JSON.stringify({ ...current, ...patch }));
}

function isUnauthorized(res, json) {
  return res?.status === 401 || json?.message === "Unauthorized" || json?.error === "Unauthorized";
}

async function request(path, { method = "POST", body, query, token } = {}) {
  const qs = query ? `?${new URLSearchParams(query)}` : "";
  const res = await fetch(`${API}api/${path}${qs}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(method !== "GET" ? { body: JSON.stringify(body || {}) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const statusValue = (order) => String(order?.status?.value || order?.status || "").toLowerCase();
const statusLabel = (order) =>
  order?.status?.label || (statusValue(order) ? statusValue(order).replace(/_/g, " ") : "Pending");

function StatusBadge({ order }) {
  return <span className={`dash-badge dash-badge--${statusValue(order) || "pending"}`}>{statusLabel(order)}</span>;
}

function Timeline({ order }) {
  const value = statusValue(order);
  if (value === "cancelled" || value === "returned") {
    return <p className={`dash-note dash-note--${value}`}>This order was {value}.</p>;
  }
  const reached = value === "completed" ? 3 : value === "shipped" ? 2 : value === "processing" ? 1 : 0;
  return (
    <ol className="dash-timeline">
      {TIMELINE.map((step, i) => (
        <li key={step.key} className={i <= reached ? "is-done" : ""}>
          <span />
          <p>{step.label}</p>
        </li>
      ))}
    </ol>
  );
}

function Skeleton({ rows = 3 }) {
  return (
    <div className="dash-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => <div key={i} />)}
    </div>
  );
}

function Empty({ title, copy, href, cta }) {
  return (
    <div className="dash-empty">
      <h3>{title}</h3>
      <p>{copy}</p>
      {href && <Link className="button-secondary" href={href}>{cta}</Link>}
    </div>
  );
}

/* ── main ────────────────────────────────────────────────────────────────── */

export default function AccountDashboard() {
  const catalog = useCatalog();
  // catalog currency may be a string ("AED") or an object ({ symbol, code, decimals })
  const cur = catalog.currency;
  const currency = typeof cur === "string" ? cur : cur?.symbol || cur?.code || cur?.name || "AED";
  const decimals = cur && typeof cur === "object" && Number.isInteger(Number(cur.decimals)) ? Number(cur.decimals) : 2;
  const money = useCallback((v) => `${currency} ${Number(v || 0).toFixed(decimals)}`, [currency, decimals]);

  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("overview");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [openOrder, setOpenOrder] = useState(null);

  const logout = useCallback((expired = false) => {
    window.localStorage.removeItem("rimaraUser");
    window.location.href = expired ? "/login?expired=1" : "/login";
  }, []);

  /* session */
  useEffect(() => {
    const stored = readSession();
    if (!stored || !stored.email || !stored.id) {
      // sessions created before the customer id was stored must sign in again
      window.localStorage.removeItem("rimaraUser");
      window.location.href = "/login";
      return;
    }
    setSession(stored);
    setReady(true);
  }, []);

  const customerId = session?.id;
  const token = session?.token;

  /* profile */
  useEffect(() => {
    if (!customerId) return;
    (async () => {
      try {
        const { res, json } = await request("customerDetails", { body: { customer_id: customerId }, token });
        if (isUnauthorized(res, json)) return logout(true);
        setProfile({
          name: json.customer_name || session.name || "",
          email: json.customer_email || session.email || "",
          mobile: json.customer_mobile || session.mobile || "",
        });
      } catch {
        setProfile({ name: session.name || "", email: session.email || "", mobile: session.mobile || "" });
      } finally {
        setProfileLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  /* orders (latest 50, filtered/paginated on the client for instant switching) */
  const loadOrders = useCallback(async () => {
    if (!customerId) return;
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const { res, json } = await request("customerOrders", {
        method: "GET",
        token,
        query: {
          page: "1",
          pageSize: "50",
          orderBy: "created_at",
          orderDir: "desc",
          customer_id: String(customerId),
          with_products: "1",
        },
      });
      if (isUnauthorized(res, json)) return logout(true);
      if (!res.ok) throw new Error(json?.message || "Unable to load orders.");
      setOrders(Array.isArray(json.data) ? json.data : []);
      setOrdersTotal(Number(json.total ?? json.data?.length ?? 0));
    } catch (e) {
      setOrdersError(e.message || "Unable to load orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, [customerId, token, logout]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  /* addresses */
  const loadAddresses = useCallback(async () => {
    if (!customerId) return;
    setAddressesLoading(true);
    try {
      const { json } = await request("customerAddressDetails", { body: { customer_id: customerId }, token });
      setAddresses(Array.isArray(json.addresses) ? json.addresses : []);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [customerId, token]);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  const filteredOrders = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => statusValue(o) === filter)),
    [orders, filter]
  );
  const visibleOrders = filteredOrders.slice(0, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: ordersTotal,
    active: orders.filter(isActiveOrder).length,
    delivered: orders.filter((o) => statusValue(o) === "completed").length,
    addresses: addresses.length,
  }), [orders, ordersTotal, addresses]);

  const activeOrders = orders.filter(isActiveOrder);

  if (!ready) {
    return (
      <main className="dash-loading">
        <p>Loading account…</p>
      </main>
    );
  }

  const displayName = profile?.name || session.name || "Rimara Customer";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "R";

  return (
    <main className="dash">
      <header className="dash-hero">
        <div className="dash-avatar" aria-hidden="true">{initials}</div>
        <div className="dash-hero__text">
          <p className="eyebrow">Customer Dashboard</p>
          <h1>Welcome back, {displayName.split(" ")[0]}.</h1>
          <p className="dash-muted">{profile?.email || session.email}</p>
        </div>
        <button type="button" className="button-secondary dash-logout" onClick={() => logout()}>Logout</button>
      </header>

      <nav className="dash-tabs" aria-label="Account sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            id={`dash-tab-${t.key}`}
            className={tab === t.key ? "is-active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <section className="dash-body">
        {tab === "overview" && (
          <Overview
            stats={stats}
            loading={ordersLoading}
            orders={orders.slice(0, 3)}
            activeOrders={activeOrders}
            address={addresses[0]}
            money={money}
            onView={setOpenOrder}
            goTo={setTab}
          />
        )}

        {tab === "orders" && (
          <OrdersPanel
            loading={ordersLoading}
            error={ordersError}
            retry={loadOrders}
            orders={visibleOrders}
            hasMore={visibleOrders.length < filteredOrders.length}
            filter={filter}
            setFilter={(f) => { setFilter(f); setPage(1); }}
            more={() => setPage((p) => p + 1)}
            money={money}
            onView={setOpenOrder}
          />
        )}

        {tab === "addresses" && (
          <AddressesPanel
            loading={addressesLoading}
            addresses={addresses}
            profile={profile}
            customerId={customerId}
            token={token}
            reload={loadAddresses}
            onExpired={() => logout(true)}
          />
        )}

        {tab === "profile" && (
          <ProfilePanel
            loading={profileLoading}
            profile={profile}
            customerId={customerId}
            token={token}
            onSaved={(next) => {
              setProfile(next);
              writeSession({ name: next.name, email: next.email, mobile: next.mobile });
              setSession(readSession());
            }}
            onExpired={() => logout(true)}
          />
        )}

        {/*
        {tab === "coupons" && <CouponsPanel />}
        {tab === "saved" && <SavedFragrancesPanel />}
        */}
      </section>

      {openOrder && (
        <OrderModal
          order={openOrder}
          token={token}
          money={money}
          onClose={() => setOpenOrder(null)}
        />
      )}
    </main>
  );
}

/* ── overview ────────────────────────────────────────────────────────────── */

function Overview({ stats, loading, orders, activeOrders, address, money, onView, goTo }) {
  const cards = [
    ["Total orders", stats.total, "Placed with Rimara"],
    ["In progress", stats.active, "Processing or on the way"],
    ["Delivered", stats.delivered, "Completed orders"],
  ];
  return (
    <>
      <div className="dash-stats">
        {cards.map(([label, value, copy]) => (
          <article key={label}>
            <p className="eyebrow">{label}</p>
            <h2>{loading ? "–" : String(value).padStart(2, "0")}</h2>
            <p>{copy}</p>
          </article>
        ))}
        <article>
          <p className="eyebrow">Delivery address</p>
          <h2 className="dash-stats__text">{address ? address.state || address.city || "Saved" : "Not set"}</h2>
          <p>{address ? [address.city, address.address].filter(Boolean).join(" · ") : "Add where we should deliver"}</p>
          <button type="button" className="button-secondary dash-stats__cta" onClick={() => goTo("addresses")}>
            {address ? "Edit address" : "Add address"}
          </button>
        </article>
      </div>

      <div className="dash-grid">
        <article className="dash-card">
          <div className="dash-card__head">
            <div>
              <p className="eyebrow">Latest activity</p>
              <h2>Recent orders</h2>
            </div>
            <button type="button" className="dash-link" onClick={() => goTo("orders")}>View all</button>
          </div>
          {loading ? <Skeleton /> : orders.length === 0 ? (
            <Empty title="No orders yet" copy="Your orders will appear here once you place one." href="/shop/fragrances" cta="Explore fragrances" />
          ) : (
            <ul className="dash-rows">
              {orders.map((o) => (
                <li key={o.id}>
                  <div>
                    <strong>{orderCode(o.code)}</strong>
                    <span>{formatDate(o.created_at)}</span>
                  </div>
                  <div className="dash-rows__end">
                    <span>{money(o.amount)}</span>
                    <StatusBadge order={o} />
                  </div>
                  <button type="button" className="dash-link" onClick={() => onView(o)}>Details</button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dash-card">
          <p className="eyebrow">Order tracking</p>
          <h2>{activeOrders.length > 1 ? `${activeOrders.length} orders in progress` : activeOrders.length === 1 ? "1 order in progress" : "Nothing in transit"}</h2>
          {loading ? <Skeleton rows={2} /> : activeOrders.length ? (
            <ul className="dash-track">
              {activeOrders.map((o) => (
                <li key={o.id}>
                  <div className="dash-track__head">
                    <strong>{orderCode(o.code)}</strong>
                    <StatusBadge order={o} />
                    <button type="button" className="dash-link" onClick={() => onView(o)}>Details</button>
                  </div>
                  <Timeline order={o} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-muted">When an order is processing or shipped, its live progress shows here.</p>
          )}
        </article>
      </div>
    </>
  );
}

/* ── orders ──────────────────────────────────────────────────────────────── */

function OrdersPanel({ loading, error, retry, orders, hasMore, filter, setFilter, more, money, onView }) {
  return (
    <article className="dash-card">
      <div className="dash-card__head">
        <div>
          <p className="eyebrow">Order history</p>
          <h2>Your orders</h2>
        </div>
      </div>

      <div className="dash-filters" role="tablist" aria-label="Filter orders by status">
        {ORDER_FILTERS.map((f) => (
          <button key={f.key} type="button" className={filter === f.key ? "is-active" : ""} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Skeleton rows={4} /> : error ? (
        <div className="dash-empty">
          <p>{error}</p>
          <button type="button" className="button-secondary" onClick={retry}>Try again</button>
        </div>
      ) : orders.length === 0 ? (
        <Empty
          title={filter === "all" ? "No orders yet" : "No orders in this status"}
          copy="Orders you place will be listed here with live status."
          href="/shop/fragrances"
          cta="Shop fragrances"
        />
      ) : (
        <>
          <ul className="dash-orders">
            {orders.map((o) => (
              <li key={o.id}>
                <div className="dash-orders__top">
                  <div>
                    <strong>Order {orderCode(o.code)}</strong>
                    <span>{formatDate(o.created_at)}</span>
                  </div>
                  <StatusBadge order={o} />
                </div>
                <div className="dash-orders__items">
                  {(o.products || []).slice(0, 4).map((p, i) => (
                    <span key={i} className="dash-thumb">
                      {p.product_image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={`${API}storage/${p.product_image}`} alt={p.product_name || ""} loading="lazy" />
                        : null}
                    </span>
                  ))}
                  {(o.products || []).length > 0 && (
                    <p>
                      {(o.products || []).map((p) => p.product_name).filter(Boolean).slice(0, 2).join(", ")}
                      {(o.products || []).length > 2 ? ` +${o.products.length - 2} more` : ""}
                    </p>
                  )}
                </div>
                <div className="dash-orders__bottom">
                  <strong>{money(o.amount)}</strong>
                  <button type="button" className="button-secondary" onClick={() => onView(o)}>View details</button>
                </div>
              </li>
            ))}
          </ul>
          {hasMore && (
            <button type="button" className="button-secondary dash-more" onClick={more}>Show more orders</button>
          )}
        </>
      )}
    </article>
  );
}

function OrderModal({ order, token, money, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { json } = await request("customerOrderDetails", { body: { order_id: order.id }, token });
        if (!cancelled) setDetails(json);
      } catch {
        if (!cancelled) setDetails(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [order.id, token, onClose]);

  const items = details?.order_products || order.products || [];
  const addr = details?.order_address?.[0];
  const channel = { cod: "Cash on Delivery", paytabs: "Card (PayTabs)" }[order.payment_channel] || order.payment_channel || "—";

  return (
    <div className="dash-modal" role="dialog" aria-modal="true" aria-label={`Order ${orderCode(order.code)}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dash-modal__panel">
        <button type="button" className="dash-modal__close" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">Placed {formatDate(order.created_at)}</p>
        <h2>Order {orderCode(order.code)}</h2>
        <StatusBadge order={order} />
        <Timeline order={order} />

        {loading ? <Skeleton rows={3} /> : (
          <div className="dash-modal__cols">
            <div>
              <h3>Items</h3>
              <ul className="dash-items">
                {items.map((it, i) => (
                  <li key={i}>
                    <span className="dash-thumb">
                      {it.product_image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={`${API}storage/${it.product_image}`} alt="" loading="lazy" />
                        : null}
                    </span>
                    <div>
                      <strong>{it.product_name}</strong>
                      {it.qty ? <span>Qty {it.qty}</span> : null}
                    </div>
                    {it.gross_amount != null && <em>{money(it.gross_amount)}</em>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Summary</h3>
              <dl className="dash-summary">
                <div><dt>Subtotal</dt><dd>{money(order.sub_total)}</dd></div>
                <div><dt>Shipping</dt><dd>{money(order.shipping_cost)}</dd></div>
                {Number(order.tax_amount) > 0 && <div><dt>VAT</dt><dd>{money(order.tax_amount)}</dd></div>}
                <div className="is-total"><dt>Total</dt><dd>{money(order.amount)}</dd></div>
              </dl>
              <h3>Payment</h3>
              <p className="dash-muted">{channel}</p>
              {addr && (
                <>
                  <h3>Delivery</h3>
                  <p className="dash-muted">
                    {addr.name}<br />{addr.phone}<br />{addr.address}<br />
                    {[addr.city, addr.state].filter(Boolean).join(", ")}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── addresses ───────────────────────────────────────────────────────────── */

const emptyAddress = (profile) => ({
  id: -1,
  name: profile?.name || "",
  email: profile?.email || "",
  mobile: profile?.mobile || "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  is_default: false,
});

function AddressesPanel({ loading, addresses, profile, customerId, token, reload, onExpired }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const edit = (a) =>
    setForm({
      id: a.id,
      name: a.name || profile?.name || "",
      email: a.email || profile?.email || "",
      mobile: a.phone || a.mobile || profile?.mobile || "",
      address: a.address || "",
      city: a.city || "",
      state: a.state || "",
      zip_code: a.zip_code || "",
      is_default: Number(a.is_default) === 1,
    });

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function save(e) {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.mobile.trim()) next.mobile = "Phone is required.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.state.trim()) next.state = "State / Emirate is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const { res, json } = await request("customerAddressUpdate", {
        token,
        body: {
          address_id: form.id,
          customer_id: customerId,
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          country: "AE",
          address: form.address,
          area: form.city,
          city: form.city,
          state: form.state,
          zip_code: form.zip_code,
          is_default: form.is_default ? 1 : 0,
        },
      });
      if (isUnauthorized(res, json)) return onExpired();
      if (!res.ok) throw new Error(json?.message || "Unable to save address.");
      setForm(null);
      setMessage("Address saved.");
      reload();
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove(a) {
    if (!window.confirm("Delete this address? This cannot be undone.")) return;
    try {
      const { res, json } = await request("customerAddressDelete", { token, body: { address_id: a.id, customer_id: customerId } });
      if (isUnauthorized(res, json)) return onExpired();
      if (!res.ok) throw new Error(json?.message);
      setMessage("Address deleted.");
      reload();
    } catch (err) {
      setMessage(err.message || "Failed to delete address.");
    }
  }

  const field = (name, label, props = {}) => (
    <label key={name}>
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={change} {...props} />
      {errors[name] && <em className="dash-error">{errors[name]}</em>}
    </label>
  );

  return (
    <article className="dash-card">
      <div className="dash-card__head">
        <div>
          <p className="eyebrow">Delivery</p>
          <h2>Delivery address</h2>
        </div>
        {!form && !loading && addresses.length === 0 && <button type="button" className="button-secondary" onClick={() => { setErrors({}); setMessage(""); setForm(emptyAddress(profile)); }}>Add address</button>}
      </div>

      {message && <p className="auth-message" role="status">{message}</p>}

      {form ? (
        <form className="dash-form" onSubmit={save} noValidate>
          {field("name", "Full name", { autoComplete: "name" })}
          {field("mobile", "Phone", { type: "tel", autoComplete: "tel" })}
          {field("email", "Email", { type: "email", autoComplete: "email" })}
          {field("address", "Street address", { autoComplete: "street-address" })}
          {field("city", "City / Area", { autoComplete: "address-level2" })}
          <label>
            <span>State / Emirate</span>
            <select name="state" value={form.state} onChange={change} autoComplete="address-level1">
              <option value="">Select Emirate…</option>
              {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
              {form.state && !EMIRATES.includes(form.state) && <option value={form.state}>{form.state}</option>}
            </select>
            {errors.state && <em className="dash-error">{errors.state}</em>}
          </label>
          {field("zip_code", "Postal code", { autoComplete: "postal-code" })}
          <label className="dash-check">
            <input type="checkbox" name="is_default" checked={form.is_default} onChange={change} />
            <span>Use as default address</span>
          </label>
          {errors.form && <em className="dash-error">{errors.form}</em>}
          <div className="dash-form__actions">
            <button type="submit" className="button-primary" disabled={saving}>{saving ? "Saving…" : "Save address"}</button>
            <button type="button" className="button-secondary" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      ) : loading ? <Skeleton /> : addresses.length === 0 ? (
        <Empty title="No saved address" copy="Add your delivery address to speed up checkout." />
      ) : (
        <ul className="dash-addresses">
          {addresses.slice(0, 1).map((a) => (
            <li key={a.id}>
              <div>
                <strong>{a.name}</strong>
                {Number(a.is_default) === 1 && <span className="dash-badge dash-badge--completed">Default</span>}
              </div>
              <p>{a.address}<br />{[a.city, a.state, a.zip_code].filter(Boolean).join(", ")}<br />{a.phone}</p>
              <div className="dash-addresses__actions">
                <button type="button" className="dash-link" onClick={() => { setErrors({}); setMessage(""); edit(a); }}>Edit</button>
                <button type="button" className="dash-link dash-link--danger" onClick={() => remove(a)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* ── profile & password ──────────────────────────────────────────────────── */

function ProfilePanel({ loading, profile, customerId, token, onSaved, onExpired }) {
  const [values, setValues] = useState({ name: "", email: "", mobile: "" });
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [pMsg, setPMsg] = useState({ type: "", text: "" });
  const [sMsg, setSMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (profile) setValues({ name: profile.name, email: profile.email, mobile: profile.mobile });
  }, [profile]);

  async function update(payload, which) {
    const { res, json } = await request("customerUpdate", { token, body: { customer_id: customerId, ...payload } });
    if (isUnauthorized(res, json)) {
      onExpired();
      return { ok: false, text: "Your session has expired." };
    }
    if (json.message === "Customer Updated Successfully") return { ok: true };
    const dup = json.error?.customer_email || json.customer_email
      ? "That email is already in use."
      : json.error?.customer_mobile || json.customer_mobile
        ? "That mobile number is already in use."
        : json.message || "Unable to update. Please check your details.";
    return { ok: false, text: dup };
  }

  async function saveProfile(e) {
    e.preventDefault();
    if (!values.name.trim()) return setPMsg({ type: "error", text: "Name is required." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return setPMsg({ type: "error", text: "Enter a valid email." });
    setBusy("profile");
    setPMsg({ type: "", text: "" });
    try {
      const r = await update({
        customer_name: values.name.trim(),
        customer_email: values.email.trim(),
        customer_mobile: values.mobile.trim(),
      });
      if (r.ok) {
        onSaved({ name: values.name.trim(), email: values.email.trim(), mobile: values.mobile.trim() });
        setPMsg({ type: "ok", text: "Profile updated." });
      } else setPMsg({ type: "error", text: r.text });
    } catch {
      setPMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pwd.next.length < 6) return setSMsg({ type: "error", text: "New password must be at least 6 characters." });
    if (pwd.next !== pwd.confirm) return setSMsg({ type: "error", text: "Passwords do not match." });
    setBusy("password");
    setSMsg({ type: "", text: "" });
    try {
      const r = await update({
        customer_name: profile.name,
        customer_email: profile.email,
        customer_mobile: profile.mobile,
        customer_password: pwd.next,
      });
      if (r.ok) {
        setPwd({ next: "", confirm: "" });
        setSMsg({ type: "ok", text: "Password changed." });
      } else setSMsg({ type: "error", text: r.text });
    } catch {
      setSMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setBusy("");
    }
  }

  const msg = (m) => m.text && <p className={`dash-msg dash-msg--${m.type}`} role="status">{m.text}</p>;

  if (loading) return <article className="dash-card"><Skeleton rows={4} /></article>;

  return (
    <div className="dash-grid">
      <form className="dash-card dash-form" onSubmit={saveProfile} noValidate>
        <p className="eyebrow">Personal details</p>
        <h2>Profile</h2>
        <label>
          <span>Full name</span>
          <input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} autoComplete="name" />
        </label>
        <label>
          <span>Email address</span>
          <input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} autoComplete="email" />
        </label>
        <label>
          <span>Mobile</span>
          <input type="tel" value={values.mobile} onChange={(e) => setValues({ ...values, mobile: e.target.value })} autoComplete="tel" />
        </label>
        {msg(pMsg)}
        <div className="dash-form__actions">
          <button type="submit" className="button-primary" disabled={busy === "profile"}>{busy === "profile" ? "Saving…" : "Save changes"}</button>
        </div>
      </form>

      <form className="dash-card dash-form" onSubmit={savePassword} noValidate>
        <p className="eyebrow">Security</p>
        <h2>Change password</h2>
        <label>
          <span>New password</span>
          <input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} autoComplete="new-password" />
        </label>
        <label>
          <span>Confirm new password</span>
          <input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} autoComplete="new-password" />
        </label>
        {msg(sMsg)}
        <div className="dash-form__actions">
          <button type="submit" className="button-primary" disabled={busy === "password"}>{busy === "password" ? "Updating…" : "Update password"}</button>
        </div>
      </form>
    </div>
  );
}

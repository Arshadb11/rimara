"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { useCatalog } from "@/components/CatalogContext";
import { formatPrice } from "@/lib/commerce";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}api/storeOrder`;

const ORDER_DETAILS_API =
  "https://phpstack-1664344-6634175.cloudwaysapps.com/public/api/orderDetails";

// Pulls the order reference out of the storeOrder response, whatever key the backend uses.
function extractOrderRef(data) {
  const src = [data, data?.data, data?.order];
  const keys = ["order_id", "order_number", "order_code", "code", "reference", "id"];
  for (const obj of src) {
    if (!obj || typeof obj !== "object") continue;
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return String(obj[k]);
    }
  }
  if (typeof window !== "undefined") console.warn("storeOrder response had no order reference:", data);
  return "";
}

// ── Validation rules ──────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;

function validate(fields) {
  const errors = {};

  if (!fields.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!fields.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!PHONE_RE.test(fields.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!fields.address.trim()) {
    errors.address = "Street address is required.";
  }

  if (!fields.city.trim()) {
    errors.city = "City is required.";
  }

  if (!fields.postalCode.trim()) {
    errors.postalCode = "Postal / PIN code is required.";
  } else if (fields.postalCode.trim().length < 3) {
    errors.postalCode = "Please enter a valid postal code.";
  }

  if (!fields.state.trim()) {
    errors.state = "State / Emirate is required.";
  }

  return errors;
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }) {
  return (
    <label>
      {label}

      {children}

      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

// ── Discount helpers ──────────────────────────────────────────────────────────

function isDiscountActive(discount) {
  if (!discount) return false;

  // API order details may contain a discount without dates.
  // In that case we don't try to apply the discount again.
  if (!discount.start_date || !discount.end_date) {
    return false;
  }

  const now = new Date();

  return (
    new Date(discount.start_date) <= now &&
    now <= new Date(discount.end_date)
  );
}

function effectivePrice(basePrice, discount) {
  if (!isDiscountActive(discount)) {
    return Number(basePrice || 0);
  }

  if (discount.discount_type === "percent") {
    return (
      Number(basePrice || 0) -
      (Number(basePrice || 0) * Number(discount.value || 0)) / 100
    );
  }

  if (discount.discount_type === "amount") {
    return Number(discount.final_price || basePrice || 0);
  }

  return Number(basePrice || 0);
}

function discountLabel(discount) {
  if (!isDiscountActive(discount)) {
    return null;
  }

  if (discount.discount_type === "percent") {
    return discount.value + "% off";
  }

  if (discount.discount_type === "amount") {
    return "Save " + discount.value;
  }

  return null;
}

// ── Build products payload ────────────────────────────────────────────────────

function buildProducts(items) {
  return items.map((item) => ({
    price: effectivePrice(item.price, item.discount),
    product_id: item.product_id,
    product_name: item.name,
    product_name_ar: null,
    image: item.image || null,
    images: item.images || null,
    collection_name: null,
    description: item.description || null,
    product_qty: item.stock ?? 0,
    maximum_order_quantity: 0,
    permalink: {
      key: item.id,
    },
    sales: 0,
    discount: item.discount || null,
    coupon: [],
    quantity: item.quantity,
  }));
}

// ── Order confirmed screen ────────────────────────────────────────────────────

function OrderConfirmed({ snapshot }) {
  const {
    orderRef,
    address,
    items,
    pricing,
    payMethod,
    paymentStatus,
    isUrlOrder,
  } = snapshot;

  // ─────────────────────────────────────────────────────────────────────────
  // Failed payment — ONLY for /checkout?q=...
  // ─────────────────────────────────────────────────────────────────────────

  const isFailedUrlOrder =
    isUrlOrder &&
    paymentStatus === "failed";

  if (isFailedUrlOrder) {
    return (
      <main className="commerce-page">
        <section className="empty-state">
          <p
            className="eyebrow"
            style={{
              color: "var(--rimara-ink)",
            }}
          >
            Payment failed
          </p>

          <h1>
            Your order has failed.
          </h1>

          <p
            className="body-copy"
            style={{
              marginTop: "8px",
              maxWidth: "560px",
            }}
          >
            Your order has failed or you canceled the
            payment. Please try again.
          </p>

          {/* <Link
            className="button-primary"
            href="/checkout"
            style={{
              marginTop: "24px",
            }}
          >
            Try again
          </Link> */}

          <Link
            className="button-secondary"
            href="/shop/fragrances"
            style={{
              marginTop: "8px",
            }}
          >
            Continue shopping
          </Link>
        </section>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Normal successful order confirmation
  // ─────────────────────────────────────────────────────────────────────────

  const methodLabel =
    payMethod === "cod"
      ? "Cash on Delivery"
      : "Credit / Debit Card";

  return (
    <main className="commerce-page">
      {/* ── Header ── */}

      <header
        className="commerce-heading"
        style={{
          borderBottom:
            "1px solid var(--rimara-border)",
          paddingBottom: "32px",
          marginBottom: "48px",
        }}
      >
        <p
          className="eyebrow"
          style={{
            color: "var(--rimara-ink)",
          }}
        >
          Order confirmed
        </p>

        <h1>
          Thank you, {address.first_name}.
        </h1>

        <p
          className="body-copy"
          style={{
            marginTop: "8px",
            maxWidth: "560px",
          }}
        >
          {orderRef
            ? "Your order reference is " +
              orderRef +
              ". We'll be in touch shortly with shipping details."
            : "Your order has been placed. We'll be in touch shortly with shipping details."}
        </p>
      </header>

      <div className="checkout-layout">
        {/* ── Left ── */}

        <div
          style={{
            display: "grid",
            gap: "32px",
          }}
        >
          {/* Items */}

          <section
            style={{
              border:
                "1px solid var(--rimara-border)",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontSize:
                  "clamp(18px,2vw,24px)",
                marginBottom: "24px",
              }}
            >
              Items ordered
            </h2>

            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              {items.map((item) => {
                const unitEff =
                  effectivePrice(
                    item.price,
                    item.discount
                  );

                const isOnSale =
                  unitEff <
                  Number(
                    item.price || 0
                  );

                const label =
                  discountLabel(
                    item.discount
                  );

                return (
                  <div
                    key={
                      item.id +
                      "-" +
                      item.size
                    }
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems:
                        "flex-start",
                      paddingBottom:
                        "20px",
                      borderBottom:
                        "1px solid var(--rimara-border)",
                    }}
                  >
                    {/* Image */}

                    {Array.isArray(
                      item.image
                    ) &&
                    item.image.length >
                      0 ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}storage/${item.image[0]}`}
                        alt={item.name}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit:
                            "cover",
                          background:
                            "var(--rimara-stone)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <img
                        src={`${item.image}`}
                        alt={item.name}
                        style={{
                          width: 72,
                          height: 72,
                          objectFit:
                            "cover",
                          background:
                            "var(--rimara-stone)",
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* Info */}

                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <p
                        style={{
                          font: "13px var(--font-label)",
                          letterSpacing:
                            ".06em",
                          textTransform:
                            "uppercase",
                          margin:
                            "0 0 4px",
                        }}
                      >
                        {item.name}
                      </p>

                      <p
                        style={{
                          font: "13px var(--font-body)",
                          opacity: 0.6,
                          margin:
                            "0 0 4px",
                        }}
                      >
                        {item.size
                          ? `${item.size} × ${item.quantity}`
                          : `Qty × ${item.quantity}`}
                      </p>

                      {label && (
                        <p
                          style={{
                            font: "11px var(--font-label)",
                            letterSpacing:
                              ".06em",
                            textTransform:
                              "uppercase",
                            opacity: 0.6,
                            margin: 0,
                          }}
                        >
                          {label}
                        </p>
                      )}
                    </div>

                    {/* Price */}

                    <div
                      style={{
                        textAlign:
                          "right",
                        flexShrink: 0,
                      }}
                    >
                      {isOnSale && (
                        <s
                          style={{
                            display:
                              "block",
                            font: "12px var(--font-body)",
                            opacity: 0.4,
                          }}
                        >
                          {formatPrice(
                            Number(
                              item.price ||
                                0
                            ) *
                              item.quantity
                          )}
                        </s>
                      )}

                      <strong
                        style={{
                          font: "14px var(--font-body)",
                        }}
                      >
                        {formatPrice(
                          unitEff *
                            item.quantity
                        )}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Delivery address */}

          <section
            style={{
              border:
                "1px solid var(--rimara-border)",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontSize:
                  "clamp(18px,2vw,24px)",
                marginBottom: "20px",
              }}
            >
              Delivery address
            </h2>

            <address
              style={{
                fontStyle: "normal",
                display: "grid",
                gap: "4px",
                font: "14px var(--font-body)",
                lineHeight: 1.7,
                opacity: 0.8,
              }}
            >
              <span>
                {address.first_name}{" "}
                {address.last_name}
              </span>

              {address.address && (
                <span>
                  {address.address}
                </span>
              )}

              {(address.city ||
                address.pincode) && (
                <span>
                  {[
                    address.city,
                    address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}

              {address.state && (
                <span>
                  {address.state}
                </span>
              )}

              <span>
                United Arab Emirates
              </span>

              {address.mobile && (
                <span
                  style={{
                    marginTop: "8px",
                  }}
                >
                  {address.mobile}
                </span>
              )}

              {address.email && (
                <span>
                  {address.email}
                </span>
              )}
            </address>
          </section>

          {/* Payment */}

          <section
            style={{
              border:
                "1px solid var(--rimara-border)",
              padding: "28px",
            }}
          >
            <h2
              style={{
                fontSize:
                  "clamp(18px,2vw,24px)",
                marginBottom: "12px",
              }}
            >
              Payment
            </h2>

            <p
              style={{
                font: "13px var(--font-label)",
                letterSpacing:
                  ".06em",
                textTransform:
                  "uppercase",
                opacity: 0.75,
                margin: 0,
              }}
            >
              {methodLabel}
            </p>
          </section>
        </div>

        {/* ── Right: Order summary ── */}

        <aside className="order-summary">
          <p className="eyebrow">
            Order summary
          </p>

          {pricing.hasDiscount && (
            <div>
              <span>
                Original subtotal
              </span>

              <s
                style={{
                  opacity: 0.45,
                }}
              >
                {formatPrice(
                  pricing.originalSubtotal
                )}
              </s>
            </div>
          )}

          {pricing.hasDiscount && (
            <div>
              <span
                style={{
                  font: "11px var(--font-label)",
                  letterSpacing:
                    ".06em",
                  textTransform:
                    "uppercase",
                }}
              >
                Discount
              </span>

              <strong>
                −
                {formatPrice(
                  pricing.totalDiscount
                )}
              </strong>
            </div>
          )}

          <div>
            <span>
              Subtotal
            </span>

            <strong>
              {formatPrice(
                pricing.totalPrice
              )}
            </strong>
          </div>

          <div>
            <span>
              Shipping
            </span>

            <strong>
              {pricing.isFreeShipping
                ? "Complimentary"
                : formatPrice(
                    pricing.shippingPrice
                  )}
            </strong>
          </div>

          {pricing.serviceFeeNum >
            0 && (
            <div>
              <span>
                Service fee
              </span>

              <strong>
                {formatPrice(
                  pricing.serviceFeeNum
                )}
              </strong>
            </div>
          )}

          {pricing.codPrice > 0 && (
            <div>
              <span>
                COD fee
              </span>

              <strong>
                {formatPrice(
                  pricing.codPrice
                )}
              </strong>
            </div>
          )}

          <div className="order-total">
            <span>
              Total paid
            </span>

            <strong>
              {formatPrice(
                pricing.grandTotal
              )}
            </strong>
          </div>

          <Link
            className="button-primary"
            href="/"
            style={{
              marginTop: "8px",
            }}
          >
            Return home
          </Link>

          <Link
            className="button-secondary"
            href="/shop/fragrances"
            style={{
              marginTop: "4px",
            }}
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// Checkout Page
// ─────────────────────────────────────────────────────────────────────────────

function CheckoutContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  // Example:
  // /checkout?q=IzEwMDAwMDUz
  //
  // Base64 decode:
  // IzEwMDAwMDUz -> #10000053

  const orderQuery = searchParams.get("q");

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
  });

  // ── Existing user data ────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("rimaraUser");

      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      const nameParts = (user.name || "")
        .trim()
        .split(/\s+/);

      const firstName = nameParts[0] || "";
      const lastName =
        nameParts.slice(1).join(" ") || "";

      setFormValues({
        firstName,
        lastName,
        email: user.email || "",
        phone: user.mobile || "",
        address:
          user.address?.address ||
          user.address ||
          "",
        city: user.address?.city || "",
        postalCode:
          user.address?.zip_code || "",
        state: user.address?.state || "",
      });
    } catch (error) {
      console.error(
        "Unable to load user from localStorage:",
        error
      );
    }
  }, []);

  // ── Cart ──────────────────────────────────────────────────────────────────

  const {
    items,
    subtotal,
    clearCart,
    ready,
  } = useCart();

  // ── Catalog config ─────────────────────────────────────────────────────────

  const {
    shippingCharges,
    vatRate,
  } = useCatalog();

  // ── URL order states ──────────────────────────────────────────────────────

  const [urlOrderLoading, setUrlOrderLoading] =
    useState(false);

  const [urlOrderError, setUrlOrderError] =
    useState("");

  // ── Order states ──────────────────────────────────────────────────────────

  const [state, setState] = useState("idle");

  const [apiError, setApiError] =
    useState("");

  const [orderRef, setOrderRef] =
    useState("");

  const [orderSnapshot, setOrderSnapshot] =
    useState(null);

  const [payMethod, setPayMethod] =
    useState("cod");

  const [fieldErrors, setFieldErrors] =
    useState({});

  const formRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch order from ?q=
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!orderQuery) {
      return;
    }

    let cancelled = false;

    async function fetchOrderDetails() {
      setUrlOrderLoading(true);
      setUrlOrderError("");

      try {
        // Decode Base64 order number.
        //
        // Example:
        // IzEwMDAwMDUz
        //
        // becomes:
        // #10000053

        let orderNumber;

        try {
          orderNumber = window.atob(orderQuery);
        } catch (decodeError) {
          throw new Error(
            "Invalid order reference."
          );
        }

        if (!orderNumber) {
          throw new Error(
            "Invalid order reference."
          );
        }

        const res = await fetch(
          ORDER_DETAILS_API,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              order_number: orderNumber,
            }),
          }
        );

        const data = await res
          .json()
          .catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Unable to fetch order details."
          );
        }

        if (
          data?.message &&
          !data?.order_id &&
          !data?.id
        ) {
          throw new Error(
            data.message ||
              "Order details were not found."
          );
        }

        if (cancelled) {
          return;
        }

        // ── Customer name ───────────────────────────────────────────────────

        const customerName =
          data.address?.name ||
          data.customer_name ||
          "";

        const nameParts = customerName
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        const firstName =
          nameParts[0] || "";

        const lastName =
          nameParts.slice(1).join(" ") || "";

        // ── Address ─────────────────────────────────────────────────────────

        const address = {
          first_name: firstName,
          last_name: lastName,
          mobile:
            data.address?.phone || "",
          email:
            data.address?.email || "",
          country: "AE",
          state:
            data.address?.state || "",
          address:
            data.address?.address || "",
          city:
            data.address?.city || "",
          pincode:
            data.address?.zip_code || "",
        };

        // ── Products ────────────────────────────────────────────────────────

        const products = Array.isArray(
          data.products
        )
          ? data.products
          : [];

        const itemsFromApi = products.map(
          (product) => {
            const quantity = Number(
              product.qty || 1
            );

            // gross_amount is the final product
            // amount according to the API response.
            //
            // Example:
            // price:       197.14
            // gross_amount: 207.00
            //
            // We use gross_amount for the
            // customer-facing order confirmation.

            const productPrice = Number(
              product.gross_amount ??
                product.price ??
                0
            );

            return {
              id: product.id,
              product_id:
                product.product_id,

              name:
                product.product_name || "",

              size: "",

              quantity,

              price: productPrice,

              image: product.image,
              images: product.image,

              description: null,

              stock: 0,

              // Don't apply the discount again.
              // The API has already returned the
              // final order amounts.
              discount: null,
            };
          }
        );

        // ── API pricing ─────────────────────────────────────────────────────

        const total = Number(
          data.total || 0
        );

        const subTotal = Number(
          data.sub_total || 0
        );

        const shippingAmount = Number(
          data.shipping_amount || 0
        );

        const serviceAmount = Number(
          data.service_amount || 0
        );

        const codCharge = Number(
          data.cod_charge || 0
        );

        // Product amount from the API.
        const productsTotal =
          itemsFromApi.reduce(
            (sum, item) =>
              sum +
              Number(item.price || 0) *
                Number(item.quantity || 0),
            0
          );

        // Don't show a discount unless the API
        // values actually indicate one.
        const totalDiscount = Math.max(
          0,
          Number(
            (
              productsTotal - subTotal
            ).toFixed(2)
          )
        );

        const pricing = {
          originalSubtotal:
            totalDiscount > 0
              ? productsTotal
              : subTotal,

          totalDiscount,

          hasDiscount:
            totalDiscount > 0,

          totalPrice: subTotal,

          isFreeShipping:
            shippingAmount === 0,

          shippingPrice:
            shippingAmount,

          serviceFeeNum:
            serviceAmount,

          codPrice:
            codCharge,

          grandTotal:
            total,
        };

        // ── Payment method ──────────────────────────────────────────────────

        const paymentMethod =
          data.payment_method || "cod";

        // ── Snapshot ────────────────────────────────────────────────────────

        const snapshot = {
          orderRef:
            data.order_id ||
            orderNumber,

          address,

          items: itemsFromApi,

          pricing,

          payMethod: paymentMethod,

          isUrlOrder: true,

          paymentStatus:
            String(
              data.payment_status || ""
            ).toLowerCase(),
        };

        setOrderSnapshot(snapshot);

        setOrderRef(
          data.order_id ||
            orderNumber
        );

        setPayMethod(paymentMethod);

        if (
          String(
            data.payment_status || ""
          ).toLowerCase() === "completed"
        ) {
          clearCart();
        }

        setState("success");

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to fetch order details:",
          error
        );

        setUrlOrderError(
          error?.message ||
            "Unable to load order details."
        );
      } finally {
        if (!cancelled) {
          setUrlOrderLoading(false);
        }
      }
    }

    fetchOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [orderQuery]);

  // ── Shipping + VAT config ─────────────────────────────────────────────────

  const deliveryFee = parseFloat(
    shippingCharges[0]?.price ?? 20
  );

  const serviceFeeNum = parseFloat(
    shippingCharges[1]?.price ?? 0
  );

  const codFeeNum = parseFloat(
    shippingCharges[2]?.price ?? 0
  );

  const shippingThreshold = parseFloat(
    shippingCharges[3]?.price ?? 0
  );

  // ── Existing checkout pricing ─────────────────────────────────────────────

  const discountedSubtotal =
    items.reduce(
      (sum, item) =>
        sum +
        effectivePrice(
          item.price,
          item.discount
        ) *
          item.quantity,
      0
    );

  const totalDiscount = parseFloat(
    (
      subtotal -
      discountedSubtotal
    ).toFixed(2)
  );

  const hasDiscount =
    totalDiscount > 0;

  const isFreeShipping =
    discountedSubtotal >=
    shippingThreshold;

  const shippingPrice =
    isFreeShipping
      ? 0
      : deliveryFee;

  const shippingPriceVat =
    parseFloat(
      (
        (shippingPrice /
          (1 + vatRate / 100)) *
        (vatRate / 100)
      ).toFixed(2)
    );

  const servicePrice =
    shippingCharges[1]?.price ??
    "0.00";

  const servicePriceVat =
    parseFloat(
      (
        (serviceFeeNum /
          (1 + vatRate / 100)) *
        (vatRate / 100)
      ).toFixed(2)
    );

  const totalPrice =
    parseFloat(
      discountedSubtotal.toFixed(2)
    );

  const finalPrice =
    parseFloat(
      (
        totalPrice +
        shippingPrice +
        serviceFeeNum
      ).toFixed(2)
    );

  const codPrice =
    payMethod === "cod"
      ? codFeeNum
      : 0;

  const codPriceVat =
    parseFloat(
      (
        (codPrice /
          (1 + vatRate / 100)) *
        (vatRate / 100)
      ).toFixed(2)
    );

  const grandTotal =
    parseFloat(
      (
        finalPrice +
        codPrice
      ).toFixed(2)
    );

  // ── Clear field error ─────────────────────────────────────────────────────

  const handleChange = useCallback(
    (name) => {
      setFieldErrors((prev) => {
        if (!prev[name]) {
          return prev;
        }

        const next = {
          ...prev,
        };

        delete next[name];

        return next;
      });
    },
    []
  );

  // ── Field change ──────────────────────────────────────────────────────────

  const handleFieldChange = useCallback(
    (name, value) => {
      setFormValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      handleChange(name);
    },
    [handleChange]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Submit order
  // ─────────────────────────────────────────────────────────────────────────

  async function submitOrder(event) {
    event.preventDefault();

    if (!items.length) {
      return;
    }

    const fd = new FormData(
      event.currentTarget
    );

    const fields = {
      firstName: String(
        fd.get("firstName") ?? ""
      ),

      lastName: String(
        fd.get("lastName") ?? ""
      ),

      email: String(
        fd.get("email") ?? ""
      ),

      phone: String(
        fd.get("phone") ?? ""
      ),

      address: String(
        fd.get("address") ?? ""
      ),

      city: String(
        fd.get("city") ?? ""
      ),

      postalCode: String(
        fd.get("postalCode") ?? ""
      ),

      state: String(
        fd.get("state") ?? ""
      ),
    };

    // ── Validation ──────────────────────────────────────────────────────────

    const errors =
      validate(fields);

    if (
      Object.keys(errors).length > 0
    ) {
      setFieldErrors(errors);

      const firstKey =
        Object.keys(errors)[0];

      const el =
        formRef.current?.querySelector(
          `[name="${firstKey}"]`
        );

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(
          () => el.focus(),
          350
        );
      }

      return;
    }

    setState("loading");
    setApiError("");

    // ── Address ─────────────────────────────────────────────────────────────

    const address = {
      first_name:
        fields.firstName,

      last_name:
        fields.lastName,

      mobile:
        fields.phone,

      email:
        fields.email,

      country: "AE",

      state:
        fields.state,

      address:
        fields.address,

      city:
        fields.city,

      pincode:
        fields.postalCode,
    };

    // ── Payload ─────────────────────────────────────────────────────────────

    const payload = {
      shippingAddress:
        address,

      billingAddress:
        address,

      shippingAdd:
        false,

      products:
        buildProducts(items),

      payment_method:
        payMethod,

      shippingPrice,

      shippingPriceVat,

      servicePrice,

      servicePriceVat,

      vatTax:
        vatRate,

      totalPrice,

      finalPrice:
        grandTotal,

      customer_id:
        null,

      locale:
        "en",

      couponCode:
        "",

      couponData:
        null,

      codPrice,

      codPriceVat,

      paymentId:
        null,

      status:
        null,

      message:
        null,
    };

    // console.log(payload);return;

    try {
      const res = await fetch(
        API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(payload),
        }
      );

      const data =
        await res
          .json()
          .catch(() => ({}));

      if (res.ok) {
        // ── COD ─────────────────────────────────────────────────────────────

        if (payMethod === "cod") {
          setOrderSnapshot({
            orderRef:
              extractOrderRef(data),

            address,

            items: [...items],

            payMethod,

            pricing: {
              originalSubtotal:
                subtotal,

              totalDiscount,

              hasDiscount,

              totalPrice,

              isFreeShipping,

              shippingPrice,

              serviceFeeNum,

              codPrice,

              grandTotal,

              isUrlOrder: false,
            },
          });

          clearCart();

          setOrderRef(
            extractOrderRef(data)
          );

          setState("success");

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else {
          // ── Card ──────────────────────────────────────────────────────────

          setState(
            data?.message
          );

          if (data?.redirect_url) {
            router.push(
              data.redirect_url
            );
          } else {
            setApiError(
              "Payment redirect URL was not returned."
            );

            setState("error");
          }
        }
      } else {
        const msg =
          data?.message ||
          data?.error ||
          (data?.errors
            ? Object.values(
                data.errors
              )
                .flat()
                .join(" ")
            : "") ||
          "Server responded with " +
            res.status +
            ". Please try again.";

        setApiError(msg);

        setState("error");
      }
    } catch (error) {
      console.error(
        "Order submission error:",
        error
      );

      setApiError(
        "Unable to reach the server. Please check your connection and try again."
      );

      setState("error");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Screens
  // ─────────────────────────────────────────────────────────────────────────

  // URL order is loading.
  //
  // This happens before the empty-cart check so:
  //
  // /checkout?q=...
  //
  // still works even if the cart is empty.

  if (
    orderQuery &&
    urlOrderLoading
  ) {
    return (
      <main className="commerce-page">
        <section className="empty-state">
          <h1>
            Loading your order...
          </h1>

          <p className="body-copy">
            Please wait while we
            retrieve your order details.
          </p>
        </section>
      </main>
    );
  }

  // URL order failed.

  if (
    orderQuery &&
    urlOrderError
  ) {
    return (
      <main className="commerce-page">
        <section className="empty-state">
          <h1>
            Unable to load order.
          </h1>

          <p
            className="body-copy"
            style={{
              marginTop: "8px",
            }}
          >
            {urlOrderError}
          </p>

          <Link
            className="button-primary"
            href="/"
            style={{
              marginTop: "24px",
            }}
          >
            Return home
          </Link>
        </section>
      </main>
    );
  }

  // Existing successful checkout OR
  // successful ?q= order lookup.

  if (
    state === "success" &&
    orderSnapshot
  ) {
    return (
      <OrderConfirmed
        snapshot={orderSnapshot}
      />
    );
  }

  // Normal checkout with empty cart.

  if (
    ready &&
    !items.length
  ) {
    return (
      <main className="commerce-page">
        <section className="empty-state">
          <h1>
            Your bag is empty.
          </h1>

          <Link
            className="button-primary"
            href="/shop/fragrances"
          >
            Shop fragrances
          </Link>
        </section>
      </main>
    );
  }

  // ── Normal checkout form ──────────────────────────────────────────────────

  const isLoading =
    state === "loading";

  const fe = fieldErrors;

  const inputCls = (name) =>
    fe[name]
      ? "is-invalid"
      : "";

  return (
    <main className="commerce-page">
      <header className="commerce-heading">
        <p className="eyebrow">
          Secure checkout
        </p>

        <h1>
          Complete your order.
        </h1>
      </header>

      <div className="checkout-layout">
        {/* ── Checkout form ── */}

        <form
          className="checkout-form"
          onSubmit={submitOrder}
          noValidate
          ref={formRef}
        >
          {/* Contact */}

          <section>
            <h2>
              Contact
            </h2>

            <Field
              label="Email"
              error={fe.email}
            >
              <input
                type="email"
                name="email"
                autoComplete="email"
                disabled={isLoading}
                value={
                  formValues.email
                }
                className={inputCls(
                  "email"
                )}
                onChange={(e) =>
                  handleFieldChange(
                    "email",
                    e.target.value
                  )
                }
                aria-invalid={
                  !!fe.email
                }
              />
            </Field>

            <Field
              label="Phone"
              error={fe.phone}
            >
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                disabled={isLoading}
                value={
                  formValues.phone
                }
                inputMode="numeric"
                maxLength={10}
                className={inputCls(
                  "phone"
                )}
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                  handleFieldChange(
                    "phone",
                    value
                  );
                }}
                aria-invalid={
                  !!fe.phone
                }
              />
            </Field>
          </section>

          {/* Delivery address */}

          <section>
            <h2>
              Shipping address
            </h2>

            <div className="form-grid">
              <Field
                label="First name"
                error={fe.firstName}
              >
                <input
                  name="firstName"
                  autoComplete="given-name"
                  disabled={isLoading}
                  value={
                    formValues.firstName
                  }
                  className={inputCls(
                    "firstName"
                  )}
                  onChange={(e) =>
                    handleFieldChange(
                      "firstName",
                      e.target.value
                    )
                  }
                  aria-invalid={
                    !!fe.firstName
                  }
                />
              </Field>

              <Field
                label="Last name"
                error={fe.lastName}
              >
                <input
                  name="lastName"
                  autoComplete="family-name"
                  disabled={isLoading}
                  value={
                    formValues.lastName
                  }
                  className={inputCls(
                    "lastName"
                  )}
                  onChange={(e) =>
                    handleFieldChange(
                      "lastName",
                      e.target.value
                    )
                  }
                  aria-invalid={
                    !!fe.lastName
                  }
                />
              </Field>
            </div>

            <Field
              label="Address"
              error={fe.address}
            >
              <input
                name="address"
                autoComplete="street-address"
                disabled={isLoading}
                value={
                  formValues.address
                }
                className={inputCls(
                  "address"
                )}
                onChange={(e) =>
                  handleFieldChange(
                    "address",
                    e.target.value
                  )
                }
                aria-invalid={
                  !!fe.address
                }
              />
            </Field>

            <div className="form-grid">
              <Field
                label="City"
                error={fe.city}
              >
                <input
                  name="city"
                  autoComplete="address-level2"
                  disabled={isLoading}
                  value={
                    formValues.city
                  }
                  className={inputCls(
                    "city"
                  )}
                  onChange={(e) =>
                    handleFieldChange(
                      "city",
                      e.target.value
                    )
                  }
                  aria-invalid={
                    !!fe.city
                  }
                />
              </Field>

              <Field
                label="Postal / PIN"
                error={fe.postalCode}
              >
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  disabled={isLoading}
                  value={
                    formValues.postalCode
                  }
                  className={inputCls(
                    "postalCode"
                  )}
                  onChange={(e) =>
                    handleFieldChange(
                      "postalCode",
                      e.target.value
                    )
                  }
                  aria-invalid={
                    !!fe.postalCode
                  }
                />
              </Field>
            </div>

            <Field
              label="State / Emirate"
              error={fe.state}
            >
              <select
                name="state"
                autoComplete="address-level1"
                disabled={isLoading}
                value={formValues.state}
                className={inputCls("state")}
                onChange={(e) =>
                  handleFieldChange("state", e.target.value)
                }
                aria-invalid={!!fe.state}
              >
                <option value="">Select Emirate…</option>
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Al Ain">Al Ain</option>
                <option value="Dubai">Dubai</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                <option value="Fujairah">Fujairah</option>
              </select>
            </Field>
          </section>

          {/* Payment */}

          <section className="payment-notice">
            <h2>
              Payment
            </h2>

            <fieldset
              className="size-selector"
              style={{
                border: 0,
                padding: 0,
                margin: 0,
              }}
            >
              <legend className="sr-only">
                Choose payment method
              </legend>

              <div className="size-selector__options">
                {/* COD */}

                <label
                  className={
                    "size-selector__label" +
                    (payMethod ===
                    "cod"
                      ? " is-selected"
                      : "")
                  }
                  style={{
                    minWidth: 0,
                    padding:
                      "16px 20px",
                    flexDirection:
                      "column",
                    alignItems:
                      "flex-start",
                    gap: 4,
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={
                      payMethod ===
                      "cod"
                    }
                    onChange={() =>
                      setPayMethod(
                        "cod"
                      )
                    }
                    disabled={
                      isLoading
                    }
                    style={{
                      position:
                        "absolute",
                      width: 1,
                      height: 1,
                      opacity: 0,
                    }}
                  />

                  <span
                    style={{
                      font: "11px var(--font-label)",
                      letterSpacing:
                        ".08em",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Cash on Delivery
                  </span>

                  <span
                    style={{
                      font: "10px var(--font-body)",
                      opacity: 0.65,
                    }}
                  >
                    Collected at delivery
                  </span>
                </label>

                {/* Card */}

                <label
                  className={
                    "size-selector__label" +
                    (payMethod ===
                    "card"
                      ? " is-selected"
                      : "")
                  }
                  style={{
                    minWidth: 0,
                    padding:
                      "16px 20px",
                    flexDirection:
                      "column",
                    alignItems:
                      "flex-start",
                    gap: 4,
                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={
                      payMethod ===
                      "card"
                    }
                    onChange={() =>
                      setPayMethod(
                        "card"
                      )
                    }
                    disabled={
                      isLoading
                    }
                    style={{
                      position:
                        "absolute",
                      width: 1,
                      height: 1,
                      opacity: 0,
                    }}
                  />

                  <span
                    style={{
                      font: "11px var(--font-label)",
                      letterSpacing:
                        ".08em",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Credit / Debit Card
                  </span>

                  <span
                    style={{
                      font: "10px var(--font-body)",
                      opacity: 0.65,
                    }}
                  >
                    Visa / Mastercard / Apple Pay
                  </span>
                </label>
              </div>
            </fieldset>
          </section>

          {/* API error */}

          {state === "error" &&
            apiError && (
              <p
                className="checkout-error"
                role="alert"
              >
                {apiError}
              </p>
            )}

          {/* Submit */}

          <button
            className="button-primary"
            type="submit"
            disabled={
              isLoading || !ready
            }
            aria-busy={
              isLoading
            }
          >
            {isLoading
              ? "Placing order…"
              : "Place order · " +
                formatPrice(
                  grandTotal
                )}
          </button>
        </form>

        {/* ── Order summary ── */}

        <aside className="order-summary">
          <p className="eyebrow">
            Your order
          </p>

          {items.map((item) => {
            const unitEff =
              effectivePrice(
                item.price,
                item.discount
              );

            const isOnSale =
              unitEff <
              Number(
                item.price || 0
              );

            const label =
              discountLabel(
                item.discount
              );

            return (
              <div
                key={
                  item.id +
                  "-" +
                  item.size
                }
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    flex: 1,
                  }}
                >
                  {item.name} ·{" "}
                  {item.size} ×{" "}
                  {item.quantity}

                  {label && (
                    <span
                      style={{
                        display:
                          "block",
                        font: "10px var(--font-label)",
                        letterSpacing:
                          ".06em",
                        textTransform:
                          "uppercase",
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {label}
                    </span>
                  )}
                </span>

                <span
                  style={{
                    textAlign:
                      "right",
                    flexShrink: 0,
                  }}
                >
                  {isOnSale && (
                    <s
                      style={{
                        display:
                          "block",
                        font: "12px var(--font-body)",
                        opacity: 0.4,
                      }}
                    >
                      {formatPrice(
                        Number(
                          item.price ||
                            0
                        ) *
                          item.quantity
                      )}
                    </s>
                  )}

                  <strong>
                    {formatPrice(
                      unitEff *
                        item.quantity
                    )}
                  </strong>
                </span>
              </div>
            );
          })}

          <hr />

          {hasDiscount && (
            <div>
              <span>
                Original subtotal
              </span>

              <s
                style={{
                  opacity: 0.45,
                }}
              >
                {formatPrice(
                  subtotal
                )}
              </s>
            </div>
          )}

          {hasDiscount && (
            <div>
              <span
                style={{
                  font: "11px var(--font-label)",
                  letterSpacing:
                    ".06em",
                  textTransform:
                    "uppercase",
                }}
              >
                Discount
              </span>

              <strong>
                −
                {formatPrice(
                  totalDiscount
                )}
              </strong>
            </div>
          )}

          <div>
            <span>
              Subtotal
            </span>

            <strong>
              {formatPrice(
                totalPrice
              )}
            </strong>
          </div>

          <div>
            <span>
              Shipping
            </span>

            <strong>
              {isFreeShipping
                ? "Complimentary"
                : formatPrice(
                    shippingPrice
                  )}
            </strong>
          </div>

          {serviceFeeNum >
            0 && (
            <div>
              <span>
                Service fee
              </span>

              <strong>
                {formatPrice(
                  serviceFeeNum
                )}
              </strong>
            </div>
          )}

          {codPrice > 0 && (
            <div>
              <span>
                COD Fee
              </span>

              <strong>
                {formatPrice(
                  codPrice
                )}
              </strong>
            </div>
          )}

          <div className="order-total">
            <span>
              Total
            </span>

            <strong>
              {formatPrice(
                grandTotal
              )}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}

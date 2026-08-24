"use client";

import { useEffect, useState } from "react";
import { RegisterForm } from "@/components/AuthForms";
import { LineReveal, Reveal } from "@/components/Reveal";

export default function RegisterPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (window.localStorage.getItem("rimaraUser")) {
      window.location.href = "/account";
    } else {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) {
    return (
      <main style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <p style={{ font: "14px var(--font-label)", letterSpacing: ".1em", textTransform: "uppercase" }}>
          Redirecting...
        </p>
      </main>
    );
  }

  return (
    <main>
      <section className="auth-page">
        <Reveal className="auth-copy">
          <p className="eyebrow">Registration</p>
          <h1><LineReveal>Create your fragrance account.</LineReveal></h1>
          <p className="body-copy">Keep your purchases, discovery notes, coupons and order tracking in one quiet place.</p>
        </Reveal>
        <Reveal className="auth-card">
          <p className="eyebrow">New Customer</p>
          <RegisterForm />
        </Reveal>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/AuthForms";
import { LineReveal, Reveal } from "@/components/Reveal";

export default function LoginPage() {
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
          <p className="eyebrow">Account</p>
          <h1><LineReveal>Return to your air.</LineReveal></h1>
          <p className="body-copy">Sign in to view purchases, track orders, save favourites and manage fragrance notes.</p>
        </Reveal>
        <Reveal className="auth-card">
          <p className="eyebrow">User Login</p>
          <LoginForm />
        </Reveal>
      </section>
    </main>
  );
}

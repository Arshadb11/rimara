"use client";

import { useEffect, useState } from "react";
import { ForgotPasswordForm } from "@/components/AuthForms";
import { LineReveal, Reveal } from "@/components/Reveal";

export default function ForgotPasswordPage() {
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
      <section className="auth-page auth-page--compact">
        <Reveal className="auth-copy">
          <p className="eyebrow">Password Reset</p>
          <h1><LineReveal>Find your way back in.</LineReveal></h1>
          <p className="body-copy">Enter your email address and we will prepare a reset link once account email service is connected.</p>
        </Reveal>
        <Reveal className="auth-card">
          <p className="eyebrow">Forget Password</p>
          <ForgotPasswordForm />
        </Reveal>
      </section>
    </main>
  );
}

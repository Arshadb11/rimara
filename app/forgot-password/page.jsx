"use client";

import { useEffect, useState } from "react";
import { ForgotPasswordForm } from "@/components/AuthForms";
import { LineReveal, Reveal } from "@/components/Reveal";

export default function ForgotPasswordPage() {
  // Logged-in customers may also reset their password (e.g. when they forgot the current one),
  // so this page no longer redirects to /account. Their email is pre-filled for convenience.
  const [defaultEmail, setDefaultEmail] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("rimaraUser") || "null");
      if (stored?.email) setDefaultEmail(stored.email);
    } catch {}
  }, []);

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
          <ForgotPasswordForm key={defaultEmail} defaultEmail={defaultEmail} />
        </Reveal>
      </section>
    </main>
  );
}

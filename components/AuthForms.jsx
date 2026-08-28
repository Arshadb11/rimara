"use client";

import Link from "next/link";
import { useState } from "react";

// const demoEmail = "demo@rimara.com";
// const demoPassword = "Rimara@123";

// function saveDemoUser(user) {
//   window.localStorage.setItem("rimaraUser", JSON.stringify(user));
//   window.location.href = "/account";
// }

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (globalMessage) {
      setGlobalMessage("");
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const email = formData.email.trim();
    const password = formData.password;

    const newErrors = {};
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Client review demo bypass
    // if (email === demoEmail && password === demoPassword) {
    //   setGlobalMessage("Logging in as demo user...");
    //   setIsLoading(true);
    //   setTimeout(() => {
    //     saveDemoUser({ name: "Demo User", email });
    //   }, 800);
    //   return;
    // }

    setIsLoading(true);
    setGlobalMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.message === "Login Successfully") {
        setGlobalMessage("Login successful! Redirecting...");
        const userPayload = {
          name: data.data?.name || "Rimara Customer",
          email: data.data?.email || email,
          token: data.access_token
        };
        window.localStorage.setItem("rimaraUser", JSON.stringify(userPayload));
        setTimeout(() => {
          window.location.href = "/account";
        }, 1200);
      } else if (data?.message?.includes("Invalid Mobile Number") || data?.message?.includes("Invalid")) {
        setGlobalMessage("Invalid email address or password.");
        setIsLoading(false);
      } else if (data && (data.email || data.password)) {
        const apiErrors = {};
        if (data.email) apiErrors.email = Array.isArray(data.email) ? data.email.join(" ") : String(data.email);
        if (data.password) apiErrors.password = Array.isArray(data.password) ? data.password.join(" ") : String(data.password);
        setErrors(apiErrors);
        setIsLoading(false);
      } else {
        const errMsg = data?.message || "Invalid credentials or account issue.";
        setGlobalMessage(errMsg);
        setIsLoading(false);
      }
    } catch (err) {
      setGlobalMessage("Unable to connect to the server. Please check your internet connection.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        <span>Email address</span>
        <input
          type="email"
          name="email"
          placeholder="demo@rimara.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.email && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {errors.email}
          </span>
        )}
      </label>
      <label>
        <span>Password</span>
        <input
          type="password"
          name="password"
          placeholder="Rimara@123"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.password && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {errors.password}
          </span>
        )}
      </label>
      {globalMessage ? <p className="auth-message">{globalMessage}</p> : null}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
      <div className="auth-card__links">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/register">Create account</Link>
      </div>
      {/* <Link className="auth-demo-link" href="/account">View demo dashboard</Link> */}
    </form>
  );
}

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    "confirm-password": ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (globalMessage) {
      setGlobalMessage("");
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();

    // Client-side validation
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData["confirm-password"];

    const newErrors = {};
    if (!name) {
      newErrors.name = "Full name is required.";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
      newErrors["confirm-password"] = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors["confirm-password"] = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setGlobalMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.message === "Customer Registered Successfully") {
        setGlobalMessage("Success! Account created. Redirecting...");
        // Save to local storage
        const userPayload = { name, email, token: data.access_token };
        window.localStorage.setItem("rimaraUser", JSON.stringify(userPayload));
        // Redirect to /account after a short delay
        setTimeout(() => {
          window.location.href = "/account";
        }, 1500);
      } else if (data?.message === "Duplicate Email Id") {
        setErrors({ email: "This email address is already registered." });
        setIsLoading(false);
      } else if (data && (data.name || data.email || data.password)) {
        const apiErrors = {};
        if (data.name) apiErrors.name = Array.isArray(data.name) ? data.name.join(" ") : String(data.name);
        if (data.email) apiErrors.email = Array.isArray(data.email) ? data.email.join(" ") : String(data.email);
        if (data.password) apiErrors.password = Array.isArray(data.password) ? data.password.join(" ") : String(data.password);
        setErrors(apiErrors);
        setIsLoading(false);
      } else {
        const errMsg = data?.message || "An unexpected error occurred. Please try again.";
        setGlobalMessage(errMsg);
        setIsLoading(false);
      }
    } catch (err) {
      setGlobalMessage("Unable to connect to the server. Please check your internet connection.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        <span>Full name</span>
        <input
          type="text"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.name && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {errors.name}
          </span>
        )}
      </label>
      <label>
        <span>Email address</span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.email && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {errors.email}
          </span>
        )}
      </label>
      <label>
        <span>Password</span>
        <input
          type="password"
          name="password"
          placeholder="Create password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors.password && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {errors.password}
          </span>
        )}
      </label>
      <label>
        <span>Confirm password</span>
        <input
          type="password"
          name="confirm-password"
          placeholder="Confirm password"
          autoComplete="new-password"
          value={formData["confirm-password"]}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {errors["confirm-password"] && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {errors["confirm-password"]}
          </span>
        )}
      </label>
      {globalMessage ? <p className="auth-message">{globalMessage}</p> : null}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </button>
      <div className="auth-card__links">
        <Link href="/login">Already have an account?</Link>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
    if (globalMessage) setGlobalMessage("");
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      setError("Email address is required.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setGlobalMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/forgotPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: emailTrimmed })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.message === "Mail Sent Successfully") {
        setGlobalMessage("Reset link sent successfully. Please check your email inbox.");
        setEmail("");
        setIsLoading(false);
      } else if (data?.message === "Invalid Email Id or Inactive Status") {
        setError("This email address is not registered or inactive.");
        setIsLoading(false);
      } else {
        const errMsg = data?.message || "An unexpected error occurred. Please try again.";
        setGlobalMessage(errMsg);
        setIsLoading(false);
      }
    } catch (err) {
      setGlobalMessage("Unable to connect to the server. Please check your internet connection.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        <span>Email address</span>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        {error && (
          <span style={{ color: "var(--rimara-copper)", font: "12px var(--font-ui)", marginTop: "2px" }}>
            {error}
          </span>
        )}
      </label>
      {globalMessage ? <p className="auth-message">{globalMessage}</p> : null}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Sending link..." : "Send reset link"}
      </button>
      <div className="auth-card__links">
        <Link href="/login">Back to login</Link>
        <Link href="/register">Create account</Link>
      </div>
    </form>
  );
}

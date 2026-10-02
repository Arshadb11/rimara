"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { ease, useReveal } from "./Reveal";

const columns = [
  {
    title: "Shop",
    links: [["All Fragrances", "/shop/fragrances"], ["Air That Stays", "/shop/fragrances/air-that-stays"], ["Last Light", "/shop/fragrances/last-light"], ["Quiet Blossom", "/shop/fragrances/quiet-blossom"], ["Wild Air", "/shop/fragrances/wild-air"], ["Discovery Sets", "/shop/fragrances/discovery-set"]]
  },
  {
    title: "Explore",
    links: [["Our Story", "/story"], ["Brand Concept", "/concept"], /* ["Perfumers", "/perfumers"], */ ["What's Your Air?", "/diagnostic"]]
  },
  {
    title: "Support",
    links: [["Terms & Conditions", "/terms-and-conditions"], ["Privacy & Cookies", "/privacy-and-cookies"], ["Payments", "/payments"], ["Safe & Secure Delivery", "/delivery"], ["Returns, Refunds & Cancellations", "/returns"], ["Limitation of Liability & Disclaimers", "/liability"], ["Contact Us", "/contact"]]
  }
];

export default function Footer() {
  const [ref, visible] = useReveal();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.78, ease, delay }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setIsError(true);
      setMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setIsError(true);
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: emailTrimmed })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data?.status !== "error") {
        setIsError(false);
        setMessage(data?.message || "Thank you for subscribing. We'll stay in touch!");
        setEmail("");
      } else {
        setIsError(true);
        setMessage(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setIsError(true);
      setMessage("Unable to subscribe right now. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer ref={ref} className="site-footer">
      <motion.span
        className="footer-border"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={visible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.9, ease }}
        aria-hidden="true"
      />
      <div className="footer-grid">
        <motion.div {...rise(0.1)}>
          <Link className="footer-logo" href="/">
            <Image src="/assets/images/rimara.svg" alt="Rimara logo" width={180} height={80} />
          </Link>
          <p className="footer-brand-line">
            A fine-fragrance brand from the house of{" "}
            <Link href="https://www.sillageofficial.ae/" className="footer-sillage-link">
              <Image
                src="/assets/images/sillage-logo.jpg"
                alt="Sillage"
                width={80}
                height={35}
                className="footer-sillage-logo"
              />
            </Link>
          </p>
        </motion.div>
        {columns.map((column, index) => (
          <motion.div key={column.title} {...rise(0.2 + index * 0.1)}>
            <h2 className="footer-heading">{column.title}</h2>
            <ul className="footer-list">
              {column.links.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}
            </ul>
          </motion.div>
        ))}
        <motion.div {...rise(0.62)}>
          <h2 className="footer-heading">Newsletter</h2>
          <p>A quiet note, once in a while.</p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              aria-label="Email address"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (message) setMessage("");
              }}
              disabled={isLoading}
            />
            <button type="submit" aria-label="Submit newsletter" disabled={isLoading}>
              {isLoading ? "..." : "→"}
            </button>
          </form>
          {message && (
            <p
              className={`newsletter-message ${isError ? "error" : "success"}`}
              style={{
                fontSize: "12px",
                marginTop: "8px",
                color: isError ? "#c53030" : "#2f855a"
              }}
            >
              {message}
            </p>
          )}
        </motion.div>
      </div>
      <motion.section className="site-disclaimer" aria-label="Disclaimer" {...rise(0.72)}>
        <h2>Disclaimer</h2>
        <p>This website has been crafted as a digital expression of Rimara's fragrance world. The words, visuals, colours, moods, timings and scent descriptions used across the site are intended to guide discovery and express the emotional character of each fragrance.</p>
        <p>Every fragrance lives differently on every person. Skin, temperature, climate, application and time all influence how a scent opens, settles and stays. The notes and stories shared here are creative and sensory references, not guaranteed results.</p>
        <p>Product visuals, bottle tones, packaging details and colours may appear slightly different from the physical product due to photography, lighting, screen calibration, materials and production finish. Rimara aims to present every fragrance with care and accuracy, while allowing for natural variation.</p>
        <p>All brand names, product names, imagery, copy, design systems, layouts and creative expressions on this website are the property of rimara PARFUMS and/or Sillage FZCO, unless otherwise credited. They may not be copied, reproduced, altered or used commercially without written permission.</p>
        <p>Product information, availability, pricing, ingredients, packaging and offers may change without prior notice. Please refer to the product packaging and official purchase details for the most current information.</p>
        <p>Rimara is made to be experienced slowly. Try it on skin. Let it move with you. Let the air decide.</p>
      </motion.section>
      <motion.div className="copyright" {...rise(0.82)}><span>© rimara PARFUMS / Sillage FZCO. All rights reserved.</span><span>UAE / AED</span></motion.div>
    </footer>
  );
}


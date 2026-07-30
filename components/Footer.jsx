"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ease, useReveal } from "./Reveal";

const columns = [
  {
    title: "Shop",
    links: [["All Fragrances", "/shop/fragrances"], ["Discovery Pack", "/shop/discovery-pack"], ["Best Sellers", "/shop/fragrances"], ["Gift Cards", "/contact"]]
  },
  {
    title: "Explore",
    links: [["Concept", "/concept"], ["Story", "/story"], ["Perfumers", "/perfumers"], ["Sillage", "/"]]
  },
  {
    title: "Support",
    links: [["Contact", "/contact"], ["Shipping", "/contact"], ["Returns", "/contact"], ["FAQs", "/contact"], ["Privacy Policy", "/contact"]]
  }
];

export default function Footer() {
  const [ref, visible] = useReveal();
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: { duration: 0.78, ease, delay }
  });

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
            <Image src="/assets/images/sillage-logo.svg" alt="Sillage logo" width={220} height={80} />
          </Link>
          <p>Crafting the Air Around You.</p>
          <p className="small-copy muted">Rimara is a fragrance brand by Sillage.</p>
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
          <form className="newsletter-form">
            <input aria-label="Email address" type="email" placeholder="Email" />
            <button type="button" aria-label="Submit newsletter">→</button>
          </form>
        </motion.div>
      </div>
      <motion.section className="site-disclaimer" aria-label="Disclaimer" {...rise(0.72)}>
        <h2>Disclaimer</h2>
        <p>This website has been crafted as a digital expression of Rimara’s fragrance world. The words, visuals, colours, moods, timings and scent descriptions used across the site are intended to guide discovery and express the emotional character of each fragrance.</p>
        <p>Every fragrance lives differently on every person. Skin, temperature, climate, application and time all influence how a scent opens, settles and stays. The notes and stories shared here are creative and sensory references, not guaranteed results.</p>
        <p>Product visuals, bottle tones, packaging details and colours may appear slightly different from the physical product due to photography, lighting, screen calibration, materials and production finish. Rimara aims to present every fragrance with care and accuracy, while allowing for natural variation.</p>
        <p>All brand names, product names, imagery, copy, design systems, layouts and creative expressions on this website are the property of Rimara and/or Sillage, unless otherwise credited. They may not be copied, reproduced, altered or used commercially without written permission.</p>
        <p>Product information, availability, pricing, ingredients, packaging and offers may change without prior notice. Please refer to the product packaging and official purchase details for the most current information.</p>
        <p>Rimara is made to be experienced slowly. Try it on skin. Let it move with you. Let the air decide.</p>
        <p>Designed by COMDEZ UK</p>
      </motion.section>
      <motion.div className="copyright" {...rise(0.82)}><span>© Rimara / Sillage. All rights reserved.</span><span>India / INR</span></motion.div>
    </footer>
  );
}

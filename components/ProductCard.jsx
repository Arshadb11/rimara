"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { StaggerItem, ease, useReveal } from "./Reveal";

function stripHtml(html = "") {
  let text = String(html || "");
  for (let i = 0; i < 2; i++) {
    text = text
      .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
      .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
      .replace(/<[^>]*>/g, " ");
  }
  return text.replace(/\s+/g, " ").trim();
}

export default function ProductCard({ product }) {
  // threshold 0 + rootMargin "300px" below viewport = triggers 300px before card enters view
  const [ref, visible] = useReveal(0, "0px 0px 300px 0px");
  const item = (delay = 0) => ({
    initial: { opacity: 0, y: 8 },
    animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    transition: { duration: 0.55, ease, delay }
  });

  // return (
  //   <StaggerItem className="h-full">
  //     <Link ref={ref} className="product-card catalog-card" href={product.href} style={{ "--card-accent": product.color, "--card-hover-bg": product.color }}>
  //       <motion.span
  //         className="product-card__media"
  //         initial={{ opacity: 0, scale: 1.03 }}
  //         animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.03 }}
  //         transition={{ duration: 1.1, ease }}
  //       >
  //         <Image className="product-card__image product-card__image--base" src={product.image} alt={product.alt} fill sizes="(max-width: 768px) 100vw, 25vw" />
  //         <Image className="product-card__image product-card__image--hover" src={product.hoverImage} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" />
  //       </motion.span>
  //       <div className="product-card__body">
  //         <motion.span
  //           className="product-card__accent"
  //           initial={{ opacity: 0, scaleX: 0 }}
  //           animate={visible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
  //           transition={{ duration: 0.72, ease, delay: 0.08 }}
  //         />
  //         <motion.p className="product-meta" {...item(0.16)}>{product.mood}</motion.p>
  //         <motion.h2 {...item(0.28)}>{product.name}</motion.h2>
  //         <motion.p {...item(0.4)}>{product.notes}</motion.p>
  //         <motion.p className="product-card__copy" {...item(0.52)}>{product.copy}</motion.p>
  //         <motion.span className="product-card__cta" {...item(0.64)}>{product.cta}</motion.span>
  //       </div>
  //     </Link>
  //   </StaggerItem>
  // );

  return (
    <StaggerItem className="h-full">
      <Link ref={ref} className="product-card catalog-card" href={product.product_name.toLowerCase().trim().replace(/\s+/g, '-') == 'discovery-pack' ? '/shop/fragrances/discovery-set' : `/shop/fragrances/${product.product_name.toLowerCase().trim().replace(/\s+/g, '-')}`} style={{ "--card-accent": product.color, "--card-hover-bg": product.color }}>
        <motion.span
          className="product-card__media"
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <Image className="product-card__image product-card__image--base" src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[0]}`} alt={product.product_name} fill sizes="(max-width: 768px) 100vw, 25vw" />
          {/* <Image className="product-card__image product-card__image--base" src={`http://localhost/rimara-admin/public/storage/${JSON.parse(product.images)[0]}`} alt={product.product_name} fill sizes="(max-width: 768px) 100vw, 25vw" /> */}
          <Image className="product-card__image product-card__image--hover" src={`${process.env.NEXT_PUBLIC_API_URL}storage/${JSON.parse(product.images)[1]}`} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" />
          {/* <Image className="product-card__image product-card__image--hover" src={`http://localhost/rimara-admin/public/storage/${JSON.parse(product.images)[1]}`} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" /> */}
        </motion.span>
        <div className="product-card__body">
          <motion.span
            className="product-card__accent"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={visible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.72, ease, delay: 0.08 }}
          />
          <motion.p className="product-meta" {...item(0.16)}>{product.occasion?.replace(/<\/?[^>]+(>|$)/g, '').trim()}</motion.p>
          <motion.h2 {...item(0.28)}>{product.product_name}</motion.h2>
          <motion.p {...item(0.4)}>{product.item_classification?.replace(/<\/?[^>]+(>|$)/g, '').trim()}</motion.p>
          <motion.p className="product-card__copy" {...item(0.52)}>{stripHtml(product.description)}</motion.p>
          <motion.span className="product-card__cta" {...item(0.64)}>{product.ctx}</motion.span>
        </div>
      </Link>
    </StaggerItem>
  );
}


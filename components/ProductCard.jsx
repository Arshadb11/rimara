"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { StaggerItem, ease, useReveal } from "./Reveal";

export default function ProductCard({ product }) {
  const [ref, visible] = useReveal();
  const item = (delay = 0) => ({
    initial: { opacity: 0, y: 14, filter: "blur(8px)" },
    animate: visible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(8px)" },
    transition: { duration: 0.76, ease, delay }
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
      <Link ref={ref} className="product-card catalog-card" href={product.product_name.toLowerCase().trim().replace(/\s+/g, '-') == 'discovery-pack' ? '/shop/discovery-pack' : `/shop/fragrances/${product.product_name.toLowerCase().trim().replace(/\s+/g, '-')}`} style={{ "--card-accent": product.color, "--card-hover-bg": product.color }}>
        <motion.span
          className="product-card__media"
          initial={{ opacity: 0, scale: 1.03 }}
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.03 }}
          transition={{ duration: 1.1, ease }}
        >
          {/* <Image className="product-card__image product-card__image--base" src={`https://phpstack-1448119-6605392.cloudwaysapps.com/public/storage/${JSON.parse(product.images)[0]}`} alt={product.product_name} fill sizes="(max-width: 768px) 100vw, 25vw" /> */}
          <Image className="product-card__image product-card__image--base" src={`http://localhost/rimara-admin/public/storage/${JSON.parse(product.images)[0]}`} alt={product.product_name} fill sizes="(max-width: 768px) 100vw, 25vw" />
          {/* <Image className="product-card__image product-card__image--hover" src={`https://phpstack-1448119-6605392.cloudwaysapps.com/public/storage/${JSON.parse(product.images)[1]}`} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" /> */}
          <Image className="product-card__image product-card__image--hover" src={`http://localhost/rimara-admin/public/storage/${JSON.parse(product.images)[1]}`} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" />
        </motion.span>
        <div className="product-card__body">
          <motion.span
            className="product-card__accent"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={visible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.72, ease, delay: 0.08 }}
          />
          <motion.p className="product-meta" {...item(0.16)}>{product.occasion}</motion.p>
          <motion.h2 {...item(0.28)}>{product.product_name}</motion.h2>
          <motion.p {...item(0.4)}>{product.item_classification}</motion.p>
          <motion.p className="product-card__copy" {...item(0.52)}>{product.description.replace(/<\/?p>/g, '')}</motion.p>
          <motion.span className="product-card__cta" {...item(0.64)}>{product.cta}</motion.span>
        </div>
      </Link>
    </StaggerItem>
  );
}

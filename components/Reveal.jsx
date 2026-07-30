"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export const ease = [0.22, 1, 0.36, 1];

export function useReveal(amount = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisible(true);
      observer.disconnect();
    }, { threshold: amount });

    observer.observe(element);
    return () => observer.disconnect();
  }, [amount, visible]);

  return [ref, visible];
}

export function Reveal({ children, className = "", delay = 0, y = 18 }) {
  const [ref, visible] = useReveal();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      animate={visible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y, filter: "blur(10px)" }}
      transition={{ duration: 0.82, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

export function LineReveal({ children, className = "", delay = 0 }) {
  const [ref, visible] = useReveal();
  const lines = String(children).split("\n");

  return (
    <span ref={ref} className={`block ${className}`}>
      {lines.map((line, index) => (
        <span className="reveal-mask" key={`${line}-${index}`}>
          <motion.span
            className="reveal-line"
            initial={{ opacity: 0, y: "105%", filter: "blur(10px)" }}
            animate={visible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: "105%", filter: "blur(10px)" }}
            transition={{ duration: 1.08, ease, delay: delay + index * 0.14 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function Stagger({ children, className = "" }) {
  const [ref, visible] = useReveal();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.14 } } }}
    >
      {children}
    </motion.div>
  );
}

export function HairlineDraw({ className = "" }) {
  const [ref, visible] = useReveal();

  return (
    <span ref={ref} className={`hairline-draw ${className}`} aria-hidden="true">
      <motion.span
        className="hairline-draw__x"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={visible ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.9, ease }}
      />
      <motion.span
        className="hairline-draw__y"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={visible ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.08 }}
      />
    </span>
  );
}

export function StaggerItem({ children, className = "", ...props }) {
  return (
    <motion.div
      className={className}
      {...props}
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } }
      }}
    >
      {children}
    </motion.div>
  );
}

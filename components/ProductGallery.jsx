"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export default function ProductGallery({ images, productName, apiUrl }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);

  function handleThumbClick(index) {
    if (index === activeIndex) return;
    // Clear any in-progress transition
    if (timerRef.current) clearTimeout(timerRef.current);
    // Fade out
    setFading(true);
    timerRef.current = setTimeout(() => {
      // Swap image while invisible, then fade back in
      setActiveIndex(index);
      setFading(false);
    }, 220);
  }

  return (
    <div className="product-visual product-gallery">
      <Image
        className="product-gallery__master"
        src={`${apiUrl}storage/${images[activeIndex]}`}
        alt={productName}
        width={1086}
        height={1448}
        priority
        style={{ opacity: fading ? 0 : 1, transition: "opacity 220ms ease" }}
      />
      <div className="product-gallery__thumbs">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            className={`product-gallery__thumb-btn${activeIndex === index ? " is-active" : ""}`}
            onClick={() => handleThumbClick(index)}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={`${apiUrl}storage/${src}`}
              alt=""
              width={220}
              height={280}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

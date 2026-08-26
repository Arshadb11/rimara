import Image from "next/image";
import Link from "next/link";
import { homeProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { HairlineDraw, LineReveal, Reveal, Stagger } from "@/components/Reveal";

export default async function HomePage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}api/allProducts`,
    // "http://localhost/rimara-admin/public/api/allProducts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify({
        limit: "4",
        page: "1",
      }),
      cache: "no-store",
    }
  );

  const apiResponse = await response.json();

  const productSettings = {
    "quiet-blossom": {
      color: "#d4a0a8",
      ctx: "Explore Quiet Blossom",
    },
    "wild-air": {
      color: "#8ab0c8",
      ctx: "Explore Wild Air",
    },
    "last-light": {
      color: "#e0a040",
      ctx: "Explore Last Light",
    },
    "air-that-stays": {
      color: "#b3a469",
      ctx: "Explore Air That Stays",
    },
  };

  const products = (apiResponse?.data || []).map((product) => ({
    ...product,
    ...(productSettings[product.product_name.toLowerCase().trim().replace(/\s+/g, '-')] || {}),
  }));

  return (
    <main>
      <section className="hero">
        <div className="hero-media">
          {["banner-1.png", "banner-2.png", "banner-3.png"].map((name, index) => (
            <Image key={name} className="hero-slide" src={`/assets/images/homepage/${name}`} alt="" fill priority={index === 0} sizes="100vw" />
          ))}
        </div>
        <div className="hero-copy">
          <Reveal delay={0}><p className="eyebrow">Hero</p></Reveal>
          <h1><LineReveal delay={0.12}>Own the Air</LineReveal></h1>
          <Reveal delay={0.32}><p className="body-copy">Inspired by the spirit of the desert, Rimara is a collection of fine fragrances crafted for those who choose presence over attention.</p></Reveal>
          <Reveal delay={0.46}><Link className="text-link" href="/shop/fragrances">View fragrances</Link></Reveal>
        </div>
        <a className="scroll-cue" href="#collection" aria-label="Scroll to collection">
          <span>Scroll</span>
          <svg viewBox="0 0 24 36" aria-hidden="true"><path d="M12 2v28" /><path d="m5 23 7 7 7-7" /></svg>
        </a>
      </section>

      <section className="section collection-section" id="collection">
        <div className="collection-heading">
          <div className="collection-heading__title"><p className="section-kicker">The Collection</p><h2><LineReveal>Find the air that finds you.</LineReveal></h2></div>
          <Reveal className="collection-heading__copy"><p className="body-copy muted">You do not choose a fragrance by notes alone. You choose it by the hour, the mood, and the memory it leaves behind.</p><p className="body-copy muted">Begin with a feeling. Rimara will guide you to the scent that already feels like yours.</p></Reveal>
        </div>
        <Stagger className="product-grid hairline-frame">
          <HairlineDraw />
          {/* {homeProducts.map((product) => <ProductCard key={product.id} product={product} />)} */}
          {products.map((product) => <ProductCard key={product.product_id} product={product} />)}
        </Stagger>
      </section>

      <section className="split-story">
        <div><p className="eyebrow">Concept</p><h2><LineReveal>A Journey That Stays With You</LineReveal></h2></div>
        <Reveal className="story-copy"><p>Rimara takes its name from the idea of movement and transformation. Not simply travelling from one place to another, but becoming someone new along the way.</p><p>Like the desert itself, every fragrance evolves with time, revealing new layers, new memories and a deeper connection to the person who wears it.</p><Link className="text-link" href="/concept">Begin with Rimara</Link></Reveal>
      </section>

      <section className="image-text">
        <Image src="/assets/images/desert-landscape.jpg" alt="Desert dunes in shifting light" width={1600} height={980} />
        <Reveal className="image-text__copy">
          <p className="eyebrow">The World of Rimara</p>
          <h2><LineReveal>Inspired by the Desert</LineReveal></h2>
          <p className="body-copy">In the desert, nothing stands still. The wind moves. The sand shifts. The horizon changes with every hour. Yet some things remain: presence, character and memory.</p>
          <Link className="button-secondary" href="/story">Discover the story</Link>
        </Reveal>
      </section>
    </main>
  );
}

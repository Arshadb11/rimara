import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import ProductPurchase from "@/components/ProductPurchase";
import ProductCard from "@/components/ProductCard";
import { LineReveal, Reveal, Stagger } from "@/components/Reveal";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.id === slug);
  return { title: product?.name || "Fragrance", description: product?.copy || "Rimara fragrance" };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = products.find((item) => item.id === slug);
  if (!product) notFound();
  return (
    <main>
      <section className="product-detail">
        <div className="product-visual product-gallery">
          <Image className="product-gallery__master" src={product.image} alt={product.alt} width={1086} height={1448} priority />
          <div className="product-gallery__thumbs">
            {[product.image, product.hoverImage, product.image, product.hoverImage].map((src, index) => <Image key={`${src}-${index}`} src={src} alt="" width={220} height={280} />)}
          </div>
        </div>
        <Reveal className="product-buy">
          <p className="product-meta">{product.mood}</p>
          <h1><LineReveal>{product.name}</LineReveal></h1>
          <p className="product-accord">{product.accord}<br />{product.type}</p>
          <p className="body-copy">{product.notes}</p>
          <p>{product.heroCopy}</p>
          <ProductPurchase product={product} />
        </Reveal>
      </section>
      <section className="catalog-feature">
        <div><p className="eyebrow">Product Story</p><h2><LineReveal>Made to live in the air after you leave.</LineReveal></h2></div>
        <Reveal>{product.story.map((copy) => <p key={copy}>{copy}</p>)}</Reveal>
      </section>
      <section className="catalog-feature catalog-feature--stacked">
        <div><p className="eyebrow">Key Notes</p><h2><LineReveal>Four materials. One atmosphere.</LineReveal></h2></div>
        <div className="note-grid">{product.keyNotes.map(([name, feel, copy], index) => <article key={name} style={{ "--note-color": product.color }}><div className="note-image" /><p className="eyebrow">{String(index + 1).padStart(2, "0")} / {name}</p><h3>{feel}</h3><p>{copy}</p></article>)}</div>
      </section>
      <section className="catalog-feature">
        <div><p className="eyebrow">How it feels</p><h2><LineReveal>{product.feels}</LineReveal></h2></div>
        <Reveal><p className="eyebrow">When to wear</p><p>{product.wear}</p></Reveal>
      </section>
      <section className="product-accordions">
        <details><summary>Ingredients</summary><p>{product.ingredients}</p></details>
        <details><summary>Safety information</summary><p>FLAMMABLE. Keep away from heat, hot surfaces, sparks, open flames and other ignition sources. For external use only. Avoid contact with eyes. Keep out of reach of children. Discontinue use if irritation occurs.</p></details>
        <details><summary>Product details and compliance</summary><p>Product type: Eau de Parfum. Net contents: 100 mL / 3.4 FL OZ. PAO: 24M. Batch / Lot Number: See packaging. Manufacturing Date: See packaging. Country of origin and responsible person details to be confirmed. Ingredient declarations, responsible person details, batch coding, country of origin and regional compliance information must be verified before final print, upload or sale in the UK, USA and EU.</p></details>
      </section>
      <section className="catalog-feature">
        <div><p className="eyebrow">Discovery Pack</p><h2><LineReveal>Start with all four. Let one stay.</LineReveal></h2></div>
        <Reveal><p>Fragrance should never be chosen in a hurry. It needs skin, time and air.</p><p>The Rimara Discovery Pack brings together four 10 ml fragrances: Air That Stays, Last Light, Wild Air and Quiet Blossom. Wear each one across a different hour, mood and day.</p><Link className="button-secondary" href="/shop/discovery-pack">Explore Discovery Pack</Link></Reveal>
      </section>
      <Stagger className="product-grid">{products.filter((item) => item.id !== product.id).map((item) => <ProductCard key={item.id} product={item} />)}</Stagger>
    </main>
  );
}

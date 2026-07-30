import Image from "next/image";
import Link from "next/link";
import { discoveryPack, products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { LineReveal, Reveal, Stagger } from "@/components/Reveal";

export const metadata = { title: "Discovery Pack", description: "Try the full Rimara collection on skin." };

export default function DiscoveryPackPage() {
  return (
    <main>
      <section className="catalog-hero">
        <div><p className="eyebrow">Discovery Pack</p><h1><LineReveal>Start with all four. Let one stay.</LineReveal></h1></div>
        <Reveal><p className="body-copy muted">Fragrance should not be chosen in a hurry. It needs skin, time and air. Four 10 ml fragrances help you find the one that belongs to your air.</p><Link className="button-secondary" href="/shop/fragrances">View fragrances</Link></Reveal>
      </section>
      <section className="image-text">
        <Image src={discoveryPack.image} alt={discoveryPack.alt} width={1086} height={1448} />
        <Reveal className="image-text__copy"><p className="eyebrow">{discoveryPack.mood}</p><h2><LineReveal>{discoveryPack.name}</LineReveal></h2><p className="body-copy">{discoveryPack.copy}</p><Link className="button-secondary" href="/contact">Enquire</Link></Reveal>
      </section>
      <Stagger className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</Stagger>
    </main>
  );
}

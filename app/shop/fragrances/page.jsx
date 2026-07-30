import Link from "next/link";
import Image from "next/image";
import { products, discoveryPack } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { HairlineDraw, LineReveal, Reveal, Stagger } from "@/components/Reveal";

export const metadata = {
  title: "Fragrances",
  description: "Choose the air you leave behind with Rimara fragrances."
};

export default function FragrancesPage() {
  return (
    <main>
      <section className="catalog-hero">
        <div><p className="eyebrow">Shop / Fragrances</p><h1><LineReveal>Choose the air you leave behind.</LineReveal></h1></div>
        <Reveal className="catalog-intro"><p className="body-copy muted">Rimara is built around moments, not moods invented in a lab. Each fragrance begins with a time, a temperature and a feeling you recognise.</p><p className="body-copy muted">From deep oud at 02:00 to soft lily before dawn, this collection helps you find the scent that feels closest to who you are — and what you want to leave in the air.</p></Reveal>
      </section>
      <Stagger className="catalog-grid hairline-frame">
        <HairlineDraw />
        {[...products, discoveryPack].map((product) => <ProductCard key={product.id} product={product} />)}
      </Stagger>
      <section className="catalog-feature">
        <div><p className="eyebrow">Discovery Pack</p><h2><LineReveal>Start with all four. Let one stay.</LineReveal></h2></div>
        <Reveal className="catalog-feature__media-copy"><Image src="/assets/images/catalog/start-with.png" alt="Rimara Discovery Pack atmosphere" width={1400} height={1000} /><div><p>Fragrance should never be chosen in a hurry. It needs skin, time and air. Only then does it begin to show what it really is.</p><p>The Rimara Discovery Pack brings together four 10 ml fragrances: Air That Stays, Last Light, Wild Air and Quiet Blossom. Each one belongs to a different hour, mood and memory.</p><p>Wear them across different days. Let each scent open, settle and return in its own way. The right one will not need convincing — it will simply feel like yours.</p><Link className="button-secondary" href="/shop/discovery-pack">Explore Discovery Pack</Link></div></Reveal>
      </section>
      <section className="catalog-feature catalog-feature--stacked">
        <Reveal><p className="eyebrow">How we select fragrances</p><h2><LineReveal>Selected by instinct. Refined by craft.</LineReveal></h2><p>We choose fragrances the way people remember moments — through atmosphere, contrast and emotion. A scent must first create a feeling. Then it must earn its place on skin.</p><p>Every Rimara fragrance is shaped around four questions: What hour does it belong to? What memory does it carry? How does it move in the air? What should remain after you leave?</p></Reveal>
        <div className="catalog-points hairline-frame"><HairlineDraw />{[
          ["/assets/images/catalog/the-hour.svg", "The hour", "Each scent begins with a time of day."],
          ["/assets/images/catalog/the-mood.svg", "The mood", "Every note must support the emotional world."],
          ["/assets/images/catalog/the-skin.svg", "The skin", "The fragrance must feel personal, not decorative."],
          ["/assets/images/catalog/the-trail.svg", "The trail", "What stays behind matters most."]
        ].map(([icon, title, copy]) => <article key={title}><Image className="catalog-point-icon" src={icon} alt="" width={44} height={44} /><p className="eyebrow">{title}</p><p>{copy}</p></article>)}</div>
      </section>
      <section className="catalog-feature">
        <div><p className="eyebrow">Our psychology of fragrance</p><h2><LineReveal>A fragrance is not chosen by the nose alone.</LineReveal></h2></div>
        <Reveal className="catalog-feature__media-copy"><Image src="/assets/images/catalog/our-psychology.png" alt="Rimara psychology of fragrance atmosphere" width={1400} height={1000} /><div><p>It begins deeper. Before words. Before reason. Before the mind explains why something feels familiar.</p><p>Scent has a private way of finding memory. It can return a room, a person, a season, or a version of yourself you had almost forgotten.</p><p>Rimara is built around that invisible connection. We do not create fragrances only from ingredients. We shape them around human signals — confidence, softness, warmth, movement, intimacy and presence.</p></div></Reveal>
      </section>
    </main>
  );
}

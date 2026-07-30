import Image from "next/image";
import { LineReveal, Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Concept",
  description: "The world of Rimara: air, memory, presence and time."
};

const conceptActs = [
  {
    eyebrow: "Act 01: The Name",
    title: "A name built around movement.",
    copy: "Rimara takes its name from the idea of movement and transformation. It is not about travelling from one place to another. It is about becoming different through the journey. The word suggests progress, change and direction, but without speed or noise.",
    image: "/assets/images/concept/section-02.jpg",
    alt: "Rimara concept image for movement and transformation"
  },
  {
    eyebrow: "Act 02: The World",
    title: "Inspired by desert atmosphere.",
    copy: "The world of Rimara is shaped by the desert: open air, shifting light, warm stone, dry wind and long shadows. Each fragrance is connected to a time, a mood and a feeling, from deep night to golden hour to the quiet before dawn.",
    image: "/assets/images/concept/section-03.jpg",
    alt: "Rimara concept image inspired by desert atmosphere"
  },
  {
    eyebrow: "Act 03: The Fragrance",
    title: "Fragrance that earns memory.",
    copy: "Most perfumes are designed to attract attention quickly. Rimara is designed to stay with the wearer and become more personal over time. It is a living trail, something that changes with the person wearing it.",
    image: "/assets/images/concept/section-04.jpg",
    alt: "Rimara concept image for fragrance and memory"
  },
  {
    eyebrow: "Act 04: The Wearer",
    title: "For people who choose presence.",
    copy: "Rimara is made for people who do not need to be loud to be noticed. They wear fragrance not to impress a room, but to express something more personal: mood, memory, character and intent.",
    image: "/assets/images/concept/section-05.jpg",
    alt: "Rimara concept image for quiet presence"
  },
  {
    eyebrow: "Act 05: The Promise",
    title: "Own the Air.",
    copy: "Rimara's promise is simple: fragrance should become part of the air around you. From the bottle to the final trace, every detail is designed to support that promise.",
    image: "/assets/images/concept/section-06.jpg",
    alt: "Rimara concept image for Own the Air"
  }
];

export default function ConceptPage() {
  return (
    <main>
      <section className="page-hero">
        <div>
          <p className="eyebrow">Concept</p>
          <h1><LineReveal>Air. Memory. Presence. Time.</LineReveal></h1>
        </div>
        <Reveal>
          <div className="concept-hero-copy">
            <p className="body-copy-large">Rimara is built on the belief that fragrance is not only about how it smells when first sprayed. The real value of a scent is in how it moves, settles and stays around the person wearing it.</p>
            <p className="body-copy">Every Rimara fragrance is shaped around a specific mood, hour and atmosphere. We look at temperature, skin, shadow, air and memory before we look at ingredients.</p>
            <p className="body-copy">The result is fragrance with purpose. Not decorative. Not loud. A scent that becomes part of your presence and leaves a clear trace behind.</p>
          </div>
        </Reveal>
      </section>

      {conceptActs.map(({ eyebrow, title, copy, image, alt }) => (
        <section className="catalog-feature" key={eyebrow}>
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2><LineReveal>{title}</LineReveal></h2>
          </div>
          <Reveal>
            <div className="catalog-feature__media-copy concept-media-copy">
              <Image src={image} width={1200} height={760} alt={alt} loading="eager" unoptimized />
              <p>{copy}</p>
            </div>
          </Reveal>
        </section>
      ))}
    </main>
  );
}

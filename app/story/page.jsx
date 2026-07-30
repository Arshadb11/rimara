import Image from "next/image";
import Link from "next/link";
import { LineReveal, Reveal } from "@/components/Reveal";

export const metadata = {
  title: "Story",
  description: "The story the air remembers: Rimara, sillage, desert atmosphere and ritual."
};

const storySections = [
  {
    eyebrow: "Section 01 - Origin",
    title: "Made for what remains.",
    image: "/assets/images/story/section-01.jpg",
    alt: "Rimara story origin image",
    paragraphs: [
      "Rimara began with a simple thought: fragrance is not only what you wear. It is what the room remembers after you have gone.",
      "Most scents are built around first impressions. Rimara is built around the final trace, the part that stays on skin, in air, and in memory.",
      "That is why every fragrance begins with a mood, an hour and a human signal. Confidence. Warmth. Softness. Movement. Presence."
    ]
  },
  {
    eyebrow: "Section 02 - Sillage",
    title: "The air around you tells the story first.",
    image: "/assets/images/story/section-02.jpg",
    alt: "Rimara story image about sillage and memory",
    paragraphs: [
      "Sillage is the invisible trail a fragrance leaves behind. It is the space between you and everyone who remembers you.",
      "For Rimara, sillage is not about being loud. It is about being clear. A scent should move with you, stay close to your character, and leave something honest in the air.",
      "We create fragrances for that quiet distance, not too much, never too little. Just enough to become part of how you are felt."
    ]
  },
  {
    eyebrow: "Section 03 - Desert Atmosphere",
    title: "Shaped by shifting light.",
    image: "/assets/images/story/section-03.jpg",
    alt: "Rimara desert atmosphere story image",
    paragraphs: [
      "In the desert, nothing stands still. The wind moves. The sand shifts. The horizon changes with every hour.",
      "Yet some things remain: presence, character and memory. Rimara is built in that space, between movement and stillness, heat and shadow, silence and trace.",
      "Each fragrance carries a different hour of the day. Deep night. Last light. Open noon. The quiet before dawn. Together, they form a world told through air."
    ]
  },
  {
    eyebrow: "Section 04 - Ritual",
    title: "Try it on skin. Let the air decide.",
    image: "/assets/images/story/section-04.jpg",
    alt: "Rimara fragrance ritual story image",
    paragraphs: [
      "A fragrance needs movement, warmth and time. What opens first is not always what stays longest.",
      "Spray it on skin. Wear it through the day. Let it meet your body, your clothes, your weather and your rhythm.",
      "The right scent will not need explaining. It will settle naturally, return quietly, and begin to feel like something that was already yours."
    ],
    cta: true
  }
];

export default function StoryPage() {
  return (
    <main>
      <section className="page-hero story-hero">
        <div>
          <p className="eyebrow">Story</p>
          <h1><LineReveal>The Story the Air Remembers</LineReveal></h1>
        </div>
        <Reveal>
          <p className="body-copy-large">Works well for Rimara because it connects directly to fragrance, memory and sillage.</p>
        </Reveal>
      </section>

      {storySections.map((section, index) => (
        <section className={`story-section ${index % 2 === 1 ? "story-section--reverse" : ""}`} key={section.eyebrow}>
          <Reveal className="story-section__media">
            <Image
              src={section.image}
              alt={section.alt}
              width={956}
              height={1200}
              loading="eager"
              unoptimized
            />
          </Reveal>
          <Reveal className="story-section__copy">
            <p className="eyebrow">{section.eyebrow}</p>
            <h2><LineReveal>{section.title}</LineReveal></h2>
            <div className="story-copy">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.cta ? <Link className="button-secondary" href="/shop/fragrances">Explore the Collection</Link> : null}
          </Reveal>
        </section>
      ))}
    </main>
  );
}

import Image from "next/image";
import { perfumers } from "@/lib/products";
import { LineReveal, Reveal, Stagger, StaggerItem } from "@/components/Reveal";

export const metadata = { title: "Perfumers", description: "The people and craft behind Rimara fragrances." };

export default function PerfumersPage() {
  return (
    <main className="perfumers-editorial">
      <section className="perfumers-hero">
        <div className="perfumers-heading">
          <h1><LineReveal>The Power of Scent Memory</LineReveal></h1>
          <Reveal><p>Every fragrance has a story, and the notes you choose are the language you tell it in. From the first accord to the final trace on skin, each detail adds to the narrative that connects scent to memory.</p></Reveal>
        </div>
      </section>
      <section className="perfumers-gallery">
        <p className="perfumers-line">Every fragrance has a story to tell.</p>
        <Stagger className="perfumers-cards">
          <StaggerItem><article><Image src="/assets/images/perfumers/image-1.png" alt="Rimara perfumery visual study" width={1086} height={1448} /><h2>Timeless Expression</h2></article></StaggerItem>
          <StaggerItem><article><video src="/assets/images/perfumers/image-2.mp4" autoPlay muted loop playsInline aria-label="Rimara moving fragrance study" /><h2>Scent in Motion</h2></article></StaggerItem>
          <StaggerItem><article><Image src="/assets/images/perfumers/image-3.png" alt="Rimara fragrance craft visual" width={1086} height={1448} /><h2>Iconic Simplicity</h2></article></StaggerItem>
        </Stagger>
        <p className="perfumers-closing">Make them feel. Make them remember.</p>
      </section>
      <section className="perfumers-team" aria-label="Team">
        {perfumers.map((person) => (
          <article key={person.name}>
            <Image className="perfumers-team__portrait" src={person.image} alt={person.name} width={1254} height={1672} />
            <p className="eyebrow">{person.role}</p>
            <h2><LineReveal>{person.name}</LineReveal></h2>
            {person.copy.map((copy) => <p key={copy}>{copy}</p>)}
            <blockquote>“{person.quote}”</blockquote>
          </article>
        ))}
      </section>
    </main>
  );
}

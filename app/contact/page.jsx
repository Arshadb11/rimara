import { LineReveal, Reveal } from "@/components/Reveal";

export const metadata = { title: "Contact", description: "Contact Rimara." };

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div><p className="eyebrow">Contact</p><h1><LineReveal>Speak softly. We will listen.</LineReveal></h1></div>
        <Reveal><p className="body-copy muted">For fragrance enquiries, discovery packs, gifting, collaborations or stockist conversations, write to Rimara.</p></Reveal>
      </section>
      <section className="catalog-feature">
        <div><p className="eyebrow">Email</p><h2><LineReveal>hello@rimara.example</LineReveal></h2></div>
        <Reveal><p>Replace this placeholder with the official Rimara contact address when ready.</p><form className="newsletter-form"><input aria-label="Email address" type="email" placeholder="Email" /><button type="button">→</button></form></Reveal>
      </section>
    </main>
  );
}

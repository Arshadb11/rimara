import { LineReveal, Reveal } from "@/components/Reveal";

export const metadata = { title: "Contact", description: "Get in touch with Rimara — care@rimara.ae." };

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div><p className="eyebrow">Contact</p><h1><LineReveal>Speak softly. We will listen.</LineReveal></h1></div>
        <Reveal><p className="body-copy muted">For fragrance enquiries, gifting, collaborations, distribution conversations or anything else, write to us at <h2><LineReveal>care@rimara.ae</LineReveal></h2></p></Reveal>
      </section>
      <section className="catalog-feature">
        {/* <div>
          <p className="eyebrow">Email</p>
          <h2><LineReveal>care@rimara.ae</LineReveal></h2>
        </div> */}
        <Reveal>
          <p className="eyebrow">CONTACT US</p>
          <p>&ldquo;Rimara Parfums&rdquo; is a registered trademark of Sillage FZCO</p>
          <p>IFZA Business Park, Silicon Oasis, Dubai, U.A.E.</p>
        </Reveal>
      </section>
    </main>
  );
}

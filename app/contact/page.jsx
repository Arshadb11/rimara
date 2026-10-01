import { LineReveal, Reveal } from "@/components/Reveal";

export const metadata = { title: "Contact Us", description: "Get in touch with Rimara — care@rimara.ae." };

export default function ContactPage() {
  return (
    <main>
      <section className="page-hero">
        <div><p className="eyebrow">Contact Us</p><h1><LineReveal>Speak softly. We will listen.</LineReveal></h1></div>
        <Reveal>
          <p className="body-copy muted">
            For fragrance enquiries, gifting, collaborations, distribution conversations or anything else, write to us at <a href="mailto:care@rimara.ae">care@rimara.ae</a>.
          </p>
          <p className="body-copy muted" style={{ marginTop: "1.25em" }}>
            &ldquo;Rimara Parfums&rdquo; is a registered trademark of Sillage FZCO<br />
            IFZA Business Park, Silicon Oasis, Dubai, U.A.E.
          </p>
        </Reveal>
      </section>
    </main>
  );
}

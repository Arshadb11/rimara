import Link from "next/link";
import { products } from "@/lib/products";
import { HairlineDraw, LineReveal, Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import DiagnosticForm from "./DiagnosticForm";

export const metadata = { title: "Diagnostic", description: "Find your Rimara fragrance." };

const productHints = products.map((product) => ({
  name: product.name,
  mood: product.mood,
  notes: product.notes,
  color: product.color
}));

export default function DiagnosticPage() {
  return (
    <main>
      <section className="page-hero diagnostic-hero">
        <div>
          <p className="eyebrow">Find Your Air</p>
          <h1><LineReveal>Begin with a feeling.</LineReveal></h1>
        </div>
        <Reveal>
          <p className="body-copy-large">A quiet diagnostic for the hour, mood and notes that feel closest to you.</p>
          <p className="body-copy">Choose instinctively. Fragrance is often understood by skin before it is explained by language.</p>
        </Reveal>
      </section>

      <section className="diagnostic-form-section">
        <HairlineDraw />
        <Reveal>
          <div className="diagnostic-form-intro">
            <p className="eyebrow">Fragrance Form</p>
            <h2><LineReveal>Tell us what should remain in the air.</LineReveal></h2>
          </div>
        </Reveal>

        <DiagnosticForm />
      </section>

      <section className="diagnostic-results">
        <Reveal>
          <div>
            <p className="eyebrow">Rimara Collection</p>
            <h2><LineReveal>Your first answer is often the truest.</LineReveal></h2>
          </div>
        </Reveal>
        <Stagger className="diagnostic-result-grid">
          {productHints.map((product) => (
            <StaggerItem key={product.name} style={{ "--result-accent": product.color }}>
              <span />
              <p className="eyebrow">{product.mood}</p>
              <h3>{product.name}</h3>
              <p>{product.notes}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </main>
  );
}

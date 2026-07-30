import Link from "next/link";
import { products } from "@/lib/products";
import { HairlineDraw, LineReveal, Reveal, Stagger, StaggerItem } from "@/components/Reveal";

export const metadata = { title: "Diagnostic", description: "Find your Rimara fragrance." };

const noteGroups = [
  {
    id: "top-note",
    label: "Top note",
    helper: "The first air around the fragrance.",
    options: ["Bergamot", "Pink pepper", "Green leaves", "Fresh air", "Soft citrus"]
  },
  {
    id: "middle-note",
    label: "Middle note",
    helper: "The heart that stays close to skin.",
    options: ["Lily", "Amber", "Moss", "Fougere", "Dry woods"]
  },
  {
    id: "low-note",
    label: "Low note",
    helper: "The final trace left in the room.",
    options: ["Oud", "Patchouli", "Ambered woods", "Musk", "Warm resin"]
  }
];

const productHints = products.map((product) => ({
  name: product.name,
  mood: product.mood,
  notes: product.category,
  color: product.primary
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

        <form className="diagnostic-form">
          <div className="diagnostic-form__panel diagnostic-form__panel--dark">
            <p className="eyebrow">01 / Mood</p>
            <label>
              <span>Hour</span>
              <select name="hour" defaultValue="">
                <option value="" disabled>Select an hour</option>
                <option>Before dawn</option>
                <option>Midday heat</option>
                <option>Golden hour</option>
                <option>Deep desert night</option>
              </select>
            </label>
            <label>
              <span>Feeling</span>
              <select name="feeling" defaultValue="">
                <option value="" disabled>Select a feeling</option>
                <option>Quiet</option>
                <option>Wild</option>
                <option>Warm</option>
                <option>Lasting</option>
              </select>
            </label>
            <label>
              <span>Presence</span>
              <select name="presence" defaultValue="">
                <option value="" disabled>Select presence</option>
                <option>Soft and close</option>
                <option>Clean and moving</option>
                <option>Warm and intimate</option>
                <option>Deep and memorable</option>
              </select>
            </label>
          </div>

          <div className="diagnostic-form__panel">
            <p className="eyebrow">02 / Notes</p>
            {noteGroups.map((group) => (
              <label key={group.id}>
                <span>{group.label}</span>
                <select name={group.id} defaultValue="">
                  <option value="" disabled>Choose {group.label.toLowerCase()}</option>
                  {group.options.map((option) => <option key={option}>{option}</option>)}
                </select>
                <small>{group.helper}</small>
              </label>
            ))}
          </div>

          <div className="diagnostic-form__panel">
            <p className="eyebrow">03 / Wear</p>
            <label>
              <span>For</span>
              <select name="for" defaultValue="">
                <option value="" disabled>Select wearer</option>
                <option>Self</option>
                <option>Gift</option>
                <option>Shared ritual</option>
              </select>
            </label>
            <label>
              <span>Texture</span>
              <select name="texture" defaultValue="">
                <option value="" disabled>Select texture</option>
                <option>Clean</option>
                <option>Floral</option>
                <option>Woody</option>
                <option>Ambered</option>
              </select>
            </label>
            <div className="diagnostic-actions">
              <button type="submit">Find your fragrance</button>
              <Link href="/shop/fragrances">View fragrances</Link>
            </div>
          </div>
        </form>
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

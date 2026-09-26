import { LineReveal, Reveal } from "@/components/Reveal";
import DiagnosticForm from "@/components/DiagnosticForm";

export const metadata = { title: "Diagnostic", description: "Find your Rimara fragrance." };

export default function DiagnosticPage() {
  return (
    <main>
      <section className="page-hero diagnostic-hero">
        <div>
          {/* <p className="eyebrow">Find Your Air</p> */}
          <h1><LineReveal>Begin with a feeling.</LineReveal></h1>
        </div>
        <Reveal>
          <p className="body-copy-large">A quiet diagnostic for the hour, mood and notes that feel closest to you.</p>
          <p className="body-copy">Choose instinctively. Fragrance is often understood by skin before it is explained by language.</p>
        </Reveal>
      </section>

      <DiagnosticForm />
    </main>
  );
}

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Rimara — care@rimara.ae, IFZA Business Park, Silicon Oasis, Dubai, U.A.E.",
};

export default function ContactPage() {
  return (
    <main className="tc-page">
      <div className="tc-container">

        {/* ── Page Title ── */}
        <header className="tc-page-header">
          <p className="tc-kicker">Get in Touch</p>
          <h1 className="tc-title">Contact Us</h1>
        </header>

        {/* ── Contact Details ── */}
        <div className="tc-preamble">
          <p>
            &ldquo;rimara PARFUMS&rdquo; is a registered trademark of Sillage FZCO. For any
            enquiries, please reach out to us using the details below.
          </p>
        </div>

        <div className="tc-section">
          <h2 className="tc-section-title">Address</h2>
          <p>Sillage FZCO</p>
          <p>IFZA Business Park, Silicon Oasis</p>
          <p>Dubai, U.A.E.</p>
        </div>

        <div className="tc-section">
          <h2 className="tc-section-title">Email</h2>
          <p>
            <a className="tc-contact-link" href="mailto:care@rimara.ae">care@rimara.ae</a>
          </p>
        </div>

      </div>
    </main>
  );
}

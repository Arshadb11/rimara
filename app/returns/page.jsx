export const metadata = {
  title: "Returns, Refunds & Cancellations",
  description: "Returns, refunds and cancellations policy for rimara.ae orders.",
};

const sections = [
  {
    title: "Returns",
    content: [
      "Any return request must be reported via emailing us at care@rimara.ae within 7 calendar days from (and including) the date of delivery.",
      "Returns will ONLY be accepted in the following cases:",
    ],
    numbered: [
      { text: "Wrong item was received" },
      { text: "Damaged product was received" },
      { text: "Defective item was received" },
    ],
    afterNumbered: [
      "Returned items MUST be:",
    ],
    secondNumbered: [
      { text: "Unopened and unused" },
      { text: "Sealed and in its original packaging" },
    ],
    footer: [
      "To process the request, customers MUST provide:",
    ],
    thirdNumbered: [
      { text: "Order number" },
      { text: "Photos/videos of the product" },
      { text: "Clear description/details of the issue" },
    ],
    closing: [
      "Please note that opened, sprayed, and/or used perfumes are legally and customarily non-refundable for health and hygiene reasons.",
    ],
  },
  {
    title: "Refunds",
    content: [
      "Refunds will only be processed after inspection and approval of the returned item, compliant to the conditions stipulated above.",
      "Approved refunds will be issued via a credit back to the original payment method and can take 7–14 business days to reflect on your statement depending on your issuing bank or payment provider processing timelines.",
      "We reserve the right to reject a request for refund if the returned product does not meet the conditions stipulated above.",
    ],
  },
  {
    title: "Cancellations",
    content: [
      "Customers may cancel their order only if the order has not been processed at our end. To do so, we require the customer to contact care@rimara.ae with their order details within 24 hours from order placement. We cannot guarantee any cancellation if not notified to us immediately and/or once the order has already been processed.",
    ],
  },
];

export default function ReturnsPage() {
  return (
    <main className="tc-page">
      <div className="tc-container">

        {/* ── Page Title ── */}
        <header className="tc-page-header">
          <h1 className="tc-title">Returns, Refunds &amp; Cancellations</h1>
          
        </header>

        {/* ── Preamble / Promise ── */}
        <div className="tc-preamble">
          <p className="tc-kicker">Our Promise</p>
          <p>
            rimara.ae promises to sell you only 100% genuine products and hopes that you will be
            delighted with your order.
          </p>
        </div>

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.title} className="tc-section">
            <h2 className="tc-section-title">{section.title}</h2>

            {section.content?.map((p, i) => (
              <p key={i}>{p === "Returns will ONLY be accepted in the following cases:" ? <strong>{p}</strong> : p}</p>
            ))}

            {section.numbered && (
              <ol className="tc-list tc-list--numbered">
                {section.numbered.map((item, i) => <li key={i}>{item.text}</li>)}
              </ol>
            )}

            {section.afterNumbered?.map((p, i) => (
              <p key={`after-${i}`}>{p === "Returned items MUST be:" ? <strong>{p}</strong> : p}</p>
            ))}

            {section.secondNumbered && (
              <ol className="tc-list tc-list--numbered">
                {section.secondNumbered.map((item, i) => <li key={i}>{item.text}</li>)}
              </ol>
            )}

            {section.footer?.map((p, i) => (
              <p key={`footer-${i}`}>{p === "To process the request, customers MUST provide:" ? <strong>{p}</strong> : p}</p>
            ))}

            {section.thirdNumbered && (
              <ol className="tc-list tc-list--numbered">
                {section.thirdNumbered.map((item, i) => <li key={i}>{item.text}</li>)}
              </ol>
            )}

            {section.closing?.map((p, i) => <p key={`closing-${i}`}>{p}</p>)}
          </div>
        ))}

      </div>
    </main>
  );
}

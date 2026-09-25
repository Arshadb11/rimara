export const metadata = {
  title: "Safe & Secure Delivery",
  description: "Delivery policy for rimara.ae — shipping timelines, fees, and tracking information.",
};

const sections = [
  {
    title: "Delivery Fees",
    content: [
      "rimara.ae offers swift and complimentary delivery within the U.A.E. for all customer orders above AED 100.",
      "For customer orders under AED 100, a nominal delivery fee of AED 10 per order will be applicable. Delivery fee will be displayed and charged during the check-out and payment process.",
    ],
  },
  {
    title: "Processing & Delivery Timelines",
    content: [
      "Orders are processed within 2 business days post order placement and will be delivered to the customer within 5 business days post payment confirmation. Delivery timelines may vary depending on the destination, weather conditions and/or any factor beyond our normal control.",
    ],
  },
  {
    title: "Shipping Information",
    content: [
      "Customers are responsible for providing accurate shipping information including full address, contact number, and recipient details. We are not responsible for delays, failed deliveries, or additional charges caused by incorrect or incomplete delivery information.",
    ],
  },
  {
    title: "Order Tracking",
    content: [
      "Once the order has been shipped, customers may receive tracking details through email, if a valid email address was provided during the ordering process.",
    ],
  },
];

export default function DeliveryPage() {
  return (
    <main className="tc-page">
      <div className="tc-container">

        {/* ── Page Title ── */}
        <header className="tc-page-header">
          {/* <p className="tc-kicker">Shipping</p> */}
          <h1 className="tc-title">Safe &amp; Secure Delivery</h1>
        </header>

        {/* ── Preamble ── */}
        <div className="tc-preamble">
          <p>
            rimara.ae is committed to delivering your order safely and on time. Please review
            our delivery terms below before placing your order.
          </p>
        </div>

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.title} className="tc-section">
            <h2 className="tc-section-title">{section.title}</h2>
            {section.content.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        ))}

      </div>
    </main>
  );
}

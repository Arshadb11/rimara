export const metadata = {
  title: "Payments",
  description: "Payments Policy for rimara.ae — accepted methods, currency, billing and security information.",
};

const sections = [
  {
    title: "Provision of Official Documents",
    content: [
      "In an effort to increase the safety for our customers, and in line with our bank's security requirements, we may from time to time ask for a copy of a valid ID and the front side of your credit card (only if deemed necessary). This may be at the time of delivery, or at the time of order processing.",
      "We accept the following as a form of valid ID:",
    ],
    list: [
      "Emirates ID (if a U.A.E. Resident)",
      "U.A.E. driver's license",
      "Passport copy",
    ],
    footer: [
      "Failure to provide such documents upon request may lead to cancellation of the order and payment of the related charges. All information is collected lawfully and in accordance with prevailing Data Protection Laws.",
      "All credit/debit cards details or information will NOT be stored, sold, shared, rented or leased to any third parties.",
    ],
  },
  {
    title: "Security",
    content: [
      "On order processing pages we are using a security certificate. All information is encrypted. Credit/Debit Card details are not stored on the server or our company database at any time. Any sensitive information transferred is through a secure SSL connection (HTTPS) as mentioned.",
      "We will take all reasonable precautions to keep the details of your order and payment secure, but, unless we are negligent, we cannot be held liable for any losses caused as a result of unauthorized access to information provided by you.",
    ],
  },
  {
    title: "Accepted Payment Methods",
    content: [
      "We support secure online transactions through licensed payment gateways compliant with the Central Bank of the U.A.E. standards.",
      "We accept:",
    ],
    numbered: [
      { text: "Credit and Debit Cards (Visa, MasterCard, and national card schemes such as Jaywan)" },
      { text: "Apple Pay and Google Pay, where available" },
      { text: "Local digital wallets, where available" },
    ],
  },
  {
    title: "Pricing and Currency",
    content: [
      "All prices are quoted in United Arab Emirates Dirhams (AED).",
      "Prices shown on product pages are inclusive of the United Arab Emirates Value-Added Tax (VAT) of 5%, unless explicitly stated otherwise.",
      "The standard transaction currency on our e-commerce portal is also in United Arab Emirates Dirhams (AED).",
      "If you pay using a non-U.A.E. credit/debit card, your bank may apply foreign exchange conversion fees and/or international transaction charges. We are not responsible for any such external fees.",
    ],
  },
  {
    title: "Payment Authorization and Security",
    content: [
      "All online card payments are processed securely via our PCI-DSS compliant payment service provider. We do not store your full credit card or debit card details on our servers.",
      "Transactions are protected using 3D Secure (3DS) authentication. You may be prompted by your bank to complete an OTP (One-Time Password) verification step during checkout.",
      "We reserve the right to refuse or cancel any order if fraudulent activity, unauthorized transactions, or payment failures are detected.",
    ],
  },
  {
    title: "Billing Information",
    content: [
      "You must provide current, complete, and accurate billing and account information for all purchases. You agree to promptly update your account and payment details (including email address and card expiration date) so that we can complete your transactions and contact you as needed.",
    ],
  },
  {
    title: "Failed or Declined Payments",
    content: [
      "Orders may be placed on hold if either your or our bank raises concern for authentication of the transaction.",
      "If your card payment is declined, your order will not be processed. Please check with your issuing bank if you experience repeated rejections.",
    ],
  },
  {
    title: "Chargebacks",
    content: [
      "Customers are advised to contact us at care@rimara.ae to resolve billing disputes before filing a formal chargeback with their bank.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "\"rimara PARFUMS\" (rimara.ae) is a registered trademark of Sillage FZCO, and thus, all customer payments may reflect \"Sillage FZCO\" as the merchant's (Doing Business As) name on their receipt/statement/billing descriptor.",
      "If you have any questions regarding this Payments Policy or your transaction, please contact us at care@rimara.ae.",
    ],
  },
];

export default function PaymentsPage() {
  return (
    <main className="tc-page">
      <div className="tc-container">

        {/* ── Page Title ── */}
        <header className="tc-page-header">
          <p className="tc-kicker">Legal</p>
          <h1 className="tc-title">Payments</h1>
        </header>

        {/* ── Preamble ── */}
        <div className="tc-preamble">
          <p>
            This Payments Policy outlines the accepted payment methods, currency terms, and billing
            conditions for purchases made on rimara.ae. By placing an order with us, you agree to
            the terms described in this policy.
          </p>
        </div>

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.title} className="tc-section">
            <h2 className="tc-section-title">{section.title}</h2>

            {section.content?.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}

            {section.list && (
              <ul className="tc-list">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            {section.numbered && (
              <ol className="tc-list tc-list--numbered">
                {section.numbered.map((item, i) => (
                  <li key={i}>{item.text}</li>
                ))}
              </ol>
            )}

            {section.footer?.map((paragraph, i) => (
              <p key={`footer-${i}`}>{paragraph}</p>
            ))}
          </div>
        ))}

      </div>
    </main>
  );
}

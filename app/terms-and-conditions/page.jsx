export const metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for using the Rimara website, operated by Sillage FZCO.",
};

const sections = [
  {
    title: "Use of the Site",
    content: [
      "By agreeing to these T&Cs, you represent that you are at least the age of majority in your country of residence, or that you are the age of majority in your country of residence and you have given us your consent to allow any of your minor dependents to use this site.",
      "We grant you a non-transferable and revocable license to use the Site, under the T&Cs described, for the purpose of shopping for personal items sold on the Site. Commercial use or use on behalf of any third party is prohibited, except as explicitly permitted by us in advance. Any breach of these T&Cs shall result in the immediate revocation of the license granted in this paragraph without notice to you.",
      "Content provided on this site is solely for informational purposes.",
      "Certain services and related features that may be made available on the Site may require registration or subscription. Should you choose to register or subscribe for any such services or related features, you agree to provide accurate and current information about yourself, and to promptly update such information if there are any changes. Every user of the Site is solely responsible for keeping passwords and other account identifiers safe and secure. The account owner is entirely responsible for all activities that occur under such password or account. Furthermore, you must notify us of any unauthorized use of your password or account. The Site shall not be responsible or liable, directly or indirectly, in any way for any loss or damage of any kind incurred as a result of, or in connection with, your failure to comply with this section.",
      "During the registration process you agree to receive promotional emails from the Site. You can subsequently opt out of receiving such promotional e-mails by clicking on the link at the bottom of any promotional email (if available) or by notifying us of the same.",
    ],
  },
  {
    title: "User Submissions",
    content: [
      "Anything that you submit to the Site and/or provide to us, including but not limited to, questions, reviews, comments, and suggestions (collectively, \"Submissions\") will become our sole and exclusive property and shall not be returned to you. In addition to the rights applicable to any Submission, when you post comments or reviews to the Site, you also grant us the right to use the name that you submit, in connection with such review, comment, or other content.",
      "You shall not use a false e-mail address, pretend to be someone other than yourself or otherwise mislead us or third parties as to the origin of any Submissions. We may, but shall not be obligated to, remove or edit any Submissions.",
    ],
  },
  {
    title: "Accuracy of Information",
    content: [
      "rimara.ae strives to describe its products accurately and completely and provide updated information on the Site. However, rimara.ae does not warrant that product descriptions and information on the Site are complete or free from error/s.",
      "Further, you acknowledge and agree that the views expressed by you and other users as part of the Submissions do not necessarily reflect the views of rimara.ae, and we do not support or endorse any Submissions, or any other content posted by you or any other user.",
    ],
  },
  {
    title: "Order Acceptance and Pricing",
    content: [
      "Please note that there may be cases when an order cannot be processed for various reasons. The Site reserves the right to refuse or cancel any order for any reason at any given time. You may be asked to provide additional verifications or information, including but not limited to phone number and address, before we accept the order.",
      "We will endeavour to provide the most accurate pricing information on the Site to our users. However, errors may still occur, such as cases when the price, description or features of an item is not displayed correctly on the website. As such, we reserve the right to refuse or cancel any order.",
      "In the event that an item is mispriced, we may, at our own discretion, either contact you for instructions or cancel your order and notify you of such cancellation. We shall have the right to refuse or cancel any such orders whether or not the order has been confirmed and your credit card has been charged or any other means of payment has been processed.",
    ],
  },
  {
    title: "Arbitration",
    content: [
      "Any controversy, claim or dispute arising out of or relating to these T&Cs will be referred to and finally settled by private and confidential binding arbitration before a single arbitrator held in Dubai, U.A.E. in English and governed by Dubai law pursuant to the Rules of Commercial Conciliation and Arbitration of 1994 (Dubai), as amended, replaced or re-enacted from time to time.",
      "The arbitrator shall be a person who is legally trained and who has experience in the information technology field in Dubai and is independent of either party. Notwithstanding the foregoing, the Site reserves the right to pursue the protection of intellectual property rights and confidential information through injunctive or other equitable relief through the courts.",
    ],
  },
  {
    title: "Termination",
    content: [
      "In addition to any other legal or equitable remedies, we may, without prior notice to you, immediately terminate the T&Cs or revoke any or all your rights granted under the T&Cs. Upon any termination of this Agreement, you shall immediately cease all access to and use of the Site and we shall, in addition to any other legal or equitable remedies, immediately revoke all password(s) and account identification issued to you and deny your access to and use of this Site in whole or in part.",
      "Any termination of this agreement shall not affect the respective rights and obligations (including without limitation, payment obligations) of the parties arising before the date of termination. You furthermore agree that the Site shall not be liable to you or to any other person as a result of any such suspension or termination.",
      "If you are dissatisfied with the Site or with any terms, conditions, rules, policies, guidelines, or practices of Sillage FZCO in operating the Site, your sole and exclusive remedy is to discontinue using the Site.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="tc-page">
      <div className="tc-container">
        {/* ── Page Title ── */}
        <header className="tc-page-header">
          <p className="tc-kicker">Legal</p>
          <h1 className="tc-title">Terms &amp; Conditions</h1>
        </header>

        {/* ── Preamble ── */}
        <div className="tc-preamble">
          <p>
            Welcome to the rimara.ae website (&ldquo;Site&rdquo;). These Terms and Conditions
            (&ldquo;T&amp;Cs&rdquo;) apply to the Site, which is operated and administered by
            Sillage FZCO and all its divisions, subsidiaries, and affiliate operated Internet
            sites which reference these T&amp;Cs.
          </p>
          <p>
            By accessing the Site, you confirm your understanding of the T&amp;Cs. If you do not
            agree to these T&amp;Cs of use, you shall not use this Site. The Site reserves the
            right, to change, modify, add, or remove portions of these T&amp;Cs of use at any
            time. Changes will be effective when posted on the Site with no other notice provided.
            Please check these T&amp;Cs of use regularly for updates. Your continued use of the
            Site following the posting of changes to these T&amp;Cs of use constitutes your
            acceptance of those changes.
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

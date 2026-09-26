export const metadata = {
  title: "Limitation of Liability & Disclaimers",
  description: "Limitation of liability, disclaimers, site security and user agreement for rimara.ae.",
};

const sections = [
  {
    title: "Limitation of Liability",
    content: [
      "The Site is provided without any warranties or guarantees and in an \"as-is\" condition. You must bear the risks associated with the use of the Site.",
      "The Site provides content from other Internet sites or resources and while rimara.ae tries to ensure that material included on the Site is correct, reputable and of high quality, it cannot accept responsibility if this is not the case. rimara.ae will not be responsible for any errors or omissions or for the results obtained from the use of such information or for any technical problems you may experience with the Site.",
      "To the fullest extent permitted under applicable law, rimara.ae will not be liable for any indirect, incidental, special, incidental, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses arising out of or in connection with the Site, its services or this User Agreement.",
    ],
  },
  {
    title: "User Agreement",
    content: [
      "Without prejudice to the generality of the section above, the total liability of rimara.ae to you for all liabilities arising out of this User Agreement be it in tort or contract is limited to the value of the product ordered by you. rimara.ae, its associates and technology partners make no representations or warranties about the accuracy, reliability, completeness, correctness and/or timeliness of any content, information, software, text, graphics, links or communications provided on or through the use of the Site or that the operation of the Site will be error free and/or uninterrupted.",
      "Consequently, rimara.ae assumes no liability whatsoever for any monetary or other damage suffered by you on account of the delay, failure, interruption, or corruption of any data or other information transmitted in connection with use of the Site; and/or any interruption or errors in the operation of the Site.",
    ],
  },
  {
    title: "Site Security",
    content: [
      "You are prohibited from violating or attempting to violate the security of the Site, including, without limitation:",
    ],
    list: [
      "Accessing data not intended for you or logging onto a server or an account which you are not authorized to access.",
      "Attempting to probe, scan or test the vulnerability of a system or network or to breach security or authentication measures without proper authorization.",
      "Attempting to interfere with service to any other user, host, or network, including, without limitation, via means of submitting a virus to the Site, overloading, \"flooding,\" \"spamming,\" \"mail bombing\" or \"crashing\".",
      "Sending unsolicited email, including promotions and/or advertising of products or services.",
      "Forging any TCP/IP packet header or any part of the header information in any email or newsgroup posting. Violations of system or network security may result in civil or criminal liability.",
    ],
    footer: [
      "rimara.ae will investigate occurrences that may involve such violations and may involve, and cooperate with, law enforcement authorities in prosecuting users who are involved in such violations.",
      "You agree not to use any device, software, or routine to interfere or attempt to interfere with the proper working of this Site or any activity being conducted on this Site. You agree, further, not to use or attempt to use any engine, software, tool, agent or other device or mechanism (including without limitation browsers, spiders, robots, avatars, or intelligent agents) to navigate or search this Site other than the search engine and search agents available from rimara.ae on this Site and other than generally available third-party web browsers (example: Google Chrome, Microsoft Explorer).",
      "rimara.ae and their respective publishers, authors, agents, and employees have done their best to ensure the accuracy and currency of all the information on this website contributed by them; however, they accept no responsibility for any loss, injury, or damages sustained by anyone as a result of information or advice contained on the site. The use of information derived from the Site is at the user's own risk.",
      "rimara.ae and their respective publishers, authors, agents and employees disclaim all warranties and conditions with regard to this internet site and the information contained therein, including, without limitation, all implied warranties and conditions of merchantability, fitness for a particular purpose, title, and non-infringement. In no event shall rimara.ae and their respective publishers, authors, agents and employees, be liable for any special, indirect, or consequential damages or any damages whatsoever whether in an action of contract, negligence, or other tortuous action, arising out of or in connection with the use or performance of this internet site or of the information and documents contained therein, provision of or failure to provide services, or any other information directly or indirectly available from this website. The documents and related graphics published on this website could include technical inaccuracies or typographical errors.",
      "Changes are periodically added to the information herein. rimara.ae may make improvements and/or changes in the product(s) described herein at any time. The linked sites are not under the control of rimara.ae and their respective employees are not responsible for the contents of any linked site, or any link contained in a linked site. rimara.ae is providing these external links to you only as a convenience, and the inclusion of any link does not imply endorsement by rimara.ae of the site.",
      "All views expressed by individuals on this site are their personal opinions and are not necessarily those of or endorsed by rimara.ae.",
    ],
  },
  {
    title: "Entire Agreement",
    content: [
      "If any part of this agreement is determined to be invalid or unenforceable pursuant to applicable law including, but not limited to, the warranty disclaimers and liability limitations set forth above, then the invalid or unenforceable provision will be deemed to be superseded by a valid, enforceable provision that most closely matches the intent of the original provision and the remainder of the agreement shall continue in effect.",
      "Unless otherwise specified herein, this agreement constitutes the entire agreement between you and rimara.ae with respect to the Site and it supersedes all prior or contemporaneous communications and proposals, whether electronic, oral or written. rimara.ae's failure to act with respect to a breach by you or others does not waive its right to act with respect to subsequent or similar breaches.",
    ],
  },
];

export default function LiabilityPage() {
  return (
    <main className="tc-page">
      <div className="tc-container">

        {/* ── Page Title ── */}
        <header className="tc-page-header">
          {/* <p className="tc-kicker">Legal</p> */}
          <h1 className="tc-title">Limitation of Liability &amp; Disclaimers</h1>
        </header>

        {/* ── Sections ── */}
        {sections.map((section) => (
          <div key={section.title} className="tc-section">
            <h2 className="tc-section-title">{section.title}</h2>

            {section.content?.map((p, i) => <p key={i}>{p}</p>)}

            {section.list && (
              <ul className="tc-list">
                {section.list.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}

            {section.footer?.map((p, i) => <p key={`footer-${i}`}>{p}</p>)}
          </div>
        ))}

      </div>
    </main>
  );
}

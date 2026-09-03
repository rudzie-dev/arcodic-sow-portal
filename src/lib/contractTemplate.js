// Master Statement-of-Work / Service Agreement template.
//
// Terms are locked per the Arcodic build brief and should only change with
// Rudz's sign-off (and eventual attorney review) — treat the wording below
// as the content source, not final legal copy. Admins can still edit the
// generated text per-project before sending (sow_documents.content is a
// plain editable string).
import { TIER_LABELS, defaultSupportWindowDays } from './stages';

const money = (amount, currency) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(
    Number(amount || 0)
  );

const today = () =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Fill the master template with a project + client + business's details.
 * @param {{name:string,business_name?:string,email:string}} client
 * @param {{name:string,tier:string,price:number,currency:string,support_window_days?:number}} project
 * @param {{business_name?:string,business_email?:string,business_address?:string}} business
 */
export function generateContract({ client, project, business = {} }) {
  const deposit = money((project.price || 0) / 2, project.currency);
  const balance = money((project.price || 0) / 2, project.currency);
  const total = money(project.price || 0, project.currency);
  const supportDays = project.support_window_days || defaultSupportWindowDays(project.tier);
  const businessName = business.business_name || 'Arcodic';

  return `STATEMENT OF WORK & SERVICE AGREEMENT
${businessName}

Agreement Date: ${today()}

BETWEEN
${businessName} ("Arcodic", "the Provider")
${business.business_email ? business.business_email + '\n' : ''}${business.business_address || ''}

AND
${client.business_name || client.name} ("the Client")
${client.name}${client.email ? ' · ' + client.email : ''}

────────────────────────────────────────
1. PROJECT
────────────────────────────────────────
Project Name: ${project.name}
Tier: ${TIER_LABELS[project.tier] || project.tier}
Total Project Fee: ${total} (${project.currency || 'USD'})

────────────────────────────────────────
2. PAYMENT TERMS
────────────────────────────────────────
50% deposit due upfront before work begins: ${deposit}
50% balance due on completion, before final handover: ${balance}
No deliverables or source files are released prior to receipt of the full and final payment.

────────────────────────────────────────
3. REVISIONS
────────────────────────────────────────
This engagement includes 2 rounds of revisions. Additional revision rounds beyond this
allowance will be quoted and billed separately.

────────────────────────────────────────
4. POST-LAUNCH SUPPORT
────────────────────────────────────────
Arcodic provides a free bug-fix window of ${supportDays} days following delivery, covering
defects in the delivered work. This window does not cover new features, content changes,
or issues introduced by third-party edits after handover.

────────────────────────────────────────
5. INTELLECTUAL PROPERTY & OWNERSHIP
────────────────────────────────────────
Full ownership of the final deliverables transfers to the Client upon receipt of full and
final payment. Arcodic retains the right to reuse general components, patterns, and
techniques developed during this engagement, and to showcase the completed work in its
portfolio, unless the Client opts out of portfolio use in writing.

────────────────────────────────────────
6. CANCELLATION
────────────────────────────────────────
The deposit is non-refundable once work has begun. If the Client cancels the engagement
after more than 50% of the work is complete, the Client agrees to pay for the percentage
of work completed at the time of cancellation.

────────────────────────────────────────
7. ACCEPTANCE
────────────────────────────────────────
By signing below, both parties agree to the terms of this Statement of Work.

Arcodic: ___________________________   Date: ___________
Client:  ___________________________   Date: ___________
`;
}

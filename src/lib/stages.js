// Internal pipeline stages (admin-only — never rendered on the client side).
export const INTERNAL_STAGES = [
  'lead',
  'discovery',
  'quote_sent',
  'contract_sent',
  'signed',
  'deposit_due',
  'in_progress',
  'delivered',
  'support',
  'cancelled',
];

export const INTERNAL_STAGE_LABELS = {
  lead: 'Lead',
  discovery: 'Discovery',
  quote_sent: 'Quote Sent',
  contract_sent: 'Contract Sent',
  signed: 'Signed',
  deposit_due: 'Deposit Due',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  support: 'Support',
  cancelled: 'Cancelled',
};

// The only 5 stages a client is ever allowed to see. Every internal stage
// maps onto one of these — see stageToClientIndex().
export const CLIENT_STAGES = ['Contract', 'Deposit', 'In Progress', 'Delivered', 'Support'];

const CLIENT_INDEX_BY_INTERNAL = {
  lead: 0,
  discovery: 0,
  quote_sent: 0,
  contract_sent: 0,
  signed: 1,
  deposit_due: 1,
  in_progress: 2,
  delivered: 3,
  support: 4,
  cancelled: 0,
};

// Index (0-4) into CLIENT_STAGES for the given internal project stage.
export function stageToClientIndex(internalStage) {
  return CLIENT_INDEX_BY_INTERNAL[internalStage] ?? 0;
}

export const TIER_LABELS = {
  landing: 'Landing Page',
  starter: 'Starter Site',
  business: 'Business Site',
  custom: 'Custom',
};

// Post-launch free bug-fix window, per the locked contract terms.
export function defaultSupportWindowDays(tier) {
  return tier === 'business' || tier === 'custom' ? 30 : 14;
}

export function stageBadgeTone(stage) {
  if (stage === 'delivered' || stage === 'support') return 'good';
  if (stage === 'cancelled') return 'danger';
  if (stage === 'lead' || stage === 'discovery' || stage === 'quote_sent') return 'neutral';
  return 'warn';
}

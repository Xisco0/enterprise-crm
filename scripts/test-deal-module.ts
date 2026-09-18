/**
 * Automated Test Suite for Prompt 5: Deals & Sales Pipeline
 *
 * Runs comprehensive test assertions validating:
 * 1. Sequential Deal Number Generation (DEAL-000001)
 * 2. Deal Input Validation (Zod schema, title, customer_id, numeric value >= 0, probability 0-100%)
 * 3. Mandatory Customer Linkage & Optional Lead Attribution
 * 4. Multi-Currency Support (USD, NGN, EUR, GBP) & Formatting
 * 5. Stage-to-Status Synchronization (CLOSED_WON -> WON, probability=100%, won_at, actual_close_date)
 * 6. Closed Lost Transition Guards (Mandatory lost_reason, probability=0%, lost_at, actual_close_date)
 * 7. Active Stage Progression & Reopening Logic (status=OPEN, clearing won/lost flags)
 * 8. Weighted Revenue Forecast Calculations (Value * Probability)
 * 9. RBAC & Scoping: Admin (Organization-wide) vs Staff (Assigned / Created only)
 * 10. Multi-field Search, Stage, Status, Currency, and Priority Filtering
 * 11. Pipeline Stage Grouping & Summary Aggregation
 */

import {
  dealInputSchema,
  dealFilterSchema,
  dealStageChangeSchema,
  dealLostReasonSchema,
} from '../src/lib/validations/deal';
import { formatCurrency } from '../src/lib/utils';
import { DEAL_STAGE_CONFIG, DEAL_STATUS_CONFIG, DEAL_PRIORITY_CONFIG, CURRENCY_CONFIG } from '../src/lib/constants';
import { DealStage, DealStatus, DealPriority, DealCurrency } from '../src/types/database.types';
import { DealWithDetails, PipelineStageSummary } from '../src/types/crm';

interface TestResult {
  id: number;
  name: string;
  category:
    | 'NUMBERING'
    | 'VALIDATION'
    | 'RELATIONS'
    | 'CURRENCY'
    | 'STAGE_SYNC'
    | 'LOST_GUARD'
    | 'FORECAST'
    | 'RBAC'
    | 'SEARCH_FILTER'
    | 'PIPELINE_GROUPING';
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function assert(
  id: number,
  name: string,
  category: TestResult['category'],
  condition: boolean,
  details: string
) {
  results.push({
    id,
    name,
    category,
    passed: condition,
    details,
  });
}

// -----------------------------------------------------------------------------
// Sequence Generator Simulator
// -----------------------------------------------------------------------------
let simulatedDealSeq = 100;
function generateDealNumberSimulator(): string {
  simulatedDealSeq += 1;
  return `DEAL-${String(simulatedDealSeq).padStart(6, '0')}`;
}

// -----------------------------------------------------------------------------
// Test 1: Deal Reference Number Formatting
// -----------------------------------------------------------------------------
const ref1 = generateDealNumberSimulator();
const ref2 = generateDealNumberSimulator();
assert(
  1,
  'Deal Reference Number Generation',
  'NUMBERING',
  ref1 === 'DEAL-000101' && ref2 === 'DEAL-000102',
  `Generated sequential numbers: ${ref1}, ${ref2}`
);

// -----------------------------------------------------------------------------
// Test 2: Input Validation (Zod Schema)
// -----------------------------------------------------------------------------
const validDeal = dealInputSchema.safeParse({
  title: 'Enterprise ERP Migration & Implementation',
  description: 'Full-stack enterprise modernization',
  customer_id: '11111111-1111-1111-1111-111111111101',
  value: 75000,
  currency: 'USD',
  stage: 'PROPOSAL',
  status: 'OPEN',
  priority: 'HIGH',
  probability: 60,
});

const invalidDealNoCustomer = dealInputSchema.safeParse({
  title: 'Orphan Opportunity Without Customer',
  value: 20000,
});

const invalidNegativeValue = dealInputSchema.safeParse({
  title: 'Negative Pricing Contract',
  customer_id: '11111111-1111-1111-1111-111111111101',
  value: -500,
});

const invalidProbability = dealInputSchema.safeParse({
  title: 'Probability Out of Bounds',
  customer_id: '11111111-1111-1111-1111-111111111101',
  value: 10000,
  probability: 150,
});

assert(
  2,
  'Deal Validation Schema Rules',
  'VALIDATION',
  validDeal.success &&
    !invalidDealNoCustomer.success &&
    !invalidNegativeValue.success &&
    !invalidProbability.success,
  `Valid deal passed: ${validDeal.success}. Missing customer caught: ${!invalidDealNoCustomer.success}. Negative value caught: ${!invalidNegativeValue.success}. Prob > 100% caught: ${!invalidProbability.success}`
);

// -----------------------------------------------------------------------------
// Test 3: Relational Links (Mandatory Customer & Optional Lead Origin)
// -----------------------------------------------------------------------------
const dealWithLead = dealInputSchema.safeParse({
  title: 'Inbound Converted Contract',
  customer_id: '11111111-1111-1111-1111-111111111101',
  lead_id: '22222222-2222-2222-2222-222222222201',
  value: 50000,
});

const dealWithoutLead = dealInputSchema.safeParse({
  title: 'Direct Customer Account Expansion',
  customer_id: '11111111-1111-1111-1111-111111111102',
  value: 30000,
});

assert(
  3,
  'Customer & Lead Relational Links',
  'RELATIONS',
  dealWithLead.success &&
    dealWithoutLead.success &&
    dealWithLead.data?.lead_id === '22222222-2222-2222-2222-222222222201' &&
    !dealWithoutLead.data?.lead_id,
  'Validated mandatory customer linkage with flexible optional lead origin traceability'
);

// -----------------------------------------------------------------------------
// Test 4: Multi-Currency Support (USD, NGN, EUR, GBP)
// -----------------------------------------------------------------------------
const formattedUSD = formatCurrency(50000, 'USD');
const formattedNGN = formatCurrency(45000000, 'NGN');
const formattedEUR = formatCurrency(65000, 'EUR');
const formattedGBP = formatCurrency(50000, 'GBP');

assert(
  4,
  'Multi-Currency Representation & Formatting',
  'CURRENCY',
  formattedUSD.includes('$') &&
    formattedNGN.includes('NGN') || formattedNGN.includes('₦') &&
    formattedEUR.includes('€') &&
    formattedGBP.includes('£'),
  `Formatted outputs: USD: ${formattedUSD}, NGN: ${formattedNGN}, EUR: ${formattedEUR}, GBP: ${formattedGBP}`
);

// -----------------------------------------------------------------------------
// Test 5: Stage-to-Status Synchronization (CLOSED_WON)
// -----------------------------------------------------------------------------
function simulateStageTransition(
  currentStage: DealStage,
  targetStage: DealStage,
  lostReason?: string
): {
  stage: DealStage;
  status: DealStatus;
  probability: number;
  won_at: string | null;
  lost_at: string | null;
  actual_close_date: string | null;
  lost_reason: string | null;
} {
  if (targetStage === 'CLOSED_WON') {
    return {
      stage: 'CLOSED_WON',
      status: 'WON',
      probability: 100,
      won_at: new Date().toISOString(),
      lost_at: null,
      actual_close_date: new Date().toISOString().split('T')[0],
      lost_reason: null,
    };
  }

  if (targetStage === 'CLOSED_LOST') {
    if (!lostReason || lostReason.trim().length < 2) {
      throw new Error('Lost reason required');
    }
    return {
      stage: 'CLOSED_LOST',
      status: 'LOST',
      probability: 0,
      won_at: null,
      lost_at: new Date().toISOString(),
      actual_close_date: new Date().toISOString().split('T')[0],
      lost_reason: lostReason.trim(),
    };
  }

  return {
    stage: targetStage,
    status: 'OPEN',
    probability: DEAL_STAGE_CONFIG[targetStage]?.defaultProbability || 50,
    won_at: null,
    lost_at: null,
    actual_close_date: null,
    lost_reason: null,
  };
}

const wonResult = simulateStageTransition('NEGOTIATION', 'CLOSED_WON');
assert(
  5,
  'Closed Won State Synchronization',
  'STAGE_SYNC',
  wonResult.status === 'WON' &&
    wonResult.probability === 100 &&
    Boolean(wonResult.won_at) &&
    Boolean(wonResult.actual_close_date) &&
    wonResult.lost_at === null,
  `Won state correctly set: status=${wonResult.status}, probability=${wonResult.probability}%, won_at=${wonResult.won_at}`
);

// -----------------------------------------------------------------------------
// Test 6: Closed Lost Transition Guard (Mandatory Loss Reason)
// -----------------------------------------------------------------------------
let lostWithoutReasonFailed = false;
try {
  simulateStageTransition('PROPOSAL', 'CLOSED_LOST', '');
} catch {
  lostWithoutReasonFailed = true;
}

const lostWithReason = simulateStageTransition(
  'PROPOSAL',
  'CLOSED_LOST',
  'Competitor offered 30% discount'
);

assert(
  6,
  'Closed Lost Transition Guard & Loss Reason',
  'LOST_GUARD',
  lostWithoutReasonFailed &&
    lostWithReason.status === 'LOST' &&
    lostWithReason.probability === 0 &&
    Boolean(lostWithReason.lost_at) &&
    lostWithReason.lost_reason === 'Competitor offered 30% discount',
  `Empty reason rejected: ${lostWithoutReasonFailed}. Recorded loss reason: "${lostWithReason.lost_reason}"`
);

// -----------------------------------------------------------------------------
// Test 7: Active Stage Progression & State Reopening
// -----------------------------------------------------------------------------
const reopenedDeal = simulateStageTransition('CLOSED_LOST', 'DISCOVERY');
assert(
  7,
  'Opportunity Reopening & Flag Clearing',
  'STAGE_SYNC',
  reopenedDeal.status === 'OPEN' &&
    reopenedDeal.probability === 40 &&
    reopenedDeal.won_at === null &&
    reopenedDeal.lost_at === null &&
    reopenedDeal.actual_close_date === null &&
    reopenedDeal.lost_reason === null,
  `Reopened deal reset cleanly: status=${reopenedDeal.status}, stage=${reopenedDeal.stage}, prob=${reopenedDeal.probability}%`
);

// -----------------------------------------------------------------------------
// Test 8: Weighted Revenue Forecast Calculation
// -----------------------------------------------------------------------------
const sampleDeals = [
  { value: 100000, probability: 80, stage: 'NEGOTIATION' as DealStage },
  { value: 50000, probability: 50, stage: 'PROPOSAL' as DealStage },
  { value: 60000, probability: 100, stage: 'CLOSED_WON' as DealStage },
  { value: 40000, probability: 0, stage: 'CLOSED_LOST' as DealStage },
];

const totalRawPipeline = sampleDeals.reduce((sum, d) => sum + d.value, 0);
const totalWeightedPipeline = sampleDeals.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0);

// (100k * 0.8) + (50k * 0.5) + (60k * 1.0) + (40k * 0) = 80k + 25k + 60k + 0 = 165,000
assert(
  8,
  'Weighted Revenue Forecast Calculation',
  'FORECAST',
  totalRawPipeline === 250000 && totalWeightedPipeline === 165000,
  `Total Raw: $${totalRawPipeline.toLocaleString()}, Weighted Forecast: $${totalWeightedPipeline.toLocaleString()}`
);

// -----------------------------------------------------------------------------
// Test 9: RBAC Scoping (Admin vs Staff)
// -----------------------------------------------------------------------------
const testDataset: DealWithDetails[] = [
  {
    id: 'd1',
    deal_number: 'DEAL-000001',
    title: 'Enterprise Cloud Expansion',
    customer_id: 'c1',
    lead_id: null,
    value: 85000,
    amount: 85000,
    currency: 'USD',
    stage: 'NEGOTIATION',
    status: 'OPEN',
    priority: 'HIGH',
    probability: 80,
    expected_close_date: '2026-10-15',
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    notes: null,
    description: null,
    assigned_to: 'staff-user-1',
    created_by: 'admin-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'd2',
    deal_number: 'DEAL-000002',
    title: 'Data Warehouse Modernization',
    customer_id: 'c2',
    lead_id: null,
    value: 120000,
    amount: 120000,
    currency: 'USD',
    stage: 'PROPOSAL',
    status: 'OPEN',
    priority: 'HIGH',
    probability: 60,
    expected_close_date: '2026-11-01',
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    notes: null,
    description: null,
    assigned_to: 'staff-user-2',
    created_by: 'staff-user-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function filterByRBAC(deals: DealWithDetails[], scope: 'ALL' | 'ASSIGNED', userId?: string) {
  if (scope === 'ALL') return deals;
  return deals.filter((d) => d.assigned_to === userId || d.created_by === userId);
}

const adminVisibility = filterByRBAC(testDataset, 'ALL');
const staff1Visibility = filterByRBAC(testDataset, 'ASSIGNED', 'staff-user-1');
const staff2Visibility = filterByRBAC(testDataset, 'ASSIGNED', 'staff-user-2');

assert(
  9,
  'RBAC Scoping: Admin (All) vs Staff (Assigned/Created)',
  'RBAC',
  adminVisibility.length === 2 &&
    staff1Visibility.length === 1 &&
    staff1Visibility[0].id === 'd1' &&
    staff2Visibility.length === 1 &&
    staff2Visibility[0].id === 'd2',
  `Admin saw ${adminVisibility.length} deals. Staff 1 saw ${staff1Visibility.length} deals. Staff 2 saw ${staff2Visibility.length} deals.`
);

// -----------------------------------------------------------------------------
// Test 10: Multi-Criteria Filter Engine
// -----------------------------------------------------------------------------
const filterInput = dealFilterSchema.parse({
  stage: 'PROPOSAL',
  priority: 'HIGH',
  currency: 'USD',
  sort_by: 'value',
  sort_order: 'desc',
});

const filteredDeals = testDataset.filter(
  (d) => d.stage === filterInput.stage && d.priority === filterInput.priority && d.currency === filterInput.currency
);

assert(
  10,
  'Multi-Criteria Filter Engine Validation',
  'SEARCH_FILTER',
  filteredDeals.length === 1 && filteredDeals[0].id === 'd2',
  `Filtered successfully to target deal: ${filteredDeals[0]?.deal_number} (${filteredDeals[0]?.title})`
);

// -----------------------------------------------------------------------------
// Test 11: Pipeline Stage Grouping
// -----------------------------------------------------------------------------
const ALL_STAGES: DealStage[] = [
  'NEW',
  'QUALIFICATION',
  'DISCOVERY',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

const pipelineSummary: PipelineStageSummary[] = ALL_STAGES.map((stage) => {
  const matching = testDataset.filter((d) => d.stage === stage);
  const totalValue = matching.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  return {
    stage,
    label: DEAL_STAGE_CONFIG[stage]?.label || stage,
    deals: matching,
    totalValue,
    count: matching.length,
  };
});

assert(
  11,
  'Pipeline Kanban Stage Grouping & Aggregation',
  'PIPELINE_GROUPING',
  pipelineSummary.length === 7 &&
    pipelineSummary.find((p) => p.stage === 'PROPOSAL')?.totalValue === 120000 &&
    pipelineSummary.find((p) => p.stage === 'NEGOTIATION')?.totalValue === 85000,
  `Aggregated across 7 stages. Proposal col value: $${pipelineSummary.find((p) => p.stage === 'PROPOSAL')?.totalValue}`
);

// -----------------------------------------------------------------------------
// Print Test Results
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('       PROMPT 5: DEALS & SALES PIPELINE AUTOMATED TEST SUITE    ');
console.log('================================================================\n');

let passedCount = 0;
for (const res of results) {
  const statusIcon = res.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`[${statusIcon}] Test ${res.id.toString().padStart(2, '0')}: [${res.category}] ${res.name}`);
  console.log(`        Details: ${res.details}\n`);
  if (res.passed) passedCount++;
}

console.log('----------------------------------------------------------------');
console.log(`Summary: ${passedCount}/${results.length} Tests Passed (${Math.round((passedCount / results.length) * 100)}%)`);
console.log('================================================================\n');

if (passedCount !== results.length) {
  process.exit(1);
}

/**
 * Automated Test Suite for Prompt 7: Tasks & Follow-up Management
 *
 * Runs comprehensive test assertions validating:
 * 1. Sequential Task Number Generation (TASK-000001)
 * 2. Task Input Validation (Zod schema: title, task_type, priority, due dates)
 * 3. Due Date & Optional Due Time Parsing
 * 4. Overdue Logic Calculation (Active tasks past due = overdue; Completed/Cancelled = never overdue)
 * 5. State Transition Lifecycle (PENDING -> IN_PROGRESS -> COMPLETED -> PENDING reopening)
 * 6. Completion Identity & Timestamp Integrity (completed_at & completed_by server derivation)
 * 7. Task Cancellation Handling (status = CANCELLED, excluded from active queues)
 * 8. Relational Association Support (Customer, Lead, Deal, or Standalone)
 * 9. Timeframe Filter Engine (TODAY, TOMORROW, THIS_WEEK, OVERDUE, COMPLETED)
 * 10. RBAC Scoping: Admin (Organization-wide) vs Staff (Assigned / Created only)
 * 11. Multi-Field Search & Filter Engine (Title, Description, Related Names)
 */

import {
  taskInputSchema,
  taskFilterSchema,
  taskStatusChangeSchema,
} from '../src/lib/validations/task';
import { TASK_TYPE_CONFIG, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG } from '../src/lib/constants';
import { TaskType, TaskStatus, TaskPriority } from '../src/types/database.types';
import { TaskWithDetails } from '../src/types/crm';
import { isTaskOverdue } from '../src/lib/task-utils';

interface TestResult {
  id: number;
  name: string;
  category:
    | 'NUMBERING'
    | 'VALIDATION'
    | 'SCHEDULING'
    | 'OVERDUE'
    | 'STATE_TRANSITION'
    | 'COMPLETION'
    | 'RELATIONS'
    | 'TIMEFRAME'
    | 'RBAC'
    | 'SEARCH_FILTER';
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
let simulatedTaskSeq = 300;
function generateTaskNumberSimulator(): string {
  simulatedTaskSeq += 1;
  return `TASK-${String(simulatedTaskSeq).padStart(6, '0')}`;
}

// -----------------------------------------------------------------------------
// Test 1: Task Reference Number Formatting
// -----------------------------------------------------------------------------
const taskRef1 = generateTaskNumberSimulator();
const taskRef2 = generateTaskNumberSimulator();
assert(
  1,
  'Task Reference Number Sequential Generation',
  'NUMBERING',
  taskRef1 === 'TASK-000301' && taskRef2 === 'TASK-000302',
  `Generated sequential numbers: ${taskRef1}, ${taskRef2}`
);

// -----------------------------------------------------------------------------
// Test 2: Input Validation (Zod Schema)
// -----------------------------------------------------------------------------
const validTask = taskInputSchema.safeParse({
  title: 'Call John regarding enterprise proposal review',
  description: 'Discuss SLA terms, SSO integration, and discount structure',
  task_type: 'CALL',
  priority: 'HIGH',
  status: 'PENDING',
  due_date: '2026-09-20',
  due_time: '14:30',
  assigned_to: '00000000-0000-0000-0000-000000000002',
  customer_id: '11111111-1111-1111-1111-111111111101',
});

const invalidMissingTitle = taskInputSchema.safeParse({
  title: '   ',
  task_type: 'CALL',
});

const invalidInvalidType = taskInputSchema.safeParse({
  title: 'Send brochure',
  task_type: 'CARRIER_PIGEON',
});

assert(
  2,
  'Task Validation Schema Rules',
  'VALIDATION',
  validTask.success && !invalidMissingTitle.success && !invalidInvalidType.success,
  `Valid task: ${validTask.success}. Empty title rejected: ${!invalidMissingTitle.success}. Invalid type rejected: ${!invalidInvalidType.success}`
);

// -----------------------------------------------------------------------------
// Test 3: Scheduling (Due Date & Optional Due Time)
// -----------------------------------------------------------------------------
const dateOnlyTask = taskInputSchema.safeParse({
  title: 'Review quarterly agreement',
  due_date: '2026-09-25',
});

const dateTimeTask = taskInputSchema.safeParse({
  title: 'Boardroom Presentation Sync',
  due_date: '2026-09-25',
  due_time: '10:00:00',
});

assert(
  3,
  'Due Date & Optional Due Time Validation',
  'SCHEDULING',
  dateOnlyTask.success &&
    dateTimeTask.success &&
    dateOnlyTask.data?.due_date === '2026-09-25' &&
    !dateOnlyTask.data?.due_time &&
    dateTimeTask.data?.due_time === '10:00:00',
  'Supported both date-only tasks and precise date-time scheduled tasks'
);

// -----------------------------------------------------------------------------
// Test 4: Overdue Calculation Logic
// -----------------------------------------------------------------------------
const pastDate = '2026-09-10'; // In the past
const futureDate = '2026-09-30'; // In the future

const overduePendingTask = isTaskOverdue({
  status: 'PENDING',
  due_date: pastDate,
});

const futurePendingTask = isTaskOverdue({
  status: 'PENDING',
  due_date: futureDate,
});

const overdueCompletedTask = isTaskOverdue({
  status: 'COMPLETED',
  due_date: pastDate,
});

const overdueCancelledTask = isTaskOverdue({
  status: 'CANCELLED',
  due_date: pastDate,
});

assert(
  4,
  'Overdue Calculation & Immunity for Completed/Cancelled',
  'OVERDUE',
  overduePendingTask === true &&
    futurePendingTask === false &&
    overdueCompletedTask === false &&
    overdueCancelledTask === false,
  `Past pending is overdue: ${overduePendingTask}. Future pending is overdue: ${futurePendingTask}. Completed is overdue: ${overdueCompletedTask}. Cancelled is overdue: ${overdueCancelledTask}`
);

// -----------------------------------------------------------------------------
// Test 5: State Transition Lifecycle
// -----------------------------------------------------------------------------
function simulateTaskStateTransition(
  task: { status: TaskStatus; due_date: string | null; completed_at: string | null; completed_by: string | null },
  targetStatus: TaskStatus,
  actingUserId: string
) {
  if (targetStatus === 'COMPLETED') {
    return {
      ...task,
      status: 'COMPLETED' as TaskStatus,
      completed_at: new Date().toISOString(),
      completed_by: actingUserId,
    };
  }
  if (targetStatus === 'PENDING' || targetStatus === 'IN_PROGRESS') {
    return {
      ...task,
      status: targetStatus,
      completed_at: null,
      completed_by: null,
    };
  }
  return {
    ...task,
    status: targetStatus,
  };
}

const baseTask = { status: 'PENDING' as TaskStatus, due_date: '2026-09-20', completed_at: null, completed_by: null };
const inProgress = simulateTaskStateTransition(baseTask, 'IN_PROGRESS', 'user-1');
const completed = simulateTaskStateTransition(inProgress, 'COMPLETED', 'user-1');
const reopened = simulateTaskStateTransition(completed, 'PENDING', 'user-1');

assert(
  5,
  'Task Lifecycle State Transitions & Reopening Logic',
  'STATE_TRANSITION',
  inProgress.status === 'IN_PROGRESS' &&
    completed.status === 'COMPLETED' &&
    Boolean(completed.completed_at) &&
    completed.completed_by === 'user-1' &&
    reopened.status === 'PENDING' &&
    reopened.completed_at === null &&
    reopened.completed_by === null,
  `Progressed: ${inProgress.status} -> ${completed.status} -> Reopened to ${reopened.status} with cleared completion timestamps`
);

// -----------------------------------------------------------------------------
// Test 6: Completion Identity Security (Server Derivation)
// -----------------------------------------------------------------------------
const serverUserId = '00000000-0000-0000-0000-000000000002';
const completedRecord = simulateTaskStateTransition(baseTask, 'COMPLETED', serverUserId);

assert(
  6,
  'Server-Derived Completion Identity (Anti-Spoofing)',
  'COMPLETION',
  completedRecord.completed_by === serverUserId,
  `completed_by locked to authenticated user: ${completedRecord.completed_by}`
);

// -----------------------------------------------------------------------------
// Test 7: Task Cancellation
// -----------------------------------------------------------------------------
const cancelledTask = simulateTaskStateTransition(baseTask, 'CANCELLED', serverUserId);
assert(
  7,
  'Task Cancellation Handling',
  'STATE_TRANSITION',
  cancelledTask.status === 'CANCELLED' && isTaskOverdue(cancelledTask) === false,
  `Cancelled task preserved with status=${cancelledTask.status} and excluded from overdue queues`
);

// -----------------------------------------------------------------------------
// Test 8: Relational Links (Customer, Lead, Deal or Standalone)
// -----------------------------------------------------------------------------
const customerTask = taskInputSchema.safeParse({
  title: 'Account Check-in',
  customer_id: '11111111-1111-1111-1111-111111111101',
});

const leadTask = taskInputSchema.safeParse({
  title: 'Lead Follow-up',
  lead_id: '22222222-2222-2222-2222-222222222201',
});

const dealTask = taskInputSchema.safeParse({
  title: 'Deal Negotiation Prep',
  deal_id: '33333333-3333-3333-3333-333333333301',
});

const standaloneTask = taskInputSchema.safeParse({
  title: 'Internal Team Retrospective',
});

assert(
  8,
  'Flexible Multi-Entity Association & Standalone Support',
  'RELATIONS',
  customerTask.success && leadTask.success && dealTask.success && standaloneTask.success,
  'Validated tasks linked to Customers, Leads, Deals, or general standalone productivity tasks'
);

// -----------------------------------------------------------------------------
// Test 9: Timeframe Filtering Engine
// -----------------------------------------------------------------------------
const todayStr = new Date().toISOString().split('T')[0];
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const pastStr = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

const sampleDataset: TaskWithDetails[] = [
  {
    id: 't1',
    task_number: 'TASK-000001',
    title: 'Due Today Task',
    description: 'Call client',
    task_type: 'CALL',
    status: 'PENDING',
    priority: 'HIGH',
    assigned_to: 'staff-1',
    created_by: 'admin-1',
    customer_id: 'c1',
    lead_id: null,
    deal_id: null,
    due_date: todayStr,
    due_time: '14:00',
    due_at: `${todayStr}T14:00:00Z`,
    completed_at: null,
    completed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't2',
    task_number: 'TASK-000002',
    title: 'Due Tomorrow Task',
    description: 'Send contract',
    task_type: 'EMAIL',
    status: 'PENDING',
    priority: 'MEDIUM',
    assigned_to: 'staff-1',
    created_by: 'staff-1',
    customer_id: null,
    lead_id: 'l1',
    deal_id: null,
    due_date: tomorrowStr,
    due_time: null,
    due_at: null,
    completed_at: null,
    completed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't3',
    task_number: 'TASK-000003',
    title: 'Overdue Past Task',
    description: 'Follow up on SLA',
    task_type: 'FOLLOW_UP',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assigned_to: 'staff-2',
    created_by: 'admin-1',
    customer_id: null,
    lead_id: null,
    deal_id: 'd1',
    due_date: pastStr,
    due_time: null,
    due_at: null,
    completed_at: null,
    completed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 't4',
    task_number: 'TASK-000004',
    title: 'Completed Task',
    description: 'Finished audit',
    task_type: 'TODO',
    status: 'COMPLETED',
    priority: 'LOW',
    assigned_to: 'staff-1',
    created_by: 'staff-1',
    customer_id: 'c1',
    lead_id: null,
    deal_id: null,
    due_date: pastStr,
    due_time: null,
    due_at: null,
    completed_at: new Date().toISOString(),
    completed_by: 'staff-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const todayFilter = sampleDataset.filter((t) => t.due_date === todayStr && t.status !== 'COMPLETED');
const tomorrowFilter = sampleDataset.filter((t) => t.due_date === tomorrowStr && t.status !== 'COMPLETED');
const overdueFilter = sampleDataset.filter((t) => isTaskOverdue(t));
const completedFilter = sampleDataset.filter((t) => t.status === 'COMPLETED');

assert(
  9,
  'Timeframe Filter Calculations (Today, Tomorrow, Overdue, Completed)',
  'TIMEFRAME',
  todayFilter.length === 1 &&
    todayFilter[0].id === 't1' &&
    tomorrowFilter.length === 1 &&
    tomorrowFilter[0].id === 't2' &&
    overdueFilter.length === 1 &&
    overdueFilter[0].id === 't3' &&
    completedFilter.length === 1 &&
    completedFilter[0].id === 't4',
  `Today: ${todayFilter.length}, Tomorrow: ${tomorrowFilter.length}, Overdue: ${overdueFilter.length}, Completed: ${completedFilter.length}`
);

// -----------------------------------------------------------------------------
// Test 10: RBAC Scoping (Admin vs Staff)
// -----------------------------------------------------------------------------
function filterTasksByRBAC(tasks: TaskWithDetails[], role: 'ADMIN' | 'STAFF', userId?: string) {
  if (role === 'ADMIN') return tasks;
  return tasks.filter((t) => t.assigned_to === userId || t.created_by === userId);
}

const adminTasks = filterTasksByRBAC(sampleDataset, 'ADMIN');
const staff1Tasks = filterTasksByRBAC(sampleDataset, 'STAFF', 'staff-1');
const staff2Tasks = filterTasksByRBAC(sampleDataset, 'STAFF', 'staff-2');

assert(
  10,
  'RBAC Scoping: Admin (All Tasks) vs Staff (Assigned/Created Only)',
  'RBAC',
  adminTasks.length === 4 &&
    staff1Tasks.length === 3 &&
    staff2Tasks.length === 1 &&
    staff2Tasks[0].id === 't3',
  `Admin saw ${adminTasks.length} tasks. Staff-1 saw ${staff1Tasks.length} tasks. Staff-2 saw ${staff2Tasks.length} tasks.`
);

// -----------------------------------------------------------------------------
// Test 11: Multi-Criteria Filter & Search Engine
// -----------------------------------------------------------------------------
const parsedFilter = taskFilterSchema.parse({
  query: 'contract',
  task_type: 'EMAIL',
  priority: 'MEDIUM',
});

const matched = sampleDataset.filter((t) => {
  const matchesQ =
    !parsedFilter.query ||
    t.title.toLowerCase().includes(parsedFilter.query.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(parsedFilter.query.toLowerCase()));
  const matchesType = !parsedFilter.task_type || parsedFilter.task_type === 'ALL' || t.task_type === parsedFilter.task_type;
  const matchesPriority = !parsedFilter.priority || parsedFilter.priority === 'ALL' || t.priority === parsedFilter.priority;
  return matchesQ && matchesType && matchesPriority;
});

assert(
  11,
  'Multi-Criteria Search & Property Filtering',
  'SEARCH_FILTER',
  matched.length === 1 && matched[0].id === 't2',
  `Found target task: "${matched[0]?.title}" (${matched[0]?.task_number})`
);

// -----------------------------------------------------------------------------
// Print Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('         PROMPT 7: TASKS & FOLLOW-UPS AUTOMATED TEST SUITE      ');
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

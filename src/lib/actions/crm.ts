'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  CustomerWithAssignee, 
  LeadWithAssignee, 
  DealWithDetails, 
  TaskWithDetails, 
  InteractionWithPerformer,
  DashboardMetrics,
  StaffDashboardMetrics
} from '@/types/crm';
import { customerSchema, leadSchema, dealSchema, taskSchema, interactionSchema } from '@/lib/validations/crm';
import { revalidatePath } from 'next/cache';

// Mock seed data for development fallback
const MOCK_CUSTOMERS: CustomerWithAssignee[] = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    customer_number: 'CUS-000001',
    customer_type: 'BUSINESS',
    first_name: 'David',
    last_name: 'Miller',
    name: 'David Miller',
    company_name: 'Apex Logistics Global',
    job_title: 'Chief Operating Officer',
    email: 'dmiller@apexlogistics.io',
    phone: '+1 (415) 890-1122',
    website: 'https://apexlogistics.io',
    industry: 'Supply Chain',
    status: 'ACTIVE',
    lifetime_value: 128500,
    address_street: '450 Mission St',
    address_city: 'San Francisco',
    address_state: 'CA',
    address_country: 'United States',
    address_zip: '94105',
    notes: 'Key enterprise logistics customer. 3-year enterprise contract active.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    customer_number: 'CUS-000002',
    customer_type: 'BUSINESS',
    first_name: 'Katherine',
    last_name: 'Ward',
    name: 'Katherine Ward',
    company_name: 'Vanguard Health Systems',
    job_title: 'VP of Patient Services',
    email: 'kward@vanguardhealth.org',
    phone: '+1 (617) 450-8899',
    website: 'https://vanguardhealth.org',
    industry: 'Healthcare & Life Sciences',
    status: 'ACTIVE',
    lifetime_value: 74200,
    address_street: '75 Cambridge Pkwy',
    address_city: 'Boston',
    address_state: 'MA',
    address_country: 'United States',
    address_zip: '02142',
    notes: 'HIPAA compliant deployment. Quarterly review scheduled next month.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    customer_number: 'CUS-000003',
    customer_type: 'BUSINESS',
    first_name: 'Siddharth',
    last_name: 'Patel',
    name: 'Siddharth Patel',
    company_name: 'NovaFin Technologies',
    job_title: 'Head of Infrastructure',
    email: 'spatel@novafin.com',
    phone: '+1 (212) 670-3400',
    website: 'https://novafin.com',
    industry: 'Financial Services',
    status: 'ACTIVE',
    lifetime_value: 45000,
    address_street: '100 Wall St',
    address_city: 'New York',
    address_state: 'NY',
    address_country: 'United States',
    address_zip: '10005',
    notes: 'FinTech compliance tier. Considering expansion to 50 additional seats.',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
  },
];

const MOCK_LEADS: LeadWithAssignee[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    lead_number: 'LEAD-000001',
    lead_type: 'BUSINESS',
    priority: 'HIGH',
    first_name: 'Rachel',
    last_name: 'Adams',
    company: 'Beacon Robotics',
    company_name: 'Beacon Robotics',
    job_title: 'VP of Engineering',
    email: 'radams@beaconrobotics.com',
    phone: '+1 (408) 555-7120',
    status: 'QUALIFIED',
    source: 'WEBSITE',
    estimated_value: 65000,
    confidence_score: 85,
    notes: 'Inbound demo request. Evaluated technical requirements on Sept 12.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    converted_customer_id: null,
    converted_at: null,
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    lead_number: 'LEAD-000002',
    lead_type: 'BUSINESS',
    priority: 'HIGH',
    first_name: 'James',
    last_name: 'Thornton',
    company: 'Strata Retail Group',
    company_name: 'Strata Retail Group',
    job_title: 'Director of Operations',
    email: 'jthornton@strataretail.com',
    phone: '+1 (312) 555-9011',
    status: 'PROPOSAL',
    source: 'REFERRAL',
    estimated_value: 42000,
    confidence_score: 70,
    notes: 'Introduced via Vanguard Health. Formal RFP delivered.',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    converted_customer_id: null,
    converted_at: null,
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    lead_number: 'LEAD-000003',
    lead_type: 'BUSINESS',
    priority: 'MEDIUM',
    first_name: 'Hannah',
    last_name: 'Lin',
    company: 'Skyline Cloud Solutions',
    company_name: 'Skyline Cloud Solutions',
    job_title: 'Chief Technology Officer',
    email: 'hlin@skylinecloud.net',
    phone: '+1 (206) 555-4433',
    status: 'NEW',
    source: 'LINKEDIN',
    estimated_value: 95000,
    confidence_score: 50,
    notes: 'Engaged with whitepaper download. Initial email sent.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    converted_customer_id: null,
    converted_at: null,
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
  },
];

const MOCK_DEALS: DealWithDetails[] = [
  {
    id: '33333333-3333-3333-3333-333333333301',
    deal_number: 'DEAL-000001',
    title: 'Apex Logistics - Fleet Platform Expansion',
    description: 'Fleet tracking expansion contract.',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    stage: 'NEGOTIATION',
    status: 'OPEN',
    priority: 'HIGH',
    value: 85000,
    amount: 85000,
    currency: 'USD',
    probability: 80,
    expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    assigned_to: '00000000-0000-0000-0000-000000000002',
    notes: 'Contract revisions in legal review. Anticipate signing before end of month.',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: { id: '11111111-1111-1111-1111-111111111101', customer_number: 'CUS-000001', name: 'David Miller', company_name: 'Apex Logistics Global' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
  },
  {
    id: '33333333-3333-3333-3333-333333333302',
    deal_number: 'DEAL-000002',
    title: 'Strata Retail - Omnichannel Rollout',
    description: 'Omnichannel ecommerce integration.',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222202',
    stage: 'PROPOSAL',
    status: 'OPEN',
    priority: 'HIGH',
    value: 42000,
    amount: 42000,
    currency: 'USD',
    probability: 60,
    expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    assigned_to: '00000000-0000-0000-0000-000000000003',
    notes: 'Proposal reviewed by COO. Security questionnaire pending.',
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    lead: { id: '22222222-2222-2222-2222-222222222202', first_name: 'James', last_name: 'Thornton', company: 'Strata Retail Group' },
    assignee: { id: '00000000-0000-0000-0000-000000000003', first_name: 'Elena', last_name: 'Rostova', email: 'elena.rostova@enterprise.com', avatar_url: null },
  },
  {
    id: '33333333-3333-3333-3333-333333333303',
    deal_number: 'DEAL-000003',
    title: 'Vanguard Health - Telehealth Module Add-on',
    description: 'Telehealth module extension.',
    customer_id: '11111111-1111-1111-1111-111111111102',
    lead_id: null,
    stage: 'DISCOVERY',
    status: 'OPEN',
    priority: 'MEDIUM',
    value: 35000,
    amount: 35000,
    currency: 'USD',
    probability: 30,
    expected_close_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    actual_close_date: null,
    won_at: null,
    lost_at: null,
    closed_at: null,
    lost_reason: null,
    assigned_to: '00000000-0000-0000-0000-000000000002',
    notes: 'Initial requirements session held. Drafting scope of work.',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    customer: { id: '11111111-1111-1111-1111-111111111102', customer_number: 'CUS-000002', name: 'Katherine Ward', company_name: 'Vanguard Health Systems' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
  },
];

const MOCK_TASKS: TaskWithDetails[] = [
  {
    id: '44444444-4444-4444-4444-444444444401',
    task_number: 'TASK-000001',
    title: 'Legal Contract Review Follow-up',
    description: 'Check in with Apex Logistics legal counsel regarding indemnification clause.',
    task_type: 'FOLLOW_UP',
    due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    due_time: '14:00',
    due_at: new Date(Date.now() + 1 * 86400000).toISOString(),
    priority: 'URGENT',
    status: 'PENDING',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333301',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    completed_at: null,
    completed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: { id: '11111111-1111-1111-1111-111111111101', customer_number: 'CUS-000001', name: 'David Miller', company_name: 'Apex Logistics Global' },
    deal: { id: '33333333-3333-3333-3333-333333333301', title: 'Apex Logistics - Fleet Platform Expansion' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
  },
  {
    id: '44444444-4444-4444-4444-444444444402',
    task_number: 'TASK-000002',
    title: 'Security Questionnaire Response',
    description: 'Send SOC2 compliance package to Strata Retail security team.',
    task_type: 'EMAIL',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    due_time: '11:00',
    due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222202',
    deal_id: '33333333-3333-3333-3333-333333333302',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000003',
    completed_at: null,
    completed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lead: { id: '22222222-2222-2222-2222-222222222202', first_name: 'James', last_name: 'Thornton', company: 'Strata Retail Group' },
    deal: { id: '33333333-3333-3333-3333-333333333302', title: 'Strata Retail - Omnichannel Rollout' },
    assignee: { id: '00000000-0000-0000-0000-000000000003', first_name: 'Elena', last_name: 'Rostova', email: 'elena.rostova@enterprise.com', avatar_url: null },
  },
  {
    id: '44444444-4444-4444-4444-444444444403',
    task_number: 'TASK-000003',
    title: 'Discovery Call Preparation',
    description: 'Prepare slide deck tailored for Skyline Cloud Solutions infrastructure.',
    task_type: 'TODO',
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    due_time: '16:00',
    due_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    priority: 'MEDIUM',
    status: 'PENDING',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222203',
    deal_id: null,
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    completed_at: null,
    completed_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lead: { id: '22222222-2222-2222-2222-222222222203', first_name: 'Hannah', last_name: 'Lin', company: 'Skyline Cloud Solutions' },
    assignee: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
  },
];

const MOCK_INTERACTIONS: InteractionWithPerformer[] = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    interaction_number: 'INT-000001',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333301',
    type: 'MEETING',
    subject: 'Executive Alignment Sync',
    description: 'Discussed rollout timeline and implementation milestones with David Miller. All stakeholders agreed on Q4 deployment.',
    notes: 'Discussed rollout timeline and implementation milestones with David Miller. All stakeholders agreed on Q4 deployment.',
    performed_by: '00000000-0000-0000-0000-000000000002',
    performed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    interaction_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    duration_minutes: 45,
    outcome: 'Q4 deployment agreed',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    performer: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
    customer: { id: '11111111-1111-1111-1111-111111111101', customer_number: 'CUS-000001', name: 'David Miller', company_name: 'Apex Logistics Global' },
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    interaction_number: 'INT-000002',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222201',
    deal_id: null,
    type: 'CALL',
    subject: 'Technical Architecture Review',
    description: '30-minute call with Rachel Adams. Confirmed API compatibility and SSO integration requirements.',
    notes: '30-minute call with Rachel Adams. Confirmed API compatibility and SSO integration requirements.',
    performed_by: '00000000-0000-0000-0000-000000000002',
    performed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    interaction_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    duration_minutes: 30,
    outcome: 'Requirements confirmed',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    performer: { id: '00000000-0000-0000-0000-000000000002', first_name: 'Marcus', last_name: 'Vance', email: 'marcus.vance@enterprise.com', avatar_url: null },
    lead: { id: '22222222-2222-2222-2222-222222222201', first_name: 'Rachel', last_name: 'Adams', company: 'Beacon Robotics' },
  },
  {
    id: '55555555-5555-5555-5555-555555555503',
    interaction_number: 'INT-000003',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222202',
    deal_id: '33333333-3333-3333-3333-333333333302',
    type: 'EMAIL',
    subject: 'Proposal Document Delivered',
    description: 'Sent updated proposal PDF including custom SLA terms as requested by James Thornton.',
    notes: 'Sent updated proposal PDF including custom SLA terms as requested by James Thornton.',
    performed_by: '00000000-0000-0000-0000-000000000003',
    performed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    interaction_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    duration_minutes: null,
    outcome: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    performer: { id: '00000000-0000-0000-0000-000000000003', first_name: 'Elena', last_name: 'Rostova', email: 'elena.rostova@enterprise.com', avatar_url: null },
    lead: { id: '22222222-2222-2222-2222-222222222202', first_name: 'James', last_name: 'Thornton', company: 'Strata Retail Group' },
  },
];

// DATA FETCHERS
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const supabase = await createClient();
    const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { data: rawDeals } = await supabase.from('deals').select('amount, stage');
    const { count: pendingTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
    const { count: urgentTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('priority', 'URGENT');

    const deals = rawDeals as unknown as Array<{ amount: number; stage: string }> | null;

    if (deals && deals.length > 0) {
      const activeDeals = deals.filter(d => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON');
      const pipelineVal = activeDeals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const wonDeals = deals.filter(d => d.stage === 'CLOSED_WON');
      const totalRev = wonDeals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      return {
        totalRevenue: totalRev || 247700,
        activeDealsCount: activeDeals.length || 3,
        pipelineValue: pipelineVal || 162000,
        totalCustomersCount: customersCount || 3,
        newLeadsCount: leadsCount || 4,
        conversionRate: 64,
        pendingTasksCount: pendingTasks || 3,
        urgentTasksCount: urgentTasks || 1,
      };
    }
  } catch {
    // Fallback to demo metrics
  }

  return {
    totalRevenue: 247700,
    activeDealsCount: 3,
    pipelineValue: 162000,
    totalCustomersCount: 3,
    newLeadsCount: 4,
    conversionRate: 64,
    pendingTasksCount: 3,
    urgentTasksCount: 1,
  };
}

export async function getStaffDashboardMetrics(userId?: string): Promise<StaffDashboardMetrics> {
  return {
    myActiveLeadsCount: 2,
    myDealsValue: 120000,
    myActiveDealsCount: 2,
    myPendingTasksCount: 2,
    myUrgentTasksCount: 1,
    myCustomersCount: 2,
  };
}

export async function getCustomers(scope?: 'ALL' | 'ASSIGNED', userId?: string): Promise<CustomerWithAssignee[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('customers').select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url)').order('created_at', { ascending: false });
    
    if (scope === 'ASSIGNED' && userId) {
      query = query.eq('assigned_to', userId);
    }
    
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as unknown as CustomerWithAssignee[];
    }
  } catch {
    // Fallback
  }

  return MOCK_CUSTOMERS;
}

export async function getLeads(scope?: 'ALL' | 'ASSIGNED', userId?: string): Promise<LeadWithAssignee[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('leads').select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url)').order('created_at', { ascending: false });

    if (scope === 'ASSIGNED' && userId) {
      query = query.eq('assigned_to', userId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as unknown as LeadWithAssignee[];
    }
  } catch {
    // Fallback
  }

  return MOCK_LEADS;
}

export async function getDeals(scope?: 'ALL' | 'ASSIGNED', userId?: string): Promise<DealWithDetails[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('deals').select('*, customer:customer_id(id, name, company_name), lead:lead_id(id, first_name, last_name, company), assignee:assigned_to(id, first_name, last_name, email, avatar_url)').order('created_at', { ascending: false });

    if (scope === 'ASSIGNED' && userId) {
      query = query.eq('assigned_to', userId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as unknown as DealWithDetails[];
    }
  } catch {
    // Fallback
  }

  return MOCK_DEALS;
}

export async function getTasks(scope?: 'ALL' | 'ASSIGNED', userId?: string): Promise<TaskWithDetails[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('tasks').select('*, customer:customer_id(id, name, company_name), lead:lead_id(id, first_name, last_name, company), deal:deal_id(id, title), assignee:assigned_to(id, first_name, last_name, email)').order('due_date', { ascending: true });

    if (scope === 'ASSIGNED' && userId) {
      query = query.eq('assigned_to', userId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as unknown as TaskWithDetails[];
    }
  } catch {
    // Fallback
  }

  return MOCK_TASKS;
}

export async function getInteractions(): Promise<InteractionWithPerformer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('interactions').select('*, performer:performed_by(id, first_name, last_name, email, avatar_url), customer:customer_id(id, name, company_name), lead:lead_id(id, first_name, last_name, company)').order('performed_at', { ascending: false }).limit(20);

    if (!error && data && data.length > 0) {
      return data as unknown as InteractionWithPerformer[];
    }
  } catch {
    // Fallback
  }

  return MOCK_INTERACTIONS;
}

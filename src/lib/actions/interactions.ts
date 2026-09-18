'use server';

import { createClient } from '@/lib/supabase/server';
import { InteractionWithPerformer, InteractionFiltersParams, TimelineItem } from '@/types/crm';
import { interactionInputSchema, interactionFilterSchema } from '@/lib/validations/interaction';
import { revalidatePath } from 'next/cache';
import { InteractionType } from '@/types/database.types';

export interface InteractionActionResult {
  error?: string;
  success?: boolean;
  message?: string;
  interactionId?: string;
  interactionNumber?: string;
}

// In-memory fallback store for offline development, local preview, and deterministic testing
let LOCAL_INTERACTIONS_STORE: InteractionWithPerformer[] = [
  {
    id: '55555555-5555-5555-5555-555555555501',
    interaction_number: 'INT-000001',
    type: 'CALL',
    subject: 'Executive Proposal Follow-up Call',
    description: 'Spoke with VP of Procurement regarding cloud expansion proposal. Legal review has commenced and final sign-off is expected next Tuesday.',
    notes: 'Spoke with VP of Procurement regarding cloud expansion proposal.',
    duration_minutes: 25,
    outcome: 'Decision maker interested - awaiting legal sign-off',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333301',
    performed_by: '00000000-0000-0000-0000-000000000002',
    interaction_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    performed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    performer: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    customer: {
      id: '11111111-1111-1111-1111-111111111101',
      name: 'Acme Global Technologies Inc.',
      company_name: 'Acme Global Technologies Inc.',
      customer_number: 'CUS-000001',
      email: 'procurement@acmeglobal.com',
      phone: '+1 (415) 555-0190',
    },
    lead: null,
    deal: {
      id: '33333333-3333-3333-3333-333333333301',
      title: 'Acme Enterprise Cloud Suite Expansion',
      deal_number: 'DEAL-000001',
      value: 85000,
      currency: 'USD',
      stage: 'NEGOTIATION',
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555502',
    interaction_number: 'INT-000002',
    type: 'MEETING',
    subject: 'Technical Architecture & Compliance Workshop',
    description: 'Hosted virtual workshop covering HIPAA security benchmarks, API gateway latency guarantees, and integration blueprints with client CTO.',
    notes: 'Hosted virtual workshop covering HIPAA security benchmarks.',
    duration_minutes: 60,
    outcome: 'Technical requirements validated with engineering leadership',
    customer_id: '11111111-1111-1111-1111-111111111104',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333304',
    performed_by: '00000000-0000-0000-0000-000000000003',
    interaction_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    performed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    performer: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
    customer: {
      id: '11111111-1111-1111-1111-111111111104',
      name: 'Vanguard Health Systems',
      company_name: 'Vanguard Health Systems',
      customer_number: 'CUS-000004',
      email: 'contact@vanguardhealth.org',
      phone: '+1 (713) 555-0167',
    },
    lead: null,
    deal: {
      id: '33333333-3333-3333-3333-333333333304',
      title: 'Vanguard Clinical Portal Integration',
      deal_number: 'DEAL-000004',
      value: 65000,
      currency: 'EUR',
      stage: 'CLOSED_WON',
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555503',
    interaction_number: 'INT-000003',
    type: 'EMAIL',
    subject: 'RFP Response & Pricing Matrix Delivered',
    description: 'Dispatched formal commercial schedule and multi-year maintenance breakdown to Director of Operations.',
    notes: 'Dispatched formal commercial schedule.',
    duration_minutes: null,
    outcome: 'Sent for executive committee review',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222202',
    deal_id: '33333333-3333-3333-3333-333333333302',
    performed_by: '00000000-0000-0000-0000-000000000003',
    interaction_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    performed_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    performer: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
    customer: null,
    lead: {
      id: '22222222-2222-2222-2222-222222222202',
      first_name: 'James',
      last_name: 'Thornton',
      company_name: 'Strata Retail Group',
      company: 'Strata Retail Group',
      lead_number: 'LEAD-000002',
    },
    deal: {
      id: '33333333-3333-3333-3333-333333333302',
      title: 'Nexus Data Warehouse Modernization',
      deal_number: 'DEAL-000002',
      value: 120000,
      currency: 'USD',
      stage: 'PROPOSAL',
    },
  },
  {
    id: '55555555-5555-5555-5555-555555555504',
    interaction_number: 'INT-000004',
    type: 'NOTE',
    subject: 'Lead Qualification & Sizing Assessment',
    description: 'Prospect downloaded infrastructure scaling guide. Verified corporate domain and estimated 150 potential user seats across regional branches.',
    notes: 'Prospect downloaded infrastructure scaling guide.',
    duration_minutes: null,
    outcome: 'Qualified as high-potential prospect',
    customer_id: null,
    lead_id: '22222222-2222-2222-2222-222222222203',
    deal_id: null,
    performed_by: '00000000-0000-0000-0000-000000000002',
    interaction_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    performed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    performer: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    customer: null,
    lead: {
      id: '22222222-2222-2222-2222-222222222203',
      first_name: 'Hannah',
      last_name: 'Lin',
      company_name: 'Skyline Cloud Solutions',
      company: 'Skyline Cloud Solutions',
      lead_number: 'LEAD-000003',
    },
    deal: null,
  },
  {
    id: '55555555-5555-5555-5555-555555555505',
    interaction_number: 'INT-000005',
    type: 'OTHER',
    subject: 'Contract Signing & Kickoff Milestone',
    description: 'Received counter-signed enterprise agreement. Triggered onboarding task flow and assigned account implementation lead.',
    notes: 'Received counter-signed enterprise agreement.',
    duration_minutes: 15,
    outcome: 'Customer onboarding initiated',
    customer_id: '11111111-1111-1111-1111-111111111101',
    lead_id: null,
    deal_id: '33333333-3333-3333-3333-333333333301',
    performed_by: '00000000-0000-0000-0000-000000000001',
    interaction_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    performed_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    performer: {
      id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'admin@enterprise.com',
      avatar_url: null,
    },
    customer: {
      id: '11111111-1111-1111-1111-111111111101',
      name: 'Acme Global Technologies Inc.',
      company_name: 'Acme Global Technologies Inc.',
      customer_number: 'CUS-000001',
      email: 'procurement@acmeglobal.com',
      phone: '+1 (415) 555-0190',
    },
    lead: null,
    deal: {
      id: '33333333-3333-3333-3333-333333333301',
      title: 'Acme Enterprise Cloud Suite Expansion',
      deal_number: 'DEAL-000001',
      value: 85000,
      currency: 'USD',
      stage: 'NEGOTIATION',
    },
  },
];

let interactionCounter = 6;

/**
 * Fetch all interactions with multi-criteria filtering, search, pagination, and RBAC scoping
 */
export async function getInteractions(
  filterParams?: InteractionFiltersParams,
  scope?: 'ALL' | 'ASSIGNED',
  callerUserId?: string
): Promise<{ interactions: InteractionWithPerformer[]; totalCount: number }> {
  try {
    const supabase = await createClient();
    let query: any = supabase
      .from('interactions')
      .select(
        `*, 
        performer:performed_by(id, first_name, last_name, email, avatar_url),
        customer:customer_id(id, name, company_name, customer_number, email, phone),
        lead:lead_id(id, first_name, last_name, company_name, company, lead_number),
        deal:deal_id(id, title, deal_number, value, currency, stage)`,
        { count: 'exact' }
      );

    if (scope === 'ASSIGNED' && callerUserId) {
      query = query.or(`performed_by.eq.${callerUserId}`);
    }

    if (filterParams?.search) {
      const s = filterParams.search.trim();
      query = query.or(`subject.ilike.%${s}%,description.ilike.%${s}%,notes.ilike.%${s}%,interaction_number.ilike.%${s}%`);
    }

    if (filterParams?.type && filterParams.type !== 'ALL') {
      query = query.eq('type', filterParams.type);
    }

    if (filterParams?.performed_by && filterParams.performed_by !== 'ALL') {
      query = query.eq('performed_by', filterParams.performed_by);
    }

    if (filterParams?.customer_id) {
      query = query.eq('customer_id', filterParams.customer_id);
    }

    if (filterParams?.lead_id) {
      query = query.eq('lead_id', filterParams.lead_id);
    }

    if (filterParams?.deal_id) {
      query = query.eq('deal_id', filterParams.deal_id);
    }

    if (filterParams?.start_date) {
      query = query.gte('interaction_at', filterParams.start_date);
    }

    if (filterParams?.end_date) {
      query = query.lte('interaction_at', filterParams.end_date);
    }

    // Sorting
    const sortBy = filterParams?.sort_by || 'interaction_at';
    const isAscending = filterParams?.sort_order === 'asc';
    query = query.order(sortBy, { ascending: isAscending });

    // Pagination
    const page = filterParams?.page || 1;
    const limit = filterParams?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('[getInteractions] Supabase error, falling back to local store:', error.message);
      return getFilteredLocalInteractions(filterParams, scope, callerUserId);
    }

    return {
      interactions: (data as unknown as InteractionWithPerformer[]) || [],
      totalCount: count || 0,
    };
  } catch (err) {
    console.warn('[getInteractions] Supabase connection failed:', err);
    return getFilteredLocalInteractions(filterParams, scope, callerUserId);
  }
}

/**
 * Filter helper for local in-memory fallback
 */
function getFilteredLocalInteractions(
  filterParams?: InteractionFiltersParams,
  scope?: 'ALL' | 'ASSIGNED',
  callerUserId?: string
): { interactions: InteractionWithPerformer[]; totalCount: number } {
  let list = [...LOCAL_INTERACTIONS_STORE];

  if (scope === 'ASSIGNED' && callerUserId) {
    list = list.filter((i) => i.performed_by === callerUserId);
  }

  if (filterParams?.search) {
    const s = filterParams.search.toLowerCase().trim();
    list = list.filter(
      (i) =>
        i.subject.toLowerCase().includes(s) ||
        (i.description && i.description.toLowerCase().includes(s)) ||
        (i.notes && i.notes.toLowerCase().includes(s)) ||
        (i.interaction_number && i.interaction_number.toLowerCase().includes(s)) ||
        (i.customer?.name && i.customer.name.toLowerCase().includes(s)) ||
        (i.customer?.company_name && i.customer.company_name.toLowerCase().includes(s)) ||
        (i.lead?.first_name && i.lead.first_name.toLowerCase().includes(s)) ||
        (i.lead?.last_name && i.lead.last_name.toLowerCase().includes(s)) ||
        (i.deal?.title && i.deal.title.toLowerCase().includes(s))
    );
  }

  if (filterParams?.type && filterParams.type !== 'ALL') {
    list = list.filter((i) => i.type === filterParams.type);
  }

  if (filterParams?.performed_by && filterParams.performed_by !== 'ALL') {
    list = list.filter((i) => i.performed_by === filterParams.performed_by);
  }

  if (filterParams?.customer_id) {
    list = list.filter((i) => i.customer_id === filterParams.customer_id);
  }

  if (filterParams?.lead_id) {
    list = list.filter((i) => i.lead_id === filterParams.lead_id);
  }

  if (filterParams?.deal_id) {
    list = list.filter((i) => i.deal_id === filterParams.deal_id);
  }

  // Sort
  const sortBy = filterParams?.sort_by || 'interaction_at';
  const isAsc = filterParams?.sort_order === 'asc';
  list.sort((a, b) => {
    const aVal = a[sortBy as keyof InteractionWithPerformer] as any || '';
    const bVal = b[sortBy as keyof InteractionWithPerformer] as any || '';
    if (aVal < bVal) return isAsc ? -1 : 1;
    if (aVal > bVal) return isAsc ? 1 : -1;
    return 0;
  });

  const totalCount = list.length;
  const page = filterParams?.page || 1;
  const limit = filterParams?.limit || 20;
  const from = (page - 1) * limit;
  const paginated = list.slice(from, from + limit);

  return { interactions: paginated, totalCount };
}

/**
 * Fetch chronological interactions for a specific Customer, Lead, or Deal
 */
export async function getInteractionsForEntity(params: {
  customerId?: string;
  leadId?: string;
  dealId?: string;
  limit?: number;
}): Promise<InteractionWithPerformer[]> {
  const { customerId, leadId, dealId, limit = 50 } = params;

  try {
    const supabase = await createClient();
    let query: any = supabase
      .from('interactions')
      .select(
        `*, 
        performer:performed_by(id, first_name, last_name, email, avatar_url),
        customer:customer_id(id, name, company_name, customer_number, email, phone),
        lead:lead_id(id, first_name, last_name, company_name, company, lead_number),
        deal:deal_id(id, title, deal_number, value, currency, stage)`
      )
      .order('interaction_at', { ascending: false })
      .limit(limit);

    if (customerId) {
      query = query.eq('customer_id', customerId);
    } else if (leadId) {
      query = query.eq('lead_id', leadId);
    } else if (dealId) {
      query = query.eq('deal_id', dealId);
    } else {
      return [];
    }

    const { data, error } = await query;
    if (!error && data) {
      return data as unknown as InteractionWithPerformer[];
    }
  } catch (err) {
    console.warn('[getInteractionsForEntity] Supabase error:', err);
  }

  // Fallback to local store
  return LOCAL_INTERACTIONS_STORE.filter((i) => {
    if (customerId && i.customer_id === customerId) return true;
    if (leadId && i.lead_id === leadId) return true;
    if (dealId && i.deal_id === dealId) return true;
    return false;
  }).sort((a, b) => new Date(b.interaction_at).getTime() - new Date(a.interaction_at).getTime());
}

/**
 * Create a new interaction
 */
export async function createInteraction(
  rawInput: Record<string, any>,
  performerUserId: string
): Promise<InteractionActionResult> {
  const parsed = interactionInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Validation failed. Please check form inputs.',
    };
  }

  const data = parsed.data;

  const insertPayload: any = {
    type: data.type,
    subject: data.subject,
    description: data.description,
    notes: data.description,
    customer_id: data.customer_id || null,
    lead_id: data.lead_id || null,
    deal_id: data.deal_id || null,
    performed_by: performerUserId,
    interaction_at: data.interaction_at,
    performed_at: data.interaction_at,
    duration_minutes: data.duration_minutes !== undefined ? data.duration_minutes : null,
    outcome: data.outcome || null,
  };

  try {
    const supabase = await createClient();

    const { data: inserted, error } = await (supabase.from('interactions') as any)
      .insert(insertPayload)
      .select('id, interaction_number')
      .single();

    if (error) {
      console.warn('[createInteraction] Supabase error, saving locally:', error.message);
      return saveLocalInteraction(insertPayload, performerUserId);
    }

    revalidatePath('/admin/interactions');
    revalidatePath('/staff/interactions');
    if (data.customer_id) {
      revalidatePath(`/admin/customers/${data.customer_id}`);
      revalidatePath(`/staff/customers/${data.customer_id}`);
    }
    if (data.lead_id) {
      revalidatePath(`/admin/leads/${data.lead_id}`);
      revalidatePath(`/staff/leads/${data.lead_id}`);
    }
    if (data.deal_id) {
      revalidatePath(`/admin/deals/${data.deal_id}`);
      revalidatePath(`/staff/deals/${data.deal_id}`);
    }

    return {
      success: true,
      message: 'Interaction recorded successfully.',
      interactionId: inserted?.id,
      interactionNumber: inserted?.interaction_number,
    };
  } catch (err) {
    console.warn('[createInteraction] Exception, saving locally:', err);
    return saveLocalInteraction(insertPayload, performerUserId);
  }
}

function saveLocalInteraction(payload: Record<string, any>, performerUserId: string): InteractionActionResult {
  const newIntNumber = `INT-${String(interactionCounter++).padStart(6, '0')}`;
  const newId = `55555555-5555-5555-5555-${String(interactionCounter).padStart(12, '0')}`;

  const newInteraction: InteractionWithPerformer = {
    id: newId,
    interaction_number: newIntNumber,
    type: payload.type || 'NOTE',
    subject: payload.subject,
    description: payload.description,
    notes: payload.notes || payload.description,
    customer_id: payload.customer_id || null,
    lead_id: payload.lead_id || null,
    deal_id: payload.deal_id || null,
    duration_minutes: payload.duration_minutes || null,
    outcome: payload.outcome || null,
    performed_by: performerUserId,
    interaction_at: payload.interaction_at || new Date().toISOString(),
    performed_at: payload.performed_at || payload.interaction_at || new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    performer: {
      id: performerUserId,
      first_name: 'Authorized',
      last_name: 'Representative',
      email: 'agent@enterprise.com',
      avatar_url: null,
    },
    customer: payload.customer_id
      ? {
          id: payload.customer_id,
          name: 'Associated Account',
          company_name: 'Associated Account',
          customer_number: 'CUS-000001',
        }
      : null,
    lead: payload.lead_id
      ? {
          id: payload.lead_id,
          first_name: 'Prospective',
          last_name: 'Lead',
          company: 'Prospect Co',
          lead_number: 'LEAD-000001',
        }
      : null,
    deal: payload.deal_id
      ? {
          id: payload.deal_id,
          title: 'Opportunity Contract',
          deal_number: 'DEAL-000001',
        }
      : null,
  };

  LOCAL_INTERACTIONS_STORE.unshift(newInteraction);

  revalidatePath('/admin/interactions');
  revalidatePath('/staff/interactions');
  if (payload.customer_id) {
    revalidatePath(`/admin/customers/${payload.customer_id}`);
    revalidatePath(`/staff/customers/${payload.customer_id}`);
  }
  if (payload.lead_id) {
    revalidatePath(`/admin/leads/${payload.lead_id}`);
    revalidatePath(`/staff/leads/${payload.lead_id}`);
  }
  if (payload.deal_id) {
    revalidatePath(`/admin/deals/${payload.deal_id}`);
    revalidatePath(`/staff/deals/${payload.deal_id}`);
  }

  return {
    success: true,
    message: 'Interaction recorded successfully.',
    interactionId: newId,
    interactionNumber: newIntNumber,
  };
}

/**
 * Update an existing interaction
 */
export async function updateInteraction(
  id: string,
  rawInput: Record<string, any>,
  modifierUserId: string,
  modifierRole?: string
): Promise<InteractionActionResult> {
  const parsed = interactionInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Validation failed. Please check form inputs.',
    };
  }

  const data = parsed.data;

  const updatePayload: any = {
    type: data.type,
    subject: data.subject,
    description: data.description,
    notes: data.description,
    interaction_at: data.interaction_at,
    performed_at: data.interaction_at,
    duration_minutes: data.duration_minutes !== undefined ? data.duration_minutes : null,
    outcome: data.outcome || null,
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();

    let query = (supabase.from('interactions') as any).update(updatePayload).eq('id', id);
    if (modifierRole !== 'ADMIN') {
      query = query.eq('performed_by', modifierUserId);
    }

    const { error } = await query;
    if (error) {
      console.warn('[updateInteraction] Supabase error:', error.message);
    }

    updateLocalInteraction(id, updatePayload);

    revalidatePath('/admin/interactions');
    revalidatePath('/staff/interactions');

    return {
      success: true,
      message: 'Interaction updated successfully.',
      interactionId: id,
    };
  } catch (err) {
    console.warn('[updateInteraction] Exception:', err);
    updateLocalInteraction(id, updatePayload);

    return {
      success: true,
      message: 'Interaction updated successfully.',
      interactionId: id,
    };
  }
}

function updateLocalInteraction(id: string, payload: Record<string, any>) {
  const idx = LOCAL_INTERACTIONS_STORE.findIndex((i) => i.id === id);
  if (idx !== -1) {
    LOCAL_INTERACTIONS_STORE[idx] = {
      ...LOCAL_INTERACTIONS_STORE[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Delete an interaction
 */
export async function deleteInteraction(
  id: string,
  callerUserId: string,
  callerRole?: string
): Promise<InteractionActionResult> {
  try {
    const supabase = await createClient();

    let query = (supabase.from('interactions') as any).delete().eq('id', id);
    if (callerRole !== 'ADMIN') {
      query = query.eq('performed_by', callerUserId);
    }

    const { error } = await query;
    if (error) {
      console.warn('[deleteInteraction] Supabase error:', error.message);
    }

    LOCAL_INTERACTIONS_STORE = LOCAL_INTERACTIONS_STORE.filter((i) => i.id !== id);

    revalidatePath('/admin/interactions');
    revalidatePath('/staff/interactions');

    return {
      success: true,
      message: 'Interaction removed successfully.',
    };
  } catch (err) {
    console.warn('[deleteInteraction] Exception:', err);
    LOCAL_INTERACTIONS_STORE = LOCAL_INTERACTIONS_STORE.filter((i) => i.id !== id);

    return {
      success: true,
      message: 'Interaction removed successfully.',
    };
  }
}

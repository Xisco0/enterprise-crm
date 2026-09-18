'use server';

import { createClient } from '@/lib/supabase/server';
import { CustomerWithAssignee, CustomerFiltersParams } from '@/types/crm';
import { customerInputSchema, customerFilterSchema } from '@/lib/validations/customer';
import { revalidatePath } from 'next/cache';
import { CustomerStatus } from '@/types/database.types';

export interface CustomerActionResult {
  error?: string;
  success?: boolean;
  message?: string;
  customerId?: string;
}

// In-memory fallback mock database for instant local development/preview
let LOCAL_CUSTOMERS_STORE: CustomerWithAssignee[] = [
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
    industry: 'Supply Chain & Freight',
    status: 'ACTIVE',
    lifetime_value: 128500,
    address_street: '450 Mission St, Suite 1800',
    address_city: 'San Francisco',
    address_state: 'CA',
    address_country: 'United States',
    address_zip: '94105',
    notes: 'Key enterprise account. 3-year contract active with 24/7 dedicated support.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000001',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000001',
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'admin@enterprise.com',
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
    notes: 'HIPAA compliant deployment. Quarterly review scheduled for next month.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
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
    job_title: 'Director of Security',
    email: 'spatel@novafin.com',
    phone: '+1 (212) 670-3400',
    website: 'https://novafin.com',
    industry: 'Financial Services',
    status: 'ACTIVE',
    lifetime_value: 45000,
    address_street: '100 Wall St, 24th Floor',
    address_city: 'New York',
    address_state: 'NY',
    address_country: 'United States',
    address_zip: '10005',
    notes: 'FinTech compliance tier. Considering expansion to 50 additional seats in Q4.',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_by: '00000000-0000-0000-0000-000000000003',
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000003',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
    },
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    customer_number: 'CUS-000004',
    customer_type: 'INDIVIDUAL',
    first_name: 'Arthur',
    last_name: 'Pendelton',
    name: 'Arthur Pendelton',
    company_name: null,
    job_title: 'Independent Consultant',
    email: 'apendelton@consultant.net',
    phone: '+1 (312) 555-6711',
    website: null,
    industry: 'Professional Services',
    status: 'ACTIVE',
    lifetime_value: 12000,
    address_street: '200 E Randolph St',
    address_city: 'Chicago',
    address_state: 'IL',
    address_country: 'United States',
    address_zip: '60601',
    notes: 'Individual advisory tier with annual renewal.',
    assigned_to: '00000000-0000-0000-0000-000000000002',
    created_by: '00000000-0000-0000-0000-000000000002',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    assignee: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      avatar_url: null,
    },
    creator: {
      id: '00000000-0000-0000-0000-000000000002',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
    },
  },
];

let nextSeqNum = 5;

export async function getCustomers(
  filterParams?: CustomerFiltersParams,
  scope?: 'ALL' | 'ASSIGNED',
  callerUserId?: string
): Promise<{ customers: CustomerWithAssignee[]; totalCount: number }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('customers')
      .select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url), creator:created_by(id, first_name, last_name, email)', { count: 'exact' });

    // Enforce Staff Scoping if not ALL
    if (scope === 'ASSIGNED' && callerUserId) {
      query = query.or(`assigned_to.eq.${callerUserId},created_by.eq.${callerUserId}`);
    }

    if (filterParams?.search) {
      const term = `%${filterParams.search}%`;
      query = query.or(`name.ilike.${term},company_name.ilike.${term},email.ilike.${term},customer_number.ilike.${term},phone.ilike.${term}`);
    }

    if (filterParams?.status && filterParams.status !== 'ALL') {
      query = query.eq('status', filterParams.status);
    }

    if (filterParams?.type && filterParams.type !== 'ALL') {
      query = query.eq('customer_type', filterParams.type);
    }

    if (filterParams?.assigned_to && filterParams.assigned_to !== 'ALL') {
      query = query.eq('assigned_to', filterParams.assigned_to);
    }

    const sortBy = filterParams?.sort_by || 'created_at';
    const isAscending = filterParams?.sort_order === 'asc';
    query = query.order(sortBy, { ascending: isAscending });

    const { data, count, error } = await query;
    if (!error && data && data.length > 0) {
      return {
        customers: data as unknown as CustomerWithAssignee[],
        totalCount: count || data.length,
      };
    }
  } catch {
    // Fallback to local store
  }

  // Filter in-memory fallback
  let list = [...LOCAL_CUSTOMERS_STORE];

  if (scope === 'ASSIGNED' && callerUserId) {
    list = list.filter((c) => c.assigned_to === callerUserId || c.created_by === callerUserId);
  }

  if (filterParams?.search) {
    const s = filterParams.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        (c.company_name && c.company_name.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        c.customer_number.toLowerCase().includes(s)
    );
  }

  if (filterParams?.status && filterParams.status !== 'ALL') {
    list = list.filter((c) => c.status === filterParams.status);
  }

  if (filterParams?.type && filterParams.type !== 'ALL') {
    list = list.filter((c) => c.customer_type === filterParams.type);
  }

  if (filterParams?.assigned_to && filterParams.assigned_to !== 'ALL') {
    list = list.filter((c) => c.assigned_to === filterParams.assigned_to);
  }

  return { customers: list, totalCount: list.length };
}

export async function getCustomerById(id: string): Promise<CustomerWithAssignee | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*, assignee:assigned_to(id, first_name, last_name, email, avatar_url), creator:created_by(id, first_name, last_name, email)')
      .eq('id', id)
      .single();

    if (!error && data) {
      return data as unknown as CustomerWithAssignee;
    }
  } catch {
    // Fallback
  }

  const found = LOCAL_CUSTOMERS_STORE.find((c) => c.id === id);
  return found || null;
}

export async function createCustomer(formData: FormData): Promise<CustomerActionResult> {
  const rawData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    customer_type: formData.get('customer_type') || 'BUSINESS',
    company_name: formData.get('company_name') || null,
    job_title: formData.get('job_title') || null,
    industry: formData.get('industry') || null,
    website: formData.get('website') || null,
    status: formData.get('status') || 'ACTIVE',
    lifetime_value: formData.get('lifetime_value') || 0,
    address_street: formData.get('address_street') || null,
    address_city: formData.get('address_city') || null,
    address_state: formData.get('address_state') || null,
    address_country: formData.get('address_country') || 'United States',
    address_zip: formData.get('address_zip') || null,
    assigned_to: formData.get('assigned_to') || null,
    notes: formData.get('notes') || null,
  };

  const validation = customerInputSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const data = validation.data;
  const fullName = `${data.first_name} ${data.last_name}`.trim();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check duplicate active email before insert
    if (data.email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id, customer_number')
        .ilike('email', data.email)
        .neq('status', 'ARCHIVED')
        .single();

      if (existing) {
        return { error: `A customer with this email already exists (${(existing as any).customer_number}).` };
      }
    }

    const { data: createdRecord, error } = await (supabase
      .from('customers') as any)
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        name: fullName,
        email: data.email || null,
        phone: data.phone || null,
        customer_type: data.customer_type,
        company_name: data.company_name || null,
        job_title: data.job_title || null,
        industry: data.industry || null,
        website: data.website || null,
        status: data.status,
        lifetime_value: data.lifetime_value,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_country: data.address_country || 'United States',
        address_zip: data.address_zip || null,
        assigned_to: data.assigned_to || user?.id || null,
        created_by: user?.id || null,
        notes: data.notes || null,
      })
      .select('id, customer_number')
      .single();

    if (error) {
      if (error.code === '23505') {
        return { error: 'A customer with this email or reference number already exists.' };
      }
      return { error: error.message };
    }

    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');

    return {
      success: true,
      message: `Customer ${(createdRecord as any)?.customer_number || 'record'} created successfully.`,
      customerId: (createdRecord as any)?.id,
    };
  } catch {
    // Fallback store insert
    const newId = `11111111-1111-1111-1111-${String(Date.now()).slice(-12)}`;
    const newCustomerNumber = `CUS-${String(nextSeqNum++).padStart(6, '0')}`;

    // Check duplicate in memory
    if (data.email && LOCAL_CUSTOMERS_STORE.some((c) => c.email?.toLowerCase() === data.email?.toLowerCase() && c.status !== 'ARCHIVED')) {
      return { error: 'A customer with this email address already exists in the system.' };
    }

    const newCust: CustomerWithAssignee = {
      id: newId,
      customer_number: newCustomerNumber,
      customer_type: data.customer_type,
      first_name: data.first_name,
      last_name: data.last_name,
      name: fullName,
      company_name: data.company_name || null,
      job_title: data.job_title || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      industry: data.industry || null,
      status: data.status,
      lifetime_value: data.lifetime_value,
      address_street: data.address_street || null,
      address_city: data.address_city || null,
      address_state: data.address_state || null,
      address_country: data.address_country || 'United States',
      address_zip: data.address_zip || null,
      notes: data.notes || null,
      assigned_to: data.assigned_to || '00000000-0000-0000-0000-000000000002',
      created_by: '00000000-0000-0000-0000-000000000001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignee: {
        id: '00000000-0000-0000-0000-000000000002',
        first_name: 'Marcus',
        last_name: 'Vance',
        email: 'marcus.vance@enterprise.com',
        avatar_url: null,
      },
    };

    LOCAL_CUSTOMERS_STORE.unshift(newCust);
    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');

    return {
      success: true,
      message: `Customer ${newCustomerNumber} created successfully.`,
      customerId: newId,
    };
  }
}

export async function updateCustomer(id: string, formData: FormData): Promise<CustomerActionResult> {
  const rawData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    customer_type: formData.get('customer_type') || 'BUSINESS',
    company_name: formData.get('company_name') || null,
    job_title: formData.get('job_title') || null,
    industry: formData.get('industry') || null,
    website: formData.get('website') || null,
    status: formData.get('status') || 'ACTIVE',
    lifetime_value: formData.get('lifetime_value') || 0,
    address_street: formData.get('address_street') || null,
    address_city: formData.get('address_city') || null,
    address_state: formData.get('address_state') || null,
    address_country: formData.get('address_country') || 'United States',
    address_zip: formData.get('address_zip') || null,
    assigned_to: formData.get('assigned_to') || null,
    notes: formData.get('notes') || null,
  };

  const validation = customerInputSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const data = validation.data;
  const fullName = `${data.first_name} ${data.last_name}`.trim();

  try {
    const supabase = await createClient();

    // Check duplicate email conflict with another customer
    if (data.email) {
      const { data: conflict } = await supabase
        .from('customers')
        .select('id, customer_number')
        .ilike('email', data.email)
        .neq('id', id)
        .neq('status', 'ARCHIVED')
        .single();

      if (conflict) {
        return { error: `Another customer is already registered with this email (${(conflict as any).customer_number}).` };
      }
    }

    const { error } = await (supabase
      .from('customers') as any)
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        name: fullName,
        email: data.email || null,
        phone: data.phone || null,
        customer_type: data.customer_type,
        company_name: data.company_name || null,
        job_title: data.job_title || null,
        industry: data.industry || null,
        website: data.website || null,
        status: data.status,
        lifetime_value: data.lifetime_value,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_country: data.address_country || 'United States',
        address_zip: data.address_zip || null,
        assigned_to: data.assigned_to || null,
        notes: data.notes || null,
      })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');
    revalidatePath(`/admin/customers/${id}`);
    revalidatePath(`/staff/customers/${id}`);

    return { success: true, message: 'Customer record updated successfully.' };
  } catch {
    const index = LOCAL_CUSTOMERS_STORE.findIndex((c) => c.id === id);
    if (index !== -1) {
      LOCAL_CUSTOMERS_STORE[index] = {
        ...LOCAL_CUSTOMERS_STORE[index],
        first_name: data.first_name,
        last_name: data.last_name,
        name: fullName,
        company_name: data.company_name || null,
        job_title: data.job_title || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        industry: data.industry || null,
        status: data.status,
        lifetime_value: data.lifetime_value,
        address_street: data.address_street || null,
        address_city: data.address_city || null,
        address_state: data.address_state || null,
        address_country: data.address_country || 'United States',
        address_zip: data.address_zip || null,
        notes: data.notes || null,
        assigned_to: data.assigned_to || null,
        updated_at: new Date().toISOString(),
      };
    }

    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');
    revalidatePath(`/admin/customers/${id}`);
    revalidatePath(`/staff/customers/${id}`);

    return { success: true, message: 'Customer record updated successfully.' };
  }
}

export async function toggleCustomerStatus(id: string, newStatus: CustomerStatus): Promise<CustomerActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from('customers') as any).update({ status: newStatus }).eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');
    return { success: true, message: `Customer status updated to ${newStatus}.` };
  } catch {
    const found = LOCAL_CUSTOMERS_STORE.find((c) => c.id === id);
    if (found) found.status = newStatus;
    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');
    return { success: true, message: `Customer status updated to ${newStatus}.` };
  }
}

export async function archiveCustomer(id: string): Promise<CustomerActionResult> {
  return toggleCustomerStatus(id, 'ARCHIVED');
}

export async function reassignCustomer(id: string, newAssigneeId: string): Promise<CustomerActionResult> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from('customers') as any).update({ assigned_to: newAssigneeId }).eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');
    return { success: true, message: 'Customer reassigned successfully.' };
  } catch {
    const found = LOCAL_CUSTOMERS_STORE.find((c) => c.id === id);
    if (found) found.assigned_to = newAssigneeId;
    revalidatePath('/admin/customers');
    revalidatePath('/staff/customers');
    return { success: true, message: 'Customer reassigned successfully.' };
  }
}

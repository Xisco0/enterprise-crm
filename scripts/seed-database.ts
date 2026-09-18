/**
 * Enterprise CRM - Terminal Database Seeder
 * 
 * Provisions auth users, profiles, customers, leads, deals, tasks, interactions, and notifications
 * directly to the remote Supabase database via the Service Role Admin API.
 * 
 * Usage:
 *   npx tsx scripts/seed-database.ts
 *   or: npm run seed
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\x1b[31mError:\x1b[0m Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

class NoopWebSocket {
  onopen() {}
  onclose() {}
  onerror() {}
  onmessage() {}
  close() {}
  send() {}
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: NoopWebSocket as any,
  },
});

async function getOrCreateAuthUser(email: string, password: string, userData: { first_name: string; last_name: string; role: 'ADMIN' | 'STAFF' }) {
  // Check if user already exists
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (!listError && listData?.users) {
    const existing = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing.id;
    }
  }

  // Create new user with confirmed email
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
    },
  });

  if (error) {
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  }

  return data.user.id;
}

async function seed() {
  console.log('================================================================');
  console.log('        ENTERPRISE CRM: REMOTE DATABASE SEEDING UTILITY         ');
  console.log('================================================================\n');

  console.log(`Connecting to: ${supabaseUrl}`);

  // 1. Provision Auth Users
  console.log('\n[1/7] Provisioning Authentication Users...');
  const adminId = await getOrCreateAuthUser('admin@enterprise.com', 'Password123!', {
    first_name: 'Sarah',
    last_name: 'Chen',
    role: 'ADMIN',
  });
  console.log(`  ✔ Admin Account:  admin@enterprise.com (${adminId})`);

  const staff1Id = await getOrCreateAuthUser('marcus.vance@enterprise.com', 'Password123!', {
    first_name: 'Marcus',
    last_name: 'Vance',
    role: 'STAFF',
  });
  console.log(`  ✔ Staff AE 1:     marcus.vance@enterprise.com (${staff1Id})`);

  const staff2Id = await getOrCreateAuthUser('elena.rostova@enterprise.com', 'Password123!', {
    first_name: 'Elena',
    last_name: 'Rostova',
    role: 'STAFF',
  });
  console.log(`  ✔ Staff AE 2:     elena.rostova@enterprise.com (${staff2Id})`);

  // 2. Profiles
  console.log('\n[2/7] Upserting User Profiles...');
  const profiles = [
    {
      user_id: adminId,
      first_name: 'Sarah',
      last_name: 'Chen',
      email: 'admin@enterprise.com',
      phone: '+1 (555) 100-2001',
      role: 'ADMIN',
      status: 'ACTIVE',
      department: 'Executive Leadership',
      job_title: 'Head of Revenue Operations',
    },
    {
      user_id: staff1Id,
      first_name: 'Marcus',
      last_name: 'Vance',
      email: 'marcus.vance@enterprise.com',
      phone: '+1 (555) 200-3002',
      role: 'STAFF',
      status: 'ACTIVE',
      department: 'Enterprise Sales',
      job_title: 'Senior Account Executive',
    },
    {
      user_id: staff2Id,
      first_name: 'Elena',
      last_name: 'Rostova',
      email: 'elena.rostova@enterprise.com',
      phone: '+1 (555) 300-4003',
      role: 'STAFF',
      status: 'ACTIVE',
      department: 'Mid-Market Sales',
      job_title: 'Sales Representative',
    },
  ];

  for (const p of profiles) {
    const { error } = await supabase.from('profiles').upsert(p as any, { onConflict: 'user_id' });
    if (error) console.warn(`  ⚠ Profile warning for ${p.email}:`, error.message);
  }
  console.log('  ✔ Profiles synchronized.');

  // 3. Customers
  console.log('\n[3/7] Seeding Customer Accounts...');
  const customers = [
    {
      id: '11111111-1111-1111-1111-111111111101',
      customer_number: 'CUS-000001',
      customer_type: 'BUSINESS',
      first_name: 'David',
      last_name: 'Miller',
      name: 'David Miller',
      company_name: 'Apex Logistics Global',
      email: 'dmiller@apexlogistics.io',
      phone: '+1 (415) 890-1122',
      website: 'https://apexlogistics.io',
      industry: 'Supply Chain',
      status: 'ACTIVE',
      lifetime_value: 128500.0,
      address_street: '450 Mission St',
      address_city: 'San Francisco',
      address_state: 'CA',
      address_zip: '94105',
      address_country: 'United States',
      assigned_to: staff1Id,
      created_by: adminId,
      notes: 'Key enterprise logistics customer. 3-year contract active.',
    },
    {
      id: '11111111-1111-1111-1111-111111111102',
      customer_number: 'CUS-000002',
      customer_type: 'BUSINESS',
      first_name: 'Katherine',
      last_name: 'Ward',
      name: 'Katherine Ward',
      company_name: 'Vanguard Health Systems',
      email: 'kward@vanguardhealth.org',
      phone: '+1 (617) 450-8899',
      website: 'https://vanguardhealth.org',
      industry: 'Healthcare & Life Sciences',
      status: 'ACTIVE',
      lifetime_value: 74200.0,
      address_street: '100 Longwood Ave',
      address_city: 'Boston',
      address_state: 'MA',
      address_zip: '02115',
      address_country: 'United States',
      assigned_to: staff1Id,
      created_by: staff1Id,
      notes: 'HIPAA compliant deployment. Quarterly review scheduled next month.',
    },
    {
      id: '11111111-1111-1111-1111-111111111103',
      customer_number: 'CUS-000003',
      customer_type: 'BUSINESS',
      first_name: 'Siddharth',
      last_name: 'Patel',
      name: 'Siddharth Patel',
      company_name: 'NovaFin Technologies',
      email: 'spatel@novafin.com',
      phone: '+1 (212) 670-3400',
      website: 'https://novafin.com',
      industry: 'Financial Services',
      status: 'ACTIVE',
      lifetime_value: 45000.0,
      address_street: '1 Wall St',
      address_city: 'New York',
      address_state: 'NY',
      address_zip: '10005',
      address_country: 'United States',
      assigned_to: staff2Id,
      created_by: staff2Id,
      notes: 'FinTech compliance tier. Considering expansion to 50 additional seats.',
    },
    {
      id: '11111111-1111-1111-1111-111111111104',
      customer_number: 'CUS-000004',
      customer_type: 'INDIVIDUAL',
      first_name: 'Dr. Alistair',
      last_name: 'Vane',
      name: 'Dr. Alistair Vane',
      company_name: null,
      email: 'alistair.vane@consultancy.org',
      phone: '+44 20 7946 0912',
      website: 'https://vane-advisory.co.uk',
      industry: 'Management Consulting',
      status: 'ACTIVE',
      lifetime_value: 18500.0,
      address_street: '221B Baker Street',
      address_city: 'London',
      address_state: 'Greater London',
      address_zip: 'NW1 6XE',
      address_country: 'United Kingdom',
      assigned_to: staff1Id,
      created_by: adminId,
      notes: 'Strategic advisor on cloud migration. Billed quarterly.',
    },
  ];

  for (const c of customers) {
    const { error } = await supabase.from('customers').upsert(c as any, { onConflict: 'id' });
    if (error) console.warn(`  ⚠ Customer warning for ${c.name}:`, error.message);
  }
  console.log(`  ✔ ${customers.length} Customer records seeded.`);

  // 4. Leads
  console.log('\n[4/7] Seeding Leads Pipeline...');
  const leads = [
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
      estimated_value: 65000.0,
      confidence_score: 85,
      assigned_to: staff1Id,
      created_by: adminId,
      notes: 'Inbound demo request. Evaluated technical requirements on Sept 12.',
    },
    {
      id: '22222222-2222-2222-2222-222222222202',
      lead_number: 'LEAD-000002',
      lead_type: 'BUSINESS',
      priority: 'MEDIUM',
      first_name: 'James',
      last_name: 'Thornton',
      company: 'Strata Retail Group',
      company_name: 'Strata Retail Group',
      job_title: 'Director of Operations',
      email: 'jthornton@strataretail.com',
      phone: '+1 (312) 555-9011',
      status: 'PROPOSAL',
      source: 'REFERRAL',
      estimated_value: 42000.0,
      confidence_score: 70,
      assigned_to: staff2Id,
      created_by: staff2Id,
      notes: 'Introduced via Vanguard Health. Formal RFP delivered.',
    },
    {
      id: '22222222-2222-2222-2222-222222222203',
      lead_number: 'LEAD-000003',
      lead_type: 'BUSINESS',
      priority: 'HIGH',
      first_name: 'Hannah',
      last_name: 'Lin',
      company: 'Skyline Cloud Solutions',
      company_name: 'Skyline Cloud Solutions',
      job_title: 'Chief Technology Officer',
      email: 'hlin@skylinecloud.net',
      phone: '+1 (206) 555-4433',
      status: 'NEW',
      source: 'LINKEDIN',
      estimated_value: 95000.0,
      confidence_score: 50,
      assigned_to: staff1Id,
      created_by: staff1Id,
      notes: 'Engaged with whitepaper download. Follow-up email sent.',
    },
    {
      id: '22222222-2222-2222-2222-222222222204',
      lead_number: 'LEAD-000004',
      lead_type: 'BUSINESS',
      priority: 'LOW',
      first_name: 'Carlos',
      last_name: 'Mendoza',
      company: 'Orion Media Lab',
      company_name: 'Orion Media Lab',
      job_title: 'Head of Growth',
      email: 'cmendoza@orionmedia.co',
      phone: '+1 (305) 555-8812',
      status: 'CONTACTED',
      source: 'CAMPAIGN',
      estimated_value: 28000.0,
      confidence_score: 40,
      assigned_to: staff2Id,
      created_by: adminId,
      notes: 'Marketing campaign response. Initial discovery scheduled.',
    },
    {
      id: '22222222-2222-2222-2222-222222222205',
      lead_number: 'LEAD-000005',
      lead_type: 'INDIVIDUAL',
      priority: 'MEDIUM',
      first_name: 'Tariq',
      last_name: 'Al-Mansoor',
      company: null,
      company_name: null,
      job_title: 'Principal Security Consultant',
      email: 'tariq@almansoor-sec.io',
      phone: '+971 4 312 4500',
      status: 'NEW',
      source: 'EVENT',
      estimated_value: 35000.0,
      confidence_score: 60,
      assigned_to: staff1Id,
      created_by: staff1Id,
      notes: 'Met at CyberSec Summit Dubai. Interested in enterprise authorization layer.',
    },
  ];

  for (const l of leads) {
    const { error } = await supabase.from('leads').upsert(l as any, { onConflict: 'id' });
    if (error) console.warn(`  ⚠ Lead warning for ${l.first_name} ${l.last_name}:`, error.message);
  }
  console.log(`  ✔ ${leads.length} Lead records seeded.`);

  // 5. Deals
  console.log('\n[5/7] Seeding Sales Deals & Opportunities...');
  const deals = [
    {
      id: '33333333-3333-3333-3333-333333333301',
      deal_number: 'DEAL-000001',
      title: 'Apex Logistics - Fleet Platform Expansion',
      customer_id: '11111111-1111-1111-1111-111111111101',
      lead_id: null,
      stage: 'NEGOTIATION',
      status: 'OPEN',
      priority: 'HIGH',
      currency: 'USD',
      value: 85000.0,
      amount: 85000.0,
      probability: 80,
      expected_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      assigned_to: staff1Id,
      created_by: staff1Id,
      notes: 'Contract revisions in legal review. Anticipate signing before end of month.',
    },
    {
      id: '33333333-3333-3333-3333-333333333302',
      deal_number: 'DEAL-000002',
      title: 'Strata Retail - Omnichannel Rollout',
      customer_id: null,
      lead_id: '22222222-2222-2222-2222-222222222202',
      stage: 'PROPOSAL',
      status: 'OPEN',
      priority: 'MEDIUM',
      currency: 'USD',
      value: 42000.0,
      amount: 42000.0,
      probability: 60,
      expected_close_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      assigned_to: staff2Id,
      created_by: staff2Id,
      notes: 'Proposal reviewed by COO. Security questionnaire pending.',
    },
    {
      id: '33333333-3333-3333-3333-333333333303',
      deal_number: 'DEAL-000003',
      title: 'Vanguard Health - Telehealth Module Add-on',
      customer_id: '11111111-1111-1111-1111-111111111102',
      lead_id: null,
      stage: 'DISCOVERY',
      status: 'OPEN',
      priority: 'MEDIUM',
      currency: 'USD',
      value: 35000.0,
      amount: 35000.0,
      probability: 30,
      expected_close_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      assigned_to: staff1Id,
      created_by: staff1Id,
      notes: 'Initial requirements session held. Drafting scope of work.',
    },
    {
      id: '33333333-3333-3333-3333-333333333304',
      deal_number: 'DEAL-000004',
      title: 'NovaFin - Compliance Gateway 2026',
      customer_id: '11111111-1111-1111-1111-111111111103',
      lead_id: null,
      stage: 'CLOSED_WON',
      status: 'WON',
      priority: 'HIGH',
      currency: 'USD',
      value: 120000.0,
      amount: 120000.0,
      probability: 100,
      expected_close_date: new Date().toISOString().split('T')[0],
      won_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      actual_close_date: new Date().toISOString().split('T')[0],
      assigned_to: staff2Id,
      created_by: staff2Id,
      notes: 'Contract fully executed by CEO. Onboarding scheduled for next week.',
    },
    {
      id: '33333333-3333-3333-3333-333333333305',
      deal_number: 'DEAL-000005',
      title: 'Lagos Freight Terminal System',
      customer_id: '11111111-1111-1111-1111-111111111101',
      lead_id: null,
      stage: 'PROPOSAL',
      status: 'OPEN',
      priority: 'HIGH',
      currency: 'NGN',
      value: 45000000.0,
      amount: 45000000.0,
      probability: 50,
      expected_close_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      assigned_to: staff1Id,
      created_by: staff1Id,
      notes: 'West Africa logistics hub upgrade proposal.',
    },
  ];

  for (const d of deals) {
    const { error } = await supabase.from('deals').upsert(d as any, { onConflict: 'id' });
    if (error) console.warn(`  ⚠ Deal warning for ${d.title}:`, error.message);
  }
  console.log(`  ✔ ${deals.length} Deal records seeded.`);

  // 6. Tasks & Interactions
  console.log('\n[6/7] Seeding Tasks & Customer Interactions...');
  const tasks = [
    {
      task_number: 'TASK-000001',
      title: 'Legal Contract Review Follow-up',
      description: 'Check in with Apex Logistics legal counsel regarding indemnification clause.',
      task_type: 'FOLLOW_UP',
      priority: 'URGENT',
      status: 'PENDING',
      due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      customer_id: '11111111-1111-1111-1111-111111111101',
      deal_id: '33333333-3333-3333-3333-333333333301',
      assigned_to: staff1Id,
      created_by: staff1Id,
    },
    {
      task_number: 'TASK-000002',
      title: 'Security Questionnaire Response',
      description: 'Send SOC2 compliance package to Strata Retail security team.',
      task_type: 'TODO',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      lead_id: '22222222-2222-2222-2222-222222222202',
      deal_id: '33333333-3333-3333-3333-333333333302',
      assigned_to: staff2Id,
      created_by: staff2Id,
    },
    {
      task_number: 'TASK-000003',
      title: 'Discovery Call Preparation',
      description: 'Prepare slide deck tailored for Skyline Cloud Solutions infrastructure.',
      task_type: 'MEETING',
      priority: 'MEDIUM',
      status: 'PENDING',
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      lead_id: '22222222-2222-2222-2222-222222222203',
      assigned_to: staff1Id,
      created_by: staff1Id,
    },
    {
      task_number: 'TASK-000004',
      title: 'Send Onboarding Welcome Kit',
      description: 'Email welcome onboarding packet and developer API keys to NovaFin.',
      task_type: 'EMAIL',
      priority: 'HIGH',
      status: 'COMPLETED',
      due_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      completed_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      customer_id: '11111111-1111-1111-1111-111111111103',
      deal_id: '33333333-3333-3333-3333-333333333304',
      assigned_to: staff2Id,
      created_by: staff2Id,
    },
  ];

  for (const t of tasks) {
    const { error } = await supabase.from('tasks').upsert(t as any, { onConflict: 'task_number' });
    if (error) console.warn(`  ⚠ Task warning for ${t.title}:`, error.message);
  }

  const interactions = [
    {
      interaction_number: 'INT-000001',
      customer_id: '11111111-1111-1111-1111-111111111101',
      deal_id: '33333333-3333-3333-3333-333333333301',
      type: 'MEETING',
      subject: 'Executive Alignment Sync',
      description: 'Discussed rollout timeline and implementation milestones with David Miller.',
      notes: 'Discussed rollout timeline and implementation milestones with David Miller.',
      performed_by: staff1Id,
      performed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      interaction_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      duration_minutes: 45,
      outcome: 'Aligned on SLA requirements; legal review underway.',
    },
    {
      interaction_number: 'INT-000002',
      lead_id: '22222222-2222-2222-2222-222222222201',
      type: 'CALL',
      subject: 'Technical Architecture Review',
      description: '30-minute call with Rachel Adams. Confirmed API compatibility.',
      notes: '30-minute call with Rachel Adams. Confirmed API compatibility.',
      performed_by: staff1Id,
      performed_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      interaction_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      duration_minutes: 30,
      outcome: 'Lead qualified; scheduling product demo.',
    },
    {
      interaction_number: 'INT-000003',
      customer_id: '11111111-1111-1111-1111-111111111103',
      deal_id: '33333333-3333-3333-3333-333333333304',
      type: 'MEETING',
      subject: 'Contract Signing & Kickoff Meeting',
      description: 'Executive signing ceremony with NovaFin CFO and IT directors.',
      notes: 'Executive signing ceremony with NovaFin CFO and IT directors.',
      performed_by: staff2Id,
      performed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      interaction_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      duration_minutes: 60,
      outcome: 'Deal closed won; passed to customer success.',
    },
  ];

  for (const i of interactions) {
    const { error } = await supabase.from('interactions').upsert(i as any, { onConflict: 'interaction_number' });
    if (error) console.warn(`  ⚠ Interaction warning for ${i.subject}:`, error.message);
  }
  console.log('  ✔ Tasks and Touchpoints seeded.');

  // 7. Notifications
  console.log('\n[7/7] Seeding Notifications...');
  const notifications = [
    {
      user_id: staff1Id,
      title: 'New High-Value Lead Assigned',
      message: 'Rachel Adams (Beacon Robotics - $65,000 est.) was assigned to you by Sarah Chen.',
      type: 'ASSIGNMENT',
      is_read: false,
      link_url: '/staff/leads',
    },
    {
      user_id: staff1Id,
      title: 'Contract Review Pending',
      message: 'Apex Logistics deal is nearing expected close date.',
      type: 'DEAL_UPDATE',
      is_read: false,
      link_url: '/staff/deals',
    },
    {
      user_id: staff2Id,
      title: 'Security Review Action Item',
      message: 'Task "Security Questionnaire Response" is due in 2 days.',
      type: 'TASK_DUE',
      is_read: false,
      link_url: '/staff/tasks',
    },
  ];

  for (const n of notifications) {
    await supabase.from('notifications').insert(n as any);
  }
  console.log('  ✔ In-App Notifications seeded.');

  console.log('\n================================================================');
  console.log('                 DATABASE SEEDING SUCCESSFUL!                   ');
  console.log('================================================================');
  console.log('\nDemo User Accounts (Password: Password123!):');
  console.log('  1. ADMIN: Sarah Chen   -> admin@enterprise.com');
  console.log('  2. STAFF: Marcus Vance -> marcus.vance@enterprise.com');
  console.log('  3. STAFF: Elena Rostova-> elena.rostova@enterprise.com');
  console.log('================================================================\n');
}

seed().catch((err) => {
  console.error('\n\x1b[31mSeeding failed:\x1b[0m', err.message);
  process.exit(1);
});

import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).max(255),
  company_name: z.string().max(255).optional().nullable(),
  email: z.string().email({ message: 'Valid email required' }).optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().url({ message: 'Valid URL required' }).optional().nullable().or(z.literal('')),
  industry: z.string().max(100).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CHURNED', 'PROSPECT']).default('ACTIVE'),
  lifetime_value: z.coerce.number().min(0).default(0),
  address_street: z.string().max(255).optional().nullable(),
  address_city: z.string().max(100).optional().nullable(),
  address_state: z.string().max(100).optional().nullable(),
  address_country: z.string().max(100).default('United States'),
  address_zip: z.string().max(20).optional().nullable(),
  notes: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const leadSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }).max(100),
  last_name: z.string().min(1, { message: 'Last name is required' }).max(100),
  company: z.string().max(255).optional().nullable(),
  job_title: z.string().max(100).optional().nullable(),
  email: z.string().email({ message: 'Valid email required' }).optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'LOST', 'CONVERTED']).default('NEW'),
  source: z.enum(['WEBSITE', 'REFERRAL', 'COLD_CALL', 'LINKEDIN', 'CAMPAIGN', 'EVENT', 'OTHER']).default('WEBSITE'),
  estimated_value: z.coerce.number().min(0).default(0),
  confidence_score: z.coerce.number().min(0).max(100).default(50),
  notes: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
});

export const dealSchema = z.object({
  title: z.string().min(2, { message: 'Deal title is required' }).max(255),
  customer_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  stage: z.enum(['DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).default('DISCOVERY'),
  amount: z.coerce.number().min(0, { message: 'Amount must be positive' }).default(0),
  probability: z.coerce.number().min(0).max(100).default(20),
  expected_close_date: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const taskSchema = z.object({
  title: z.string().min(2, { message: 'Task title is required' }).max(255),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  customer_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid({ message: 'Task must be assigned to a staff member' }),
});

export const interactionSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  lead_id: z.string().uuid().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK_UPDATE']).default('NOTE'),
  subject: z.string().min(2, { message: 'Subject is required' }).max(255),
  notes: z.string().min(2, { message: 'Interaction note/content is required' }),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type InteractionInput = z.infer<typeof interactionSchema>;

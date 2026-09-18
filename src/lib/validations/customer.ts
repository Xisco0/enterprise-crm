import { z } from 'zod';

export const customerInputSchema = z.object({
  // Basic Information
  first_name: z.string().min(1, 'First name is required').max(100).trim(),
  last_name: z.string().min(1, 'Last name is required').max(100).trim(),
  email: z
    .string()
    .email('Please provide a valid email address')
    .max(255)
    .toLowerCase()
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string().max(50).trim().optional().nullable().or(z.literal('')),

  // Business Information
  customer_type: z.enum(['INDIVIDUAL', 'BUSINESS']).default('BUSINESS'),
  company_name: z.string().max(255).trim().optional().nullable().or(z.literal('')),
  job_title: z.string().max(100).trim().optional().nullable().or(z.literal('')),
  industry: z.string().max(100).trim().optional().nullable().or(z.literal('')),
  website: z
    .string()
    .url('Please provide a valid URL (e.g. https://company.com)')
    .max(255)
    .optional()
    .nullable()
    .or(z.literal('')),

  // Status & Financials
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'CHURNED', 'PROSPECT']).default('ACTIVE'),
  lifetime_value: z.coerce.number().min(0, 'Lifetime value cannot be negative').default(0),

  // Address
  address_street: z.string().max(255).trim().optional().nullable().or(z.literal('')),
  address_city: z.string().max(100).trim().optional().nullable().or(z.literal('')),
  address_state: z.string().max(100).trim().optional().nullable().or(z.literal('')),
  address_country: z.string().max(100).trim().default('United States'),
  address_zip: z.string().max(20).trim().optional().nullable().or(z.literal('')),

  // Assignment & Ownership
  assigned_to: z.string().uuid('Please select a valid staff member').optional().nullable().or(z.literal('')),

  // Notes
  notes: z.string().max(3000, 'Notes cannot exceed 3000 characters').optional().nullable().or(z.literal('')),
});

export const customerFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'CHURNED', 'PROSPECT', 'ALL']).optional().default('ALL'),
  type: z.enum(['INDIVIDUAL', 'BUSINESS', 'ALL']).optional().default('ALL'),
  assigned_to: z.string().optional().default('ALL'),
  sort_by: z.enum(['created_at', 'name', 'company_name', 'customer_number', 'lifetime_value']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type CustomerFilter = z.infer<typeof customerFilterSchema>;

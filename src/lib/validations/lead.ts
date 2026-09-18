import { z } from 'zod';

export const leadInputSchema = z.object({
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

  // Classification & Sourcing
  lead_type: z.enum(['INDIVIDUAL', 'BUSINESS']).default('BUSINESS'),
  company_name: z.string().max(255).trim().optional().nullable().or(z.literal('')),
  job_title: z.string().max(100).trim().optional().nullable().or(z.literal('')),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'PROPOSAL', 'LOST', 'CONVERTED'])
    .default('NEW'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  source: z
    .enum([
      'WEBSITE',
      'REFERRAL',
      'COLD_CALL',
      'LINKEDIN',
      'CAMPAIGN',
      'EVENT',
      'SOCIAL_MEDIA',
      'ADVERTISEMENT',
      'PHONE_CALL',
      'WALK_IN',
      'OTHER',
    ])
    .default('WEBSITE'),

  // Financial & Qualification Metrics
  estimated_value: z.coerce.number().min(0, 'Estimated value cannot be negative').default(0),
  confidence_score: z.coerce
    .number()
    .min(0, 'Confidence score cannot be less than 0%')
    .max(100, 'Confidence score cannot exceed 100%')
    .default(50),

  // Assignment & Ownership
  assigned_to: z.string().uuid('Please select a valid staff member').optional().nullable().or(z.literal('')),

  // Notes & Background Context
  notes: z.string().max(3000, 'Notes cannot exceed 3000 characters').optional().nullable().or(z.literal('')),
});

export const leadFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'PROPOSAL', 'LOST', 'CONVERTED', 'ALL'])
    .optional()
    .default('ALL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ALL']).optional().default('ALL'),
  type: z.enum(['INDIVIDUAL', 'BUSINESS', 'ALL']).optional().default('ALL'),
  source: z
    .enum([
      'WEBSITE',
      'REFERRAL',
      'COLD_CALL',
      'LINKEDIN',
      'CAMPAIGN',
      'EVENT',
      'SOCIAL_MEDIA',
      'ADVERTISEMENT',
      'PHONE_CALL',
      'WALK_IN',
      'OTHER',
      'ALL',
    ])
    .optional()
    .default('ALL'),
  assigned_to: z.string().optional().default('ALL'),
  sort_by: z
    .enum(['created_at', 'first_name', 'company_name', 'lead_number', 'estimated_value', 'confidence_score'])
    .optional()
    .default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
export type LeadFilter = z.infer<typeof leadFilterSchema>;

import { z } from 'zod';

export const dealInputSchema = z.object({
  // Basic Opportunity Information
  title: z.string().min(1, 'Deal title is required').max(255).trim(),
  description: z.string().max(3000, 'Description cannot exceed 3000 characters').optional().nullable().or(z.literal('')),
  
  // Relational Links
  customer_id: z.string().uuid('Please select a valid customer account'),
  lead_id: z.string().uuid('Invalid lead reference').optional().nullable().or(z.literal('')),

  // Financial Value & Currency
  value: z.coerce.number().min(0, 'Deal value cannot be negative').default(0),
  currency: z.enum(['USD', 'NGN', 'EUR', 'GBP']).default('USD'),

  // Pipeline & Progression
  stage: z.enum(['NEW', 'QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).default('NEW'),
  status: z.enum(['OPEN', 'WON', 'LOST']).default('OPEN'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  probability: z.coerce.number().min(0, 'Probability cannot be less than 0%').max(100, 'Probability cannot exceed 100%').default(20),

  // Timeline & Assignment
  expected_close_date: z.string().optional().nullable().or(z.literal('')),
  assigned_to: z.string().uuid('Please select a valid staff member').optional().nullable().or(z.literal('')),

  // Notes & Closure Details
  notes: z.string().max(3000, 'Notes cannot exceed 3000 characters').optional().nullable().or(z.literal('')),
  lost_reason: z.string().max(500, 'Loss reason cannot exceed 500 characters').optional().nullable().or(z.literal('')),
});

export const dealFilterSchema = z.object({
  search: z.string().optional(),
  stage: z.enum(['NEW', 'QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST', 'ALL']).optional().default('ALL'),
  status: z.enum(['OPEN', 'WON', 'LOST', 'ALL']).optional().default('ALL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ALL']).optional().default('ALL'),
  currency: z.enum(['USD', 'NGN', 'EUR', 'GBP', 'ALL']).optional().default('ALL'),
  assigned_to: z.string().optional().default('ALL'),
  customer_id: z.string().optional(),
  sort_by: z.enum(['created_at', 'title', 'deal_number', 'value', 'probability', 'expected_close_date']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const dealStageChangeSchema = z.object({
  stage: z.enum(['NEW', 'QUALIFICATION', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
  lost_reason: z.string().max(500).optional(),
});

export const dealLostReasonSchema = z.object({
  lost_reason: z.string().min(2, 'Please provide a loss reason (min 2 characters)').max(500),
});

export type DealInput = z.infer<typeof dealInputSchema>;
export type DealFilter = z.infer<typeof dealFilterSchema>;
export type DealStageChangeInput = z.infer<typeof dealStageChangeSchema>;
export type DealLostReasonInput = z.infer<typeof dealLostReasonSchema>;

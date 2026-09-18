import { z } from 'zod';

export const interactionInputSchema = z
  .object({
    type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER', 'TASK_UPDATE']).default('NOTE'),
    subject: z.string().trim().min(1, 'Subject is required').max(255, 'Subject cannot exceed 255 characters'),
    description: z.string().trim().max(5000, 'Description cannot exceed 5000 characters').optional().nullable().or(z.literal('')),
    
    // Relational references
    customer_id: z.string().uuid('Invalid customer reference').optional().nullable().or(z.literal('')),
    lead_id: z.string().uuid('Invalid lead reference').optional().nullable().or(z.literal('')),
    deal_id: z.string().uuid('Invalid deal reference').optional().nullable().or(z.literal('')),
    
    // Date/time, duration, and outcome
    interaction_at: z.string().optional().nullable().or(z.literal('')),
    duration_minutes: z.coerce.number().min(0, 'Duration cannot be negative').max(10080, 'Duration cannot exceed 7 days').optional().nullable(),
    outcome: z.string().max(255, 'Outcome cannot exceed 255 characters').optional().nullable().or(z.literal('')),
  })
  .refine(
    (data) => Boolean(data.customer_id || data.lead_id || data.deal_id),
    {
      message: 'An interaction must be linked to at least one Customer, Lead, or Deal context.',
      path: ['customer_id'],
    }
  );

export const interactionFilterSchema = z.object({
  search: z.string().optional(),
  query: z.string().optional(),
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER', 'TASK_UPDATE', 'ALL']).optional().default('ALL'),
  performed_by: z.string().optional().default('ALL'),
  customer_id: z.string().optional(),
  lead_id: z.string().optional(),
  deal_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  sort_by: z.enum(['interaction_at', 'created_at', 'type', 'subject']).optional().default('interaction_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export type InteractionInput = z.infer<typeof interactionInputSchema>;
export type InteractionFilter = z.infer<typeof interactionFilterSchema>;

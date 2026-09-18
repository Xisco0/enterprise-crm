import { z } from 'zod';

export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  task_type: z
    .enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO', 'OTHER'])
    .default('TODO'),
  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .default('PENDING'),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .default('MEDIUM'),
  
  // Scheduling
  due_date: z.string().optional().nullable().or(z.literal('')),
  due_time: z.string().optional().nullable().or(z.literal('')),
  
  // Assignment
  assigned_to: z.string().uuid('Invalid staff assignment').optional().nullable().or(z.literal('')),
  
  // Relational links
  customer_id: z.string().uuid('Invalid customer reference').optional().nullable().or(z.literal('')),
  lead_id: z.string().uuid('Invalid lead reference').optional().nullable().or(z.literal('')),
  deal_id: z.string().uuid('Invalid deal reference').optional().nullable().or(z.literal('')),
});

export const taskFilterSchema = z.object({
  search: z.string().optional(),
  query: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ALL']).optional().default('ALL'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'ALL']).optional().default('ALL'),
  task_type: z.enum(['CALL', 'EMAIL', 'MEETING', 'FOLLOW_UP', 'TODO', 'OTHER', 'ALL']).optional().default('ALL'),
  timeframe: z.enum(['ALL', 'TODAY', 'TOMORROW', 'THIS_WEEK', 'OVERDUE', 'COMPLETED']).optional().default('ALL'),
  assigned_to: z.string().optional().default('ALL'),
  customer_id: z.string().optional(),
  lead_id: z.string().optional(),
  deal_id: z.string().optional(),
  due_date: z.string().optional(),
  sort_by: z.enum(['due_date', 'priority', 'status', 'created_at', 'title']).optional().default('due_date'),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const taskStatusChangeSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().max(1000).optional(),
});

export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
export type TaskStatusChange = z.infer<typeof taskStatusChangeSchema>;

import { 
  Database, 
  UserRole, 
  UserStatus, 
  CustomerType, 
  CustomerStatus, 
  LeadType,
  LeadPriority,
  LeadStatus, 
  LeadSource, 
  DealStage, 
  DealStatus,
  DealPriority,
  DealCurrency,
  InteractionType, 
  TaskType,
  TaskPriority, 
  TaskStatus, 
  NotificationType 
} from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type Deal = Database['public']['Tables']['deals']['Row'];
export type Interaction = Database['public']['Tables']['interactions']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

// Extended View Models with joined relational data
export interface CustomerWithAssignee extends Customer {
  assignee?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'avatar_url'> | null;
  creator?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email'> | null;
}

export interface LeadWithAssignee extends Lead {
  assignee?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'avatar_url'> | null;
  creator?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email'> | null;
}

export interface DealWithDetails extends Deal {
  customer?: (Pick<Customer, 'id' | 'name' | 'company_name' | 'customer_number'> & Partial<Pick<Customer, 'email' | 'phone'>>) | null;
  lead?: (Pick<Lead, 'id' | 'first_name' | 'last_name'> & Partial<Pick<Lead, 'company_name' | 'company' | 'lead_number'>>) | null;
  assignee?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'avatar_url'> | null;
  creator?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email'> | null;
}

export interface TaskWithDetails extends Task {
  customer?: (Pick<Customer, 'id' | 'name' | 'company_name' | 'customer_number'> & Partial<Pick<Customer, 'email' | 'phone'>>) | null;
  lead?: (Pick<Lead, 'id' | 'first_name' | 'last_name'> & Partial<Pick<Lead, 'company_name' | 'company' | 'lead_number'>>) | null;
  deal?: (Pick<Deal, 'id' | 'title'> & Partial<Pick<Deal, 'deal_number' | 'value' | 'currency'>>) | null;
  assignee?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'avatar_url'> | null;
  creator?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email'> | null;
  completer?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email'> | null;
}

export interface TaskFiltersParams {
  search?: string;
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  task_type?: TaskType | 'ALL';
  assigned_to?: string | 'ALL';
  timeframe?: 'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'OVERDUE' | 'COMPLETED';
  customer_id?: string;
  lead_id?: string;
  deal_id?: string;
  due_date?: string;
  sort_by?: 'due_date' | 'priority' | 'status' | 'created_at' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskMetricsSummary {
  totalTasks: number;
  dueTodayCount: number;
  overdueCount: number;
  inProgressCount: number;
  completedThisWeekCount: number;
  urgentCount: number;
}

export interface InteractionWithPerformer extends Interaction {
  performer?: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'avatar_url'> | null;
  customer?: (Pick<Customer, 'id' | 'name' | 'company_name' | 'customer_number'> & Partial<Pick<Customer, 'email' | 'phone'>>) | null;
  lead?: (Pick<Lead, 'id' | 'first_name' | 'last_name'> & Partial<Pick<Lead, 'company_name' | 'company' | 'lead_number'>>) | null;
  deal?: (Pick<Deal, 'id' | 'title'> & Partial<Pick<Deal, 'deal_number' | 'value' | 'currency' | 'stage'>>) | null;
}

export interface InteractionFiltersParams {
  search?: string;
  type?: InteractionType | 'ALL';
  performed_by?: string | 'ALL';
  customer_id?: string;
  lead_id?: string;
  deal_id?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: 'interaction_at' | 'created_at' | 'type' | 'subject';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TimelineItem {
  id: string;
  number?: string;
  type: InteractionType | 'STAGE_CHANGE' | 'LEAD_CONVERTED' | 'STATUS_CHANGE';
  category: 'INTERACTION' | 'SYSTEM_EVENT';
  title: string;
  description?: string | null;
  timestamp: string;
  performerName?: string;
  performerAvatar?: string | null;
  durationMinutes?: number | null;
  outcome?: string | null;
  metadata?: Record<string, any>;
}

// Summary Metrics Models
export interface DashboardMetrics {
  totalRevenue: number;
  activeDealsCount: number;
  pipelineValue: number;
  totalCustomersCount: number;
  newLeadsCount: number;
  conversionRate: number;
  pendingTasksCount: number;
  urgentTasksCount: number;
}

export interface StaffDashboardMetrics {
  myActiveLeadsCount: number;
  myDealsValue: number;
  myActiveDealsCount: number;
  myPendingTasksCount: number;
  myUrgentTasksCount: number;
  myCustomersCount: number;
}

export interface CurrencyPipelineSummary {
  currency: string;
  totalValue: number;
  count: number;
}

export interface StaffWorkloadSummary {
  staffId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  activeLeadsCount: number;
  openDealsCount: number;
  openDealsValueUSD: number;
  pendingTasksCount: number;
  overdueTasksCount: number;
}

export interface AdminDashboardData {
  totalCustomers: number;
  activeCustomers: number;
  activeLeads: number;
  openDealsCount: number;
  pipelineByCurrency: CurrencyPipelineSummary[];
  wonDealsThisMonth: { count: number; totalValue: number; currency: string };
  lostDealsThisMonth: { count: number; totalValue: number; currency: string };
  taskWorkload: {
    pendingCount: number;
    inProgressCount: number;
    overdueCount: number;
    completedThisWeekCount: number;
  };
  pipelineByStage: Array<{
    stage: DealStage;
    count: number;
    totalValue: number;
    currency: string;
  }>;
  staffWorkload: StaffWorkloadSummary[];
  recentActivities: InteractionWithPerformer[];
  recentDeals: DealWithDetails[];
  urgentTasks: TaskWithDetails[];
}

export interface StaffDashboardData {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  myCustomersCount: number;
  myActiveLeadsCount: number;
  myOpenDealsCount: number;
  myPipelineByCurrency: CurrencyPipelineSummary[];
  todayTasksCount: number;
  overdueTasksCount: number;
  completedThisWeekCount: number;
  todayAgendaTasks: TaskWithDetails[];
  myActiveDeals: DealWithDetails[];
  myRecentLeads: LeadWithAssignee[];
  myRecentActivities: InteractionWithPerformer[];
  pipelineByStage: Array<{
    stage: DealStage;
    count: number;
    totalValue: number;
    currency: string;
  }>;
}

export interface CustomerFiltersParams {
  search?: string;
  status?: CustomerStatus | 'ALL';
  type?: CustomerType | 'ALL';
  assigned_to?: string | 'ALL';
  sort_by?: 'created_at' | 'name' | 'company_name' | 'customer_number' | 'lifetime_value';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface LeadFiltersParams {
  search?: string;
  status?: LeadStatus | 'ALL';
  priority?: LeadPriority | 'ALL';
  type?: LeadType | 'ALL';
  source?: LeadSource | 'ALL';
  assigned_to?: string | 'ALL';
  sort_by?: 'created_at' | 'first_name' | 'company_name' | 'lead_number' | 'estimated_value' | 'confidence_score';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface DealFiltersParams {
  search?: string;
  stage?: DealStage | 'ALL';
  status?: DealStatus | 'ALL';
  priority?: DealPriority | 'ALL';
  currency?: string | 'ALL';
  assigned_to?: string | 'ALL';
  customer_id?: string;
  sort_by?: 'created_at' | 'title' | 'deal_number' | 'value' | 'probability' | 'expected_close_date';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PipelineStageSummary {
  stage: DealStage;
  label: string;
  deals: DealWithDetails[];
  totalValue: number;
  count: number;
}

export type {
  UserRole,
  UserStatus,
  CustomerType,
  CustomerStatus,
  LeadType,
  LeadPriority,
  LeadStatus,
  LeadSource,
  DealStage,
  DealStatus,
  DealPriority,
  DealCurrency,
  InteractionType,
  TaskType,
  TaskPriority,
  TaskStatus,
  NotificationType
};

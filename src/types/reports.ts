import { 
  CustomerType, 
  CustomerStatus, 
  LeadType, 
  LeadStatus, 
  LeadSource, 
  LeadPriority, 
  DealStage, 
  DealStatus, 
  TaskType, 
  TaskPriority, 
  TaskStatus, 
  InteractionType, 
  UserRole 
} from './database.types';
import { DateRangePreset } from '@/lib/utils/date-range';

export type ReportTab = 
  | 'overview'
  | 'customers'
  | 'leads'
  | 'deals'
  | 'tasks'
  | 'interactions'
  | 'staff';

export interface ReportFilterParams {
  preset?: DateRangePreset;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  staff_id?: string | 'ALL';
  tab?: ReportTab;
}

export interface CustomerReportData {
  totalCustomers: number;
  newCustomersInPeriod: number;
  activeCustomers: number;
  inactiveCustomers: number;
  churnedCustomers: number;
  byType: Array<{ type: CustomerType; label: string; count: number; percentage: number }>;
  byStatus: Array<{ status: CustomerStatus; label: string; count: number; percentage: number }>;
  growthTimeline: Array<{ date: string; label: string; newCustomers: number; cumulative: number }>;
}

export interface LeadReportData {
  totalLeads: number;
  newLeadsInPeriod: number;
  qualifiedLeads: number;
  convertedLeadsInPeriod: number;
  lostLeadsInPeriod: number;
  conversionRate: number | null; // null if denominator is 0
  byStatus: Array<{ status: LeadStatus; label: string; count: number; percentage: number }>;
  bySource: Array<{ source: LeadSource; label: string; count: number; percentage: number }>;
  byPriority: Array<{ priority: LeadPriority; label: string; count: number; percentage: number }>;
  conversionTimeline: Array<{ date: string; label: string; newLeads: number; convertedLeads: number }>;
}

export interface DealReportData {
  totalDealsCreatedInPeriod: number;
  openDealsCount: number;
  wonDealsInPeriod: number;
  lostDealsInPeriod: number;
  winRate: number | null; // null if won+lost === 0
  pipelineByCurrency: Array<{ currency: string; totalValue: number; count: number }>;
  wonValueByCurrency: Array<{ currency: string; totalValue: number; count: number; averageValue: number }>;
  lostValueByCurrency: Array<{ currency: string; totalValue: number; count: number }>;
  byStage: Array<{ stage: DealStage; label: string; count: number; totalValue: number; currency: string }>;
  lostReasons: Array<{ reason: string; count: number; percentage: number }>;
  wonDealsTimeline: Array<{ date: string; label: string; count: number; totalValue: number; currency: string }>;
}

export interface TaskReportData {
  totalTasksCreatedInPeriod: number;
  tasksCompletedInPeriod: number;
  pendingCount: number;
  inProgressCount: number;
  overdueCount: number;
  cancelledCount: number;
  completionRate: number | null; // null if 0 tasks
  byType: Array<{ type: TaskType; label: string; count: number }>;
  byPriority: Array<{ priority: TaskPriority; label: string; count: number }>;
  completionTimeline: Array<{ date: string; label: string; created: number; completed: number }>;
}

export interface InteractionReportData {
  totalInteractionsInPeriod: number;
  byType: Array<{ type: InteractionType; label: string; count: number; percentage: number }>;
  activityTimeline: Array<{ date: string; label: string; calls: number; emails: number; meetings: number; notes: number; other: number; total: number }>;
  averageDurationMinutes: number | null;
}

export interface StaffWorkloadReportItem {
  staffId: string;
  name: string;
  email: string;
  role: UserRole;
  assignedCustomers: number;
  assignedLeads: number;
  openDeals: number;
  openDealsValueUSD: number;
  openTasks: number;
  completedTasksInPeriod: number;
  interactionsInPeriod: number;
}

export interface CompleteReportData {
  metadata: {
    startDateStr: string;
    endDateStr: string;
    label: string;
    preset: DateRangePreset;
    selectedStaffId: string | 'ALL';
    userRole: UserRole;
    generatedAt: string;
  };
  customers: CustomerReportData;
  leads: LeadReportData;
  deals: DealReportData;
  tasks: TaskReportData;
  interactions: InteractionReportData;
  staffWorkload?: StaffWorkloadReportItem[]; // Admin-only
}

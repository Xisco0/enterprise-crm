import { 
  UserRole, 
  CustomerStatus, 
  LeadPriority,
  LeadStatus, 
  LeadSource, 
  DealStage, 
  DealStatus,
  DealPriority,
  DealCurrency,
  TaskType,
  TaskPriority, 
  TaskStatus, 
  InteractionType 
} from '@/types/database.types';

export const APP_NAME = 'Enterprise CRM';
export const APP_DESCRIPTION = 'Production-grade enterprise customer relationship management system';

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  NEW: { label: 'New', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  CONTACTED: { label: 'Contacted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  QUALIFIED: { label: 'Qualified', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  UNQUALIFIED: { label: 'Unqualified', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  PROPOSAL: { label: 'Proposal Sent', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  LOST: { label: 'Lost', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  CONVERTED: { label: 'Converted', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

export const LEAD_PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  HIGH: { label: 'High', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
};

export const LEAD_SOURCE_CONFIG: Record<LeadSource, { label: string }> = {
  WEBSITE: { label: 'Website' },
  REFERRAL: { label: 'Referral' },
  COLD_CALL: { label: 'Cold Call' },
  LINKEDIN: { label: 'LinkedIn' },
  CAMPAIGN: { label: 'Marketing Campaign' },
  EVENT: { label: 'Event / Conference' },
  SOCIAL_MEDIA: { label: 'Social Media' },
  ADVERTISEMENT: { label: 'Paid Advertisement' },
  PHONE_CALL: { label: 'Inbound Phone Call' },
  WALK_IN: { label: 'Walk In' },
  OTHER: { label: 'Other' },
};

export const DEAL_STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string; border: string; defaultProbability: number }> = {
  NEW: { label: 'New Opportunity', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', defaultProbability: 10 },
  QUALIFICATION: { label: 'Qualification', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', defaultProbability: 25 },
  DISCOVERY: { label: 'Discovery', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', defaultProbability: 40 },
  PROPOSAL: { label: 'Proposal Sent', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200', defaultProbability: 60 },
  NEGOTIATION: { label: 'Negotiation', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', defaultProbability: 80 },
  CLOSED_WON: { label: 'Closed Won', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', defaultProbability: 100 },
  CLOSED_LOST: { label: 'Closed Lost', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', defaultProbability: 0 },
};

export const DEAL_STATUS_CONFIG: Record<DealStatus, { label: string; color: string; bg: string; border: string }> = {
  OPEN: { label: 'Open', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  WON: { label: 'Won', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  LOST: { label: 'Lost', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

export const DEAL_PRIORITY_CONFIG: Record<DealPriority, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  HIGH: { label: 'High', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
};

export const CURRENCY_CONFIG: Record<DealCurrency, { symbol: string; label: string; format: string }> = {
  NGN: { symbol: '₦', label: 'NGN (₦)', format: 'en-NG' },
  USD: { symbol: '₦', label: 'NGN (₦)', format: 'en-NG' },
  EUR: { symbol: '€', label: 'EUR (€)', format: 'de-DE' },
  GBP: { symbol: '£', label: 'GBP (£)', format: 'en-GB' },
};

export const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string; bg: string; border: string }> = {
  ACTIVE: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  INACTIVE: { label: 'Inactive', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  ARCHIVED: { label: 'Archived', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' },
  CHURNED: { label: 'Churned', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  PROSPECT: { label: 'Prospect', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  HIGH: { label: 'High', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  URGENT: { label: 'Urgent', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

export const TASK_TYPE_CONFIG: Record<
  TaskType,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  CALL: {
    label: 'Call',
    icon: 'Phone',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  EMAIL: {
    label: 'Email',
    icon: 'Mail',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  MEETING: {
    label: 'Meeting',
    icon: 'Users',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  FOLLOW_UP: {
    label: 'Follow-up',
    icon: 'CalendarCheck',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  TODO: {
    label: 'To-do',
    icon: 'CheckSquare',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  OTHER: {
    label: 'Other',
    icon: 'Activity',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

export const INTERACTION_TYPE_CONFIG: Record<
  InteractionType,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  CALL: {
    label: 'Call',
    icon: 'Phone',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  EMAIL: {
    label: 'Email',
    icon: 'Mail',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  MEETING: {
    label: 'Meeting',
    icon: 'Users',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  NOTE: {
    label: 'Note',
    icon: 'FileText',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  OTHER: {
    label: 'Other',
    icon: 'Activity',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  TASK_UPDATE: {
    label: 'Task Update',
    icon: 'CheckSquare',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
};

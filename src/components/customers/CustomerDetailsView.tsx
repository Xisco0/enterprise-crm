'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerWithAssignee, InteractionWithPerformer, TaskWithDetails } from '@/types/crm';
import { toggleCustomerStatus, archiveCustomer } from '@/lib/actions/customers';
import { ActivityTimeline } from '@/components/interactions/ActivityTimeline';
import { EntityTasksCard } from '@/components/tasks/EntityTasksCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Shield, 
  Calendar, 
  Edit, 
  Archive, 
  ArrowLeft,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { CUSTOMER_STATUS_CONFIG } from '@/lib/constants';

interface CustomerDetailsViewProps {
  customer: CustomerWithAssignee;
  basePath: '/admin/customers' | '/staff/customers';
  canManageStatus?: boolean;
  initialInteractions?: InteractionWithPerformer[];
  initialTasks?: TaskWithDetails[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function CustomerDetailsView({
  customer,
  basePath,
  canManageStatus = true,
  initialInteractions = [],
  initialTasks = [],
  currentUserId = '',
  currentUserRole = 'STAFF',
}: CustomerDetailsViewProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(customer.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statusConfig = CUSTOMER_STATUS_CONFIG[currentStatus] || {
    label: currentStatus,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  async function handleStatusToggle(newStatus: any) {
    setIsUpdating(true);
    setFeedback(null);
    try {
      const res = await toggleCustomerStatus(customer.id, newStatus);
      if (res.error) {
        setFeedback(res.error);
      } else {
        setCurrentStatus(newStatus);
        setFeedback(`Status updated to ${newStatus}`);
        router.refresh();
      }
    } catch {
      setFeedback('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers Directory
        </Link>
        <div className="flex items-center gap-2">
          {canManageStatus && currentStatus !== 'ARCHIVED' && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
              onClick={() => handleStatusToggle('ARCHIVED')}
              disabled={isUpdating}
            >
              <Archive className="w-3.5 h-3.5 mr-1" /> Archive Record
            </Button>
          )}

          {canManageStatus && currentStatus === 'ARCHIVED' && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              onClick={() => handleStatusToggle('ACTIVE')}
              disabled={isUpdating}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Restore to Active
            </Button>
          )}

          <Link href={`${basePath}/${customer.id}/edit`}>
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
              <Edit className="w-3.5 h-3.5 mr-1" /> Edit Customer
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-xs text-slate-800 border border-slate-200 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Account Hero Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm">
              {customer.customer_type === 'BUSINESS' ? (
                <Building2 className="w-6 h-6 text-brand-400" />
              ) : (
                <User className="w-6 h-6 text-brand-400" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {customer.customer_number || 'CUS-000000'}
                </span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {customer.company_name || customer.name}
                </h1>
                <Badge
                  variant="secondary"
                  className={`text-xs ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                >
                  {statusConfig.label}
                </Badge>
              </div>

              {customer.company_name && (
                <p className="text-xs text-slate-600 mt-1">
                  Primary Contact: <strong className="text-slate-900">{customer.name}</strong>
                  {customer.job_title && <span> ({customer.job_title})</span>}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {customer.email && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span className="flex items-center gap-1 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                  </span>
                )}
                {customer.website && (
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-4 text-right shrink-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Contract Value
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrency(customer.lifetime_value)}
            </div>
            <span className="text-[10px] text-slate-400">Total Account Value</span>
          </div>
        </div>
      </div>

      {/* Grid: 3 Key Context Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Account Ownership & Staff AE */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700" />
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Account Governance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Account Executive</span>
              {customer.assignee ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px]">
                    {customer.assignee.first_name[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">
                      {customer.assignee.first_name} {customer.assignee.last_name}
                    </span>
                    <span className="block text-[11px] text-slate-400">{customer.assignee.email}</span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 italic">Unassigned Account</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[11px]">Created By</span>
              <span className="font-medium text-slate-700">
                {customer.creator ? `${customer.creator.first_name} ${customer.creator.last_name}` : 'System Admin'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Customer Since</span>
              <span className="font-mono text-slate-700">{formatDate(customer.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Business & Industry Details */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-700" />
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Business Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Account Type</span>
              <span className="font-semibold text-slate-800">
                {customer.customer_type === 'BUSINESS' ? 'Corporate Enterprise' : 'Individual Consultant'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Industry Vertical</span>
              <span className="font-medium text-slate-700">{customer.industry || 'General Industry'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Last Updated</span>
              <span className="font-mono text-slate-700">{formatDateTime(customer.updated_at)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Physical Address */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-700" />
              <CardTitle className="text-xs uppercase tracking-wider text-slate-500">Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            {customer.address_street || customer.address_city ? (
              <div className="space-y-1 text-slate-700">
                {customer.address_street && <p className="font-medium">{customer.address_street}</p>}
                <p>
                  {[customer.address_city, customer.address_state, customer.address_zip]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                <p className="text-slate-500">{customer.address_country || 'United States'}</p>
              </div>
            ) : (
              <span className="text-slate-400 italic text-[11px]">No physical address recorded</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Internal Account Notes */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm">Internal Account Notes & Directives</CardTitle>
          <CardDescription>Private account details accessible only by authorized team members.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
          {customer.notes || 'No specific notes recorded for this customer account.'}
        </CardContent>
      </Card>

      {/* Tasks & Scheduled Follow-ups */}
      <EntityTasksCard
        customerId={customer.id}
        customerName={customer.company_name || customer.name}
        tasks={initialTasks}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

      {/* Interactions & Activity Timeline */}
      <ActivityTimeline
        customerId={customer.id}
        customerName={customer.company_name || customer.name}
        interactions={initialInteractions}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}

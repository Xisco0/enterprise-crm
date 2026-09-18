'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeadWithAssignee, InteractionWithPerformer, TaskWithDetails } from '@/types/crm';
import { deleteLead } from '@/lib/actions/leads';
import { ConvertLeadModal } from '@/components/leads/ConvertLeadModal';
import { ActivityTimeline } from '@/components/interactions/ActivityTimeline';
import { EntityTasksCard } from '@/components/tasks/EntityTasksCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  DollarSign,
  Briefcase,
  Flame,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { LEAD_STATUS_CONFIG, LEAD_PRIORITY_CONFIG, LEAD_SOURCE_CONFIG } from '@/lib/constants';

interface LeadDetailsViewProps {
  lead: LeadWithAssignee;
  basePath: '/admin/leads' | '/staff/leads';
  isAdmin?: boolean;
  initialInteractions?: InteractionWithPerformer[];
  initialTasks?: TaskWithDetails[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function LeadDetailsView({
  lead,
  basePath,
  isAdmin = false,
  initialInteractions = [],
  initialTasks = [],
  currentUserId = '',
  currentUserRole = 'STAFF',
}: LeadDetailsViewProps) {
  const router = useRouter();
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = LEAD_STATUS_CONFIG[lead.status] || {
    label: lead.status,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  const priorityConfig = LEAD_PRIORITY_CONFIG[lead.priority] || {
    label: lead.priority,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  const sourceConfig = LEAD_SOURCE_CONFIG[lead.source] || { label: lead.source };
  const isConverted = lead.status === 'CONVERTED';

  async function handleDelete() {
    if (!confirm('Are you sure you want to permanently delete this lead record?')) return;
    setIsDeleting(true);
    try {
      const res = await deleteLead(lead.id);
      if (res.success) {
        router.push(basePath);
        router.refresh();
      }
    } catch {
      alert('Failed to delete lead');
      setIsDeleting(false);
    }
  }

  // Pipeline lifecycle steps
  const pipelineSteps = [
    { key: 'NEW', label: 'New' },
    { key: 'CONTACTED', label: 'Contacted' },
    { key: 'QUALIFIED', label: 'Qualified' },
    { key: 'CONVERTED', label: 'Converted' },
  ];

  const currentStepIdx =
    lead.status === 'LOST' || lead.status === 'UNQUALIFIED'
      ? -1
      : pipelineSteps.findIndex((s) => s.key === lead.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads Pipeline
        </Link>
        <div className="flex items-center gap-2">
          {!isConverted && (
            <>
              <Button
                size="sm"
                onClick={() => setIsConvertModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Convert to Customer
              </Button>
              <Link href={`${basePath}/${lead.id}/edit`}>
                <Button variant="outline" size="sm" className="text-xs text-slate-700">
                  <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Lead
                </Button>
              </Link>
            </>
          )}

          {isConverted && lead.converted_customer_id && (
            <Link
              href={
                basePath.startsWith('/admin')
                  ? `/admin/customers/${lead.converted_customer_id}`
                  : `/staff/customers/${lead.converted_customer_id}`
              }
            >
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> View Linked Customer Account
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {lead.lead_number || 'LEAD-000000'}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
              >
                {statusConfig.label}
              </Badge>
              <Badge
                variant="secondary"
                className={`text-xs font-semibold ${priorityConfig.bg} ${priorityConfig.color} border ${priorityConfig.border}`}
              >
                {priorityConfig.label} Priority
              </Badge>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {lead.first_name} {lead.last_name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {lead.company_name || lead.company || 'Individual Prospect'}
              </span>
              {lead.job_title && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {lead.job_title}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Source: {sourceConfig.label}
              </span>
            </div>
          </div>

          {/* Value Stat Callout */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3.5 md:min-w-[200px] justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Opportunity Value
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {formatCurrency(lead.estimated_value)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium text-slate-500">Win Confidence</div>
              <div className="text-sm font-bold text-amber-600 flex items-center justify-end gap-1">
                <Flame className="w-3.5 h-3.5" />
                {lead.confidence_score}%
              </div>
            </div>
          </div>
        </div>

        {/* Converted Success Banner */}
        {isConverted && (
          <div className="mt-5 rounded-lg border border-teal-200 bg-teal-50/60 p-3.5 text-xs text-teal-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                This lead has been successfully converted into an active customer account.
                {lead.converted_at && ` Converted on ${formatDateTime(lead.converted_at)}.`}
              </span>
            </div>
            {lead.converted_customer_id && (
              <Link
                href={
                  basePath.startsWith('/admin')
                    ? `/admin/customers/${lead.converted_customer_id}`
                    : `/staff/customers/${lead.converted_customer_id}`
                }
                className="font-semibold text-teal-900 hover:underline flex items-center gap-1 shrink-0 ml-3"
              >
                Go to Customer Profile <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}

        {/* Pipeline Stage Visual Progression */}
        {lead.status !== 'LOST' && lead.status !== 'UNQUALIFIED' && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Lifecycle Stage Progress
            </div>
            <div className="grid grid-cols-4 gap-2">
              {pipelineSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div
                    key={step.key}
                    className={`rounded-md p-2.5 text-center text-xs font-medium border transition-colors ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white font-bold'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid Content Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact & Organization Details */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-500" /> Contact & Entity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-900">{lead.first_name} {lead.last_name}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email Address</span>
              <span className="font-mono text-slate-800">
                {lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-brand-600 hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {lead.email}
                  </a>
                ) : (
                  '—'
                )}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Phone Number</span>
              <span className="font-mono text-slate-800">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="text-slate-700 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {lead.phone}
                  </a>
                ) : (
                  '—'
                )}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Entity Classification</span>
              <Badge variant="outline" className="text-[10px] font-normal">
                {lead.lead_type === 'BUSINESS' ? 'Corporate / Business' : 'Individual Practitioner'}
              </Badge>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Company Name</span>
              <span className="font-medium text-slate-800">{lead.company_name || lead.company || '—'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Role / Position</span>
              <span className="font-medium text-slate-800">{lead.job_title || '—'}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Inbound Channel</span>
              <span className="font-medium text-slate-800">{sourceConfig.label}</span>
            </div>
          </CardContent>
        </Card>

        {/* Ownership & System Metadata */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Ownership & System Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Assigned Account Executive</span>
              <span className="font-medium text-slate-900">
                {lead.assignee ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center text-slate-700">
                      {lead.assignee.first_name[0]}
                    </span>
                    {lead.assignee.first_name} {lead.assignee.last_name}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Created By</span>
              <span className="font-medium text-slate-800">
                {lead.creator ? `${lead.creator.first_name} ${lead.creator.last_name}` : 'System Administrator'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Record Created</span>
              <span className="text-slate-700">{formatDateTime(lead.created_at)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Last Modified</span>
              <span className="text-slate-700">{formatDateTime(lead.updated_at)}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Lead ID</span>
              <span className="font-mono text-[10px] text-slate-400">{lead.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discovery & Internal Notes Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" /> Discovery & Internal Qualification Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {lead.notes ? (
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-100">
              {lead.notes}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No notes recorded for this lead prospect.</p>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Follow-up Tasks */}
      <EntityTasksCard
        leadId={lead.id}
        leadName={`${lead.first_name} ${lead.last_name}`}
        tasks={initialTasks}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

      {/* Activity Timeline */}
      <ActivityTimeline
        leadId={lead.id}
        leadName={`${lead.first_name} ${lead.last_name}`}
        interactions={initialInteractions}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />

      {/* Convert Lead Confirmation Modal */}
      <ConvertLeadModal
        lead={lead}
        basePath={basePath}
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
      />
    </div>
  );
}

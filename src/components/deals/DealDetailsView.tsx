'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DealWithDetails, InteractionWithPerformer, TaskWithDetails } from '@/types/crm';
import { DealStage } from '@/types/database.types';
import { DEAL_STAGE_CONFIG, DEAL_STATUS_CONFIG, DEAL_PRIORITY_CONFIG } from '@/lib/constants';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { changeDealStage, markDealWon, markDealLost } from '@/lib/actions/deals';
import { ActivityTimeline } from '@/components/interactions/ActivityTimeline';
import { EntityTasksCard } from '@/components/tasks/EntityTasksCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkWonModal } from './MarkWonModal';
import { MarkLostModal } from './MarkLostModal';
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Edit,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface DealDetailsViewProps {
  deal: DealWithDetails;
  basePath: '/admin/deals' | '/staff/deals';
  customerBasePath: '/admin/customers' | '/staff/customers';
  leadBasePath: '/admin/leads' | '/staff/leads';
  currentUserId: string;
  currentUserRole?: string;
  initialInteractions?: InteractionWithPerformer[];
  initialTasks?: TaskWithDetails[];
}

const PIPELINE_ORDER: DealStage[] = [
  'NEW',
  'QUALIFICATION',
  'DISCOVERY',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export function DealDetailsView({
  deal,
  basePath,
  customerBasePath,
  leadBasePath,
  currentUserId,
  currentUserRole = 'STAFF',
  initialInteractions = [],
  initialTasks = [],
}: DealDetailsViewProps) {
  const router = useRouter();
  const [isWonModalOpen, setIsWonModalOpen] = React.useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = React.useState(false);
  const [isMovingStage, setIsMovingStage] = React.useState(false);

  const stageConfig = DEAL_STAGE_CONFIG[deal.stage] || {
    label: deal.stage,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  const statusConfig = DEAL_STATUS_CONFIG[deal.status] || {
    label: deal.status,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  const priorityConfig = DEAL_PRIORITY_CONFIG[deal.priority] || {
    label: deal.priority,
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  };

  const dealVal = Number(deal.value || deal.amount || 0);
  const currency = deal.currency || 'USD';
  const expectedWeightedValue = (dealVal * (deal.probability || 0)) / 100;
  const isClosedWon = deal.stage === 'CLOSED_WON' || deal.status === 'WON';
  const isClosedLost = deal.stage === 'CLOSED_LOST' || deal.status === 'LOST';

  const handleStageSelect = async (targetStage: DealStage) => {
    if (targetStage === deal.stage) return;
    if (targetStage === 'CLOSED_WON') {
      setIsWonModalOpen(true);
      return;
    }
    if (targetStage === 'CLOSED_LOST') {
      setIsLostModalOpen(true);
      return;
    }

    setIsMovingStage(true);
    try {
      await changeDealStage(deal.id, targetStage, undefined, currentUserId);
      router.refresh();
    } finally {
      setIsMovingStage(false);
    }
  };

  const handleConfirmWon = async (dealId: string) => {
    await markDealWon(dealId, currentUserId);
    router.refresh();
  };

  const handleConfirmLost = async (dealId: string, lostReason: string) => {
    await markDealLost(dealId, lostReason, currentUserId);
    router.refresh();
  };

  const currentStageIndex = PIPELINE_ORDER.indexOf(deal.stage);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {deal.deal_number}
              </span>
              <Badge
                variant="outline"
                className={`text-xs font-semibold border ${stageConfig.border} ${stageConfig.bg} ${stageConfig.color}`}
              >
                {stageConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs font-semibold border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color}`}
              >
                {statusConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs uppercase font-semibold border ${priorityConfig.border} ${priorityConfig.bg} ${priorityConfig.color}`}
              >
                {priorityConfig.label} Priority
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{deal.title}</h1>
            {deal.description && (
              <p className="text-xs text-slate-600 max-w-3xl">{deal.description}</p>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isClosedWon && !isClosedLost && (
              <>
                <Button
                  size="sm"
                  onClick={() => setIsWonModalOpen(true)}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Mark Won
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLostModalOpen(true)}
                  className="h-8 text-rose-700 border-rose-200 hover:bg-rose-50 text-xs font-semibold"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Mark Lost
                </Button>
              </>
            )}
            <Link href={`${basePath}/${deal.id}/edit`}>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Opportunity
              </Button>
            </Link>
          </div>
        </div>

        {/* Pipeline Stage Stepper Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Sales Pipeline Progression
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
            {PIPELINE_ORDER.map((stageKey, idx) => {
              const isSelected = deal.stage === stageKey;
              const isPassed = !isClosedLost && idx < currentStageIndex && deal.stage !== 'CLOSED_LOST';
              const cfg = DEAL_STAGE_CONFIG[stageKey];

              let cardBg = 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
              if (isSelected) {
                cardBg = 'bg-slate-900 text-white border-slate-900 shadow-xs font-semibold';
              } else if (isPassed) {
                cardBg = 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
              }

              return (
                <button
                  key={stageKey}
                  type="button"
                  disabled={isMovingStage}
                  onClick={() => handleStageSelect(stageKey)}
                  className={`flex flex-col text-left p-2 rounded border transition-all text-xs cursor-pointer ${cardBg}`}
                >
                  <span className="text-[10px] opacity-75 font-mono">{idx + 1}. Stage</span>
                  <span className="truncate font-medium mt-0.5">{cfg?.label || stageKey}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Relations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Financials, Stage Info, and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Overview Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
              Financial & Forecast Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium">Contract Value</span>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {formatCurrency(dealVal, currency)}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Currency: {currency}</span>
              </div>

              <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium">Win Probability</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{deal.probability}%</div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      deal.probability >= 70
                        ? 'bg-emerald-500'
                        : deal.probability >= 40
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200/80">
                <span className="text-xs text-slate-500 font-medium">Weighted Forecast</span>
                <div className="text-lg font-bold text-blue-700 mt-1">
                  {formatCurrency(expectedWeightedValue, currency)}
                </div>
                <span className="text-[10px] text-slate-400">Value × Probability</span>
              </div>
            </div>

            {/* Closure or Loss Callouts */}
            {isClosedWon && (
              <div className="flex items-center gap-3 rounded-md bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">Opportunity Won & Closed</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Closed on {deal.actual_close_date ? new Date(deal.actual_close_date).toLocaleDateString() : '—'}
                    {deal.won_at && ` (Timestamp: ${formatDateTime(deal.won_at)})`}
                  </p>
                </div>
              </div>
            )}

            {isClosedLost && (
              <div className="flex items-start gap-3 rounded-md bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Opportunity Closed Lost</span>
                  <p className="text-xs text-rose-900 font-medium mt-1">
                    Loss Reason: {deal.lost_reason || 'No loss reason recorded.'}
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    Closed on {deal.actual_close_date ? new Date(deal.actual_close_date).toLocaleDateString() : '—'}
                    {deal.lost_at && ` (Timestamp: ${formatDateTime(deal.lost_at)})`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes & Strategy Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
              Collaboration & Opportunity Notes
            </h2>
            {deal.notes ? (
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {deal.notes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No internal notes added yet.</p>
            )}
          </div>

          {/* Opportunity Follow-up Tasks */}
          <EntityTasksCard
            dealId={deal.id}
            dealTitle={deal.title}
            customerId={deal.customer_id || undefined}
            customerName={deal.customer?.company_name || deal.customer?.name}
            leadId={deal.lead_id || undefined}
            leadName={deal.lead ? `${deal.lead.first_name} ${deal.lead.last_name}` : undefined}
            tasks={initialTasks}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />

          {/* Activity Timeline */}
          <ActivityTimeline
            dealId={deal.id}
            dealTitle={deal.title}
            customerId={deal.customer_id || undefined}
            customerName={deal.customer?.company_name || deal.customer?.name}
            leadId={deal.lead_id || undefined}
            leadName={deal.lead ? `${deal.lead.first_name} ${deal.lead.last_name}` : undefined}
            interactions={initialInteractions}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        </div>

        {/* Right 1 Column: Relational Entities & Meta */}
        <div className="space-y-6">
          {/* Customer Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Customer Account
            </h3>
            {deal.customer ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="font-bold text-slate-900">
                    {deal.customer.company_name || deal.customer.name}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  Ref: {deal.customer.customer_number}
                </div>
                {deal.customer.email && (
                  <div className="text-slate-600">{deal.customer.email}</div>
                )}
                {deal.customer.phone && (
                  <div className="text-slate-600">{deal.customer.phone}</div>
                )}
                <div className="pt-2">
                  <Link href={`${customerBasePath}/${deal.customer.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs h-7">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View Customer Account
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No customer account associated.</p>
            )}
          </div>

          {/* Lead Attribution Card */}
          {deal.lead && (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
                Originating Lead
              </h3>
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900">
                  {deal.lead.first_name} {deal.lead.last_name}
                </div>
                {deal.lead.company_name && (
                  <div className="text-slate-600">{deal.lead.company_name}</div>
                )}
                <div className="font-mono text-[11px] text-slate-500">
                  Ref: {deal.lead.lead_number}
                </div>
                <div className="pt-2">
                  <Link href={`${leadBasePath}/${deal.lead.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs h-7">
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View Source Lead
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Timeline & Ownership Meta */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Timeline & Ownership
            </h3>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Assigned Rep:</span>
                <span className="font-semibold text-slate-800">
                  {deal.assignee
                    ? `${deal.assignee.first_name} ${deal.assignee.last_name}`
                    : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Expected Close:</span>
                <span className="font-medium text-slate-800">
                  {deal.expected_close_date
                    ? new Date(deal.expected_close_date).toLocaleDateString()
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-700">{formatDateTime(deal.created_at)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Last Updated:</span>
                <span className="text-slate-700">{formatDateTime(deal.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <MarkWonModal
        deal={deal}
        isOpen={isWonModalOpen}
        onClose={() => setIsWonModalOpen(false)}
        onConfirm={handleConfirmWon}
      />
      <MarkLostModal
        deal={deal}
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DealWithDetails, PipelineStageSummary } from '@/types/crm';
import { DealStage } from '@/types/database.types';
import { DEAL_STAGE_CONFIG, DEAL_STATUS_CONFIG, DEAL_PRIORITY_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { changeDealStage, markDealWon, markDealLost } from '@/lib/actions/deals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkWonModal } from './MarkWonModal';
import { MarkLostModal } from './MarkLostModal';
import {
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  TrendingUp,
} from 'lucide-react';

interface PipelineViewProps {
  pipelineData: PipelineStageSummary[];
  basePath: '/admin/deals' | '/staff/deals';
  currentUserId: string;
}

const STAGES_LIST: DealStage[] = [
  'NEW',
  'QUALIFICATION',
  'DISCOVERY',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export function PipelineView({ pipelineData, basePath, currentUserId }: PipelineViewProps) {
  const router = useRouter();
  const [selectedDealForWon, setSelectedDealForWon] = React.useState<DealWithDetails | null>(null);
  const [selectedDealForLost, setSelectedDealForLost] = React.useState<DealWithDetails | null>(null);
  const [movingDealId, setMovingDealId] = React.useState<string | null>(null);

  const handleQuickMove = async (deal: DealWithDetails, direction: 'prev' | 'next') => {
    const currentIndex = STAGES_LIST.indexOf(deal.stage);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= STAGES_LIST.length) return;

    const targetStage = STAGES_LIST[targetIndex];

    if (targetStage === 'CLOSED_WON') {
      setSelectedDealForWon(deal);
      return;
    }
    if (targetStage === 'CLOSED_LOST') {
      setSelectedDealForLost(deal);
      return;
    }

    setMovingDealId(deal.id);
    try {
      await changeDealStage(deal.id, targetStage, undefined, currentUserId);
      router.refresh();
    } finally {
      setMovingDealId(null);
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

  return (
    <div className="space-y-4">
      {/* Horizontal Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[600px] scrollbar-thin scrollbar-thumb-slate-200">
        {pipelineData.map((stageGroup) => {
          const cfg = DEAL_STAGE_CONFIG[stageGroup.stage] || {
            label: stageGroup.stage,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            border: 'border-slate-200',
          };

          const isClosedWonStage = stageGroup.stage === 'CLOSED_WON';
          const isClosedLostStage = stageGroup.stage === 'CLOSED_LOST';

          return (
            <div
              key={stageGroup.stage}
              className="flex flex-col w-[300px] shrink-0 rounded-lg border border-slate-200/90 bg-slate-50/60 shadow-xs"
            >
              {/* Stage Column Header */}
              <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{stageGroup.label}</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono">
                      {stageGroup.count}
                    </Badge>
                  </div>
                  <Link href={`${basePath}/new`}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-1 flex items-baseline justify-between text-[11px] text-slate-600 font-medium">
                  <span>Total Value:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {formatCurrency(stageGroup.totalValue, 'NGN')}
                  </span>
                </div>
              </div>

              {/* Deals List */}
              <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[700px]">
                {stageGroup.deals.length === 0 ? (
                  <div className="p-4 rounded border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    No deals in this stage
                  </div>
                ) : (
                  stageGroup.deals.map((deal) => {
                    const priorityCfg = DEAL_PRIORITY_CONFIG[deal.priority];
                    const dealVal = Number(deal.value || deal.amount || 0);
                    const isMoving = movingDealId === deal.id;

                    return (
                      <div
                        key={deal.id}
                        className={`rounded-md border border-slate-200 bg-white p-3 shadow-xs hover:border-slate-300 transition-all ${
                          isMoving ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {/* Header: Ref & Priority */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-bold text-slate-500">
                            {deal.deal_number}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] uppercase px-1.5 py-0 border ${priorityCfg.border} ${priorityCfg.bg} ${priorityCfg.color}`}
                          >
                            {priorityCfg.label}
                          </Badge>
                        </div>

                        {/* Title */}
                        <Link
                          href={`${basePath}/${deal.id}`}
                          className="text-xs font-semibold text-slate-900 hover:text-blue-600 block line-clamp-2 transition-colors mb-1"
                        >
                          {deal.title}
                        </Link>

                        {/* Customer */}
                        {deal.customer && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 mb-2 truncate">
                            <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate font-medium">
                              {deal.customer.company_name || deal.customer.name}
                            </span>
                          </div>
                        )}

                        {/* Value & Probability */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-900 font-mono">
                            {formatCurrency(dealVal, deal.currency || 'NGN')}
                          </span>
                          <span className="text-[10px] font-mono font-medium text-slate-500">
                            {deal.probability}% Prob.
                          </span>
                        </div>

                        {/* Card Actions / Quick Stage Shift */}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isClosedLostStage || STAGES_LIST.indexOf(deal.stage) === 0}
                              onClick={() => handleQuickMove(deal, 'prev')}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800"
                              title="Previous stage"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isClosedWonStage || isClosedLostStage}
                              onClick={() => handleQuickMove(deal, 'next')}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800"
                              title="Next stage"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-1">
                            {!isClosedWonStage && !isClosedLostStage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedDealForWon(deal)}
                                  className="h-6 px-1.5 text-[10px] text-emerald-700 hover:bg-emerald-50"
                                  title="Mark as Won"
                                >
                                  Won
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedDealForLost(deal)}
                                  className="h-6 px-1.5 text-[10px] text-rose-700 hover:bg-rose-50"
                                  title="Mark as Lost"
                                >
                                  Lost
                                </Button>
                              </>
                            )}
                            <Link href={`${basePath}/${deal.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-slate-700"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modals */}
      <MarkWonModal
        deal={selectedDealForWon}
        isOpen={Boolean(selectedDealForWon)}
        onClose={() => setSelectedDealForWon(null)}
        onConfirm={handleConfirmWon}
      />
      <MarkLostModal
        deal={selectedDealForLost}
        isOpen={Boolean(selectedDealForLost)}
        onClose={() => setSelectedDealForLost(null)}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
}

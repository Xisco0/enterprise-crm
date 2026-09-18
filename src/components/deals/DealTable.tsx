'use client';

import React from 'react';
import Link from 'next/link';
import { DealWithDetails } from '@/types/crm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { DEAL_STAGE_CONFIG, DEAL_STATUS_CONFIG, DEAL_PRIORITY_CONFIG } from '@/lib/constants';
import {
  Building2,
  User,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Calendar,
  Briefcase,
} from 'lucide-react';

interface DealTableProps {
  deals: DealWithDetails[];
  basePath: '/admin/deals' | '/staff/deals';
  onMarkWon?: (deal: DealWithDetails) => void;
  onMarkLost?: (deal: DealWithDetails) => void;
  onDelete?: (id: string) => void;
}

export function DealTable({ deals, basePath, onMarkWon, onMarkLost, onDelete }: DealTableProps) {
  if (deals.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
        <Briefcase className="h-8 w-8 text-slate-400 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">No deals found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No sales opportunities match your current filter criteria or permissions.
        </p>
        <Link href={`${basePath}/new`} className="mt-4">
          <Button size="sm" className="bg-slate-900 text-white text-xs">
            Create New Deal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead>Deal Ref & Title</TableHead>
            <TableHead>Customer Account</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Value & Probability</TableHead>
            <TableHead>Expected Close</TableHead>
            <TableHead>Assigned Rep</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => {
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
            const isClosedWon = deal.stage === 'CLOSED_WON' || deal.status === 'WON';
            const isClosedLost = deal.stage === 'CLOSED_LOST' || deal.status === 'LOST';

            return (
              <TableRow key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Deal Ref & Title */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      {deal.deal_number || 'DEAL-—'}
                    </span>
                    <Link
                      href={`${basePath}/${deal.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 hover:underline transition-colors mt-0.5"
                    >
                      {deal.title}
                    </Link>
                  </div>
                </TableCell>

                {/* Customer Account */}
                <TableCell>
                  {deal.customer ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-slate-900 font-medium text-xs">
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {deal.customer.company_name || deal.customer.name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {deal.customer.customer_number}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No Customer Linked</span>
                  )}
                </TableCell>

                {/* Stage */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium border ${stageConfig.border} ${stageConfig.bg} ${stageConfig.color}`}
                  >
                    {stageConfig.label}
                  </Badge>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold border ${statusConfig.border} ${statusConfig.bg} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-semibold border ${priorityConfig.border} ${priorityConfig.bg} ${priorityConfig.color}`}
                  >
                    {priorityConfig.label}
                  </Badge>
                </TableCell>

                {/* Value & Probability */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(dealVal, currency)}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
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
                      <span className="text-[10px] font-mono text-slate-500">
                        {deal.probability}%
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Expected Close Date */}
                <TableCell>
                  {deal.expected_close_date ? (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{new Date(deal.expected_close_date).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>

                {/* Assigned Rep */}
                <TableCell>
                  {deal.assignee ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {deal.assignee.first_name} {deal.assignee.last_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {!isClosedWon && !isClosedLost && onMarkWon && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkWon(deal)}
                        className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                        title="Mark as Won"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Won
                      </Button>
                    )}
                    {!isClosedWon && !isClosedLost && onMarkLost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkLost(deal)}
                        className="h-7 px-2 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                        title="Mark as Lost"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Lost
                      </Button>
                    )}
                    <Link href={`${basePath}/${deal.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
                        title="View Deal"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Link href={`${basePath}/${deal.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900"
                        title="Edit Deal"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(deal.id)}
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Deal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

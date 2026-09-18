'use client';

import React from 'react';
import Link from 'next/link';
import { InteractionWithPerformer } from '@/types/crm';
import { INTERACTION_TYPE_CONFIG } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Building2,
  User,
  Briefcase,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Users,
  FileText,
  Activity,
  Plus,
} from 'lucide-react';

interface InteractionTableProps {
  interactions: InteractionWithPerformer[];
  basePath: '/admin/interactions' | '/staff/interactions';
  customerBasePath: '/admin/customers' | '/staff/customers';
  leadBasePath: '/admin/leads' | '/staff/leads';
  dealBasePath: '/admin/deals' | '/staff/deals';
  onEdit?: (interaction: InteractionWithPerformer) => void;
  onDelete?: (id: string) => void;
  onAddClick?: () => void;
}

export function InteractionTable({
  interactions,
  basePath,
  customerBasePath,
  leadBasePath,
  dealBasePath,
  onEdit,
  onDelete,
  onAddClick,
}: InteractionTableProps) {
  if (interactions.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
        <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">No interactions recorded</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No communication or activity logs match your current filter parameters.
        </p>
        {onAddClick && (
          <Button size="sm" onClick={onAddClick} className="mt-4 bg-slate-900 text-white text-xs font-semibold">
            <Plus className="h-3.5 w-3.5 mr-1" /> Record New Activity
          </Button>
        )}
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-3 w-3" />;
      case 'EMAIL':
        return <Mail className="h-3 w-3" />;
      case 'MEETING':
        return <Users className="h-3 w-3" />;
      case 'NOTE':
        return <FileText className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead>Ref & Type</TableHead>
            <TableHead>Subject & Notes</TableHead>
            <TableHead>Related CRM Record</TableHead>
            <TableHead>Outcome / Duration</TableHead>
            <TableHead>Logged By</TableHead>
            <TableHead>Activity Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interactions.map((item) => {
            const cfg = INTERACTION_TYPE_CONFIG[item.type] || {
              label: item.type,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
              border: 'border-slate-200',
            };

            return (
              <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Ref & Type */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {item.interaction_number || 'INT-—'}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase w-fit px-1.5 py-0 border ${cfg.border} ${cfg.bg} ${cfg.color} flex items-center gap-1`}
                    >
                      {getTypeIcon(item.type)}
                      <span>{cfg.label}</span>
                    </Badge>
                  </div>
                </TableCell>

                {/* Subject & Summary */}
                <TableCell className="max-w-[280px]">
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-slate-900 line-clamp-1">
                      {item.subject}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {item.description || item.notes}
                    </span>
                  </div>
                </TableCell>

                {/* Related CRM Record */}
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    {item.customer && (
                      <Link
                        href={`${customerBasePath}/${item.customer.id}`}
                        className="flex items-center gap-1 font-medium text-slate-800 hover:text-blue-600 hover:underline truncate max-w-[180px]"
                      >
                        <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.customer.company_name || item.customer.name}</span>
                      </Link>
                    )}
                    {item.lead && (
                      <Link
                        href={`${leadBasePath}/${item.lead.id}`}
                        className="flex items-center gap-1 font-medium text-slate-800 hover:text-blue-600 hover:underline truncate max-w-[180px]"
                      >
                        <User className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {item.lead.first_name} {item.lead.last_name}
                        </span>
                      </Link>
                    )}
                    {item.deal && (
                      <Link
                        href={`${dealBasePath}/${item.deal.id}`}
                        className="flex items-center gap-1 font-medium text-slate-800 hover:text-blue-600 hover:underline truncate max-w-[180px]"
                      >
                        <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.deal.title}</span>
                      </Link>
                    )}
                  </div>
                </TableCell>

                {/* Outcome & Duration */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {item.outcome ? (
                      <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 w-fit">
                        {item.outcome}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No outcome</span>
                    )}

                    {item.duration_minutes && (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5 text-slate-400" />
                        {item.duration_minutes} mins
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Performer */}
                <TableCell>
                  {item.performer ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {item.performer.first_name} {item.performer.last_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">System</span>
                  )}
                </TableCell>

                {/* Activity Date */}
                <TableCell>
                  <span className="text-xs text-slate-600">
                    {formatDateTime(item.interaction_at || item.created_at)}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                        title="Edit record"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete record"
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

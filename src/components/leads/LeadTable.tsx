'use client';

import React from 'react';
import Link from 'next/link';
import { LeadWithAssignee } from '@/types/crm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { LEAD_STATUS_CONFIG, LEAD_PRIORITY_CONFIG, LEAD_SOURCE_CONFIG } from '@/lib/constants';
import {
  Mail,
  Phone,
  Building2,
  User,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface LeadTableProps {
  leads: LeadWithAssignee[];
  basePath: '/admin/leads' | '/staff/leads';
  onConvert?: (lead: LeadWithAssignee) => void;
  onDelete?: (id: string) => void;
}

export function LeadTable({ leads, basePath, onConvert, onDelete }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
        <User className="h-8 w-8 text-slate-400 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">No leads found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No prospect records match your current search filters or permissions.
        </p>
        <Link href={`${basePath}/new`} className="mt-4">
          <Button size="sm" className="bg-slate-900 text-white text-xs">
            Capture New Lead
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
            <TableHead>Lead Ref & Name</TableHead>
            <TableHead>Company & Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Est. Value & Score</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Assigned Rep</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
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

            return (
              <TableRow key={lead.id} className="hover:bg-slate-50/75">
                {/* Ref & Name */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {lead.lead_number || 'LEAD-000000'}
                    </span>
                    <Link
                      href={`${basePath}/${lead.id}`}
                      className="font-semibold text-xs text-slate-900 hover:text-brand-600 hover:underline"
                    >
                      {lead.first_name} {lead.last_name}
                    </Link>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    {lead.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </span>
                    )}
                    {lead.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Company & Role */}
                <TableCell>
                  <div className="text-xs font-semibold text-slate-800">
                    {lead.company_name || lead.company || '—'}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                      {lead.lead_type === 'BUSINESS' ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" /> Business
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" /> Individual
                        </span>
                      )}
                    </Badge>
                    <span>{lead.job_title || 'Contact'}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-[11px] font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                  >
                    {statusConfig.label}
                  </Badge>
                  {isConverted && lead.converted_customer_id && (
                    <div className="mt-1 text-[10px] text-teal-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Converted
                    </div>
                  )}
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-[11px] font-medium ${priorityConfig.bg} ${priorityConfig.color} border ${priorityConfig.border}`}
                  >
                    {priorityConfig.label}
                  </Badge>
                </TableCell>

                {/* Est Value & Score */}
                <TableCell>
                  <div className="font-mono font-semibold text-slate-900 text-xs">
                    {formatCurrency(lead.estimated_value)}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Flame
                      className={`w-3 h-3 ${lead.confidence_score >= 70 ? 'text-amber-500' : 'text-slate-400'}`}
                    />
                    <span>{lead.confidence_score}% score</span>
                  </div>
                </TableCell>

                {/* Source */}
                <TableCell>
                  <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {sourceConfig.label}
                  </span>
                </TableCell>

                {/* Assigned Rep */}
                <TableCell>
                  {lead.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-700">
                        {lead.assignee.first_name[0]}
                      </div>
                      <div className="text-xs text-slate-700">
                        {lead.assignee.first_name} {lead.assignee.last_name}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Unassigned</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View */}
                    <Link href={`${basePath}/${lead.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600" title="View Lead">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {/* Edit (if not converted) */}
                    {!isConverted && (
                      <Link href={`${basePath}/${lead.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600" title="Edit Lead">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}

                    {/* Convert Button */}
                    {!isConverted && onConvert && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onConvert(lead)}
                        className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 font-medium px-2"
                        title="Convert to Customer"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Convert
                      </Button>
                    )}

                    {/* Converted View Link */}
                    {isConverted && lead.converted_customer_id && (
                      <Link
                        href={
                          basePath.startsWith('/admin')
                            ? `/admin/customers/${lead.converted_customer_id}`
                            : `/staff/customers/${lead.converted_customer_id}`
                        }
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-teal-700 hover:bg-teal-50 px-2 font-medium"
                        >
                          Customer <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    )}

                    {/* Delete Lead (Admin) */}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(lead.id)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete Lead"
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

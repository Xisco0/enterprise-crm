'use client';

import React from 'react';
import Link from 'next/link';
import { CustomerWithAssignee } from '@/types/crm';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CUSTOMER_STATUS_CONFIG } from '@/lib/constants';
import { Mail, Phone, Building2, User, MoreHorizontal, Eye, Edit, Archive } from 'lucide-react';

interface CustomerTableProps {
  customers: CustomerWithAssignee[];
  basePath: '/admin/customers' | '/staff/customers';
  onArchive?: (id: string) => void;
}

export function CustomerTable({ customers, basePath, onArchive }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
        <Building2 className="h-8 w-8 text-slate-400 mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">No customers found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No customer accounts match your current search filters or permissions.
        </p>
        <Link href={`${basePath}/new`} className="mt-4">
          <Button size="sm" className="bg-slate-900 text-white text-xs">
            Add First Customer
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Ref & Name</TableHead>
            <TableHead>Company & Type</TableHead>
            <TableHead>Account Status</TableHead>
            <TableHead>Contract Value</TableHead>
            <TableHead>Account Executive</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const statusConfig = CUSTOMER_STATUS_CONFIG[customer.status] || {
              label: customer.status,
              color: 'text-slate-700',
              bg: 'bg-slate-100',
              border: 'border-slate-200',
            };

            return (
              <TableRow key={customer.id} className="hover:bg-slate-50/75">
                {/* Ref & Name */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {customer.customer_number || 'CUS-000000'}
                    </span>
                    <Link
                      href={`${basePath}/${customer.id}`}
                      className="font-semibold text-xs text-slate-900 hover:text-brand-600 hover:underline"
                    >
                      {customer.name || `${customer.first_name} ${customer.last_name}`}
                    </Link>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    {customer.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {customer.email}
                      </span>
                    )}
                    {customer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {customer.phone}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Company & Type */}
                <TableCell>
                  <div className="text-xs font-semibold text-slate-800">
                    {customer.company_name || 'Individual Client'}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                      {customer.customer_type === 'BUSINESS' ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" /> Corporate
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" /> Individual
                        </span>
                      )}
                    </Badge>
                    {customer.industry && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                        {customer.industry}
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`text-[11px] ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}
                  >
                    {statusConfig.label}
                  </Badge>
                </TableCell>

                {/* Lifetime Value */}
                <TableCell className="font-mono font-bold text-slate-900 text-xs">
                  {formatCurrency(customer.lifetime_value)}
                </TableCell>

                {/* Assigned Staff */}
                <TableCell className="text-xs text-slate-700">
                  {customer.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                        {customer.assignee.first_name[0]}
                      </div>
                      <span className="truncate max-w-[120px]">
                        {customer.assignee.first_name} {customer.assignee.last_name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                  )}
                </TableCell>

                {/* Location */}
                <TableCell className="text-xs text-slate-500">
                  {customer.address_city
                    ? `${customer.address_city}, ${customer.address_state || customer.address_country}`
                    : '—'}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`${basePath}/${customer.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Button>
                    </Link>
                    <Link href={`${basePath}/${customer.id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
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

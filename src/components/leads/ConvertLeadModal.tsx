'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeadWithAssignee } from '@/types/crm';
import { convertLeadToCustomer } from '@/lib/actions/leads';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';

interface ConvertLeadModalProps {
  lead: LeadWithAssignee;
  basePath: '/admin/leads' | '/staff/leads';
  isOpen: boolean;
  onClose: () => void;
}

export function ConvertLeadModal({ lead, basePath, isOpen, onClose }: ConvertLeadModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    customerId: string;
    customerNumber: string;
    isExisting: boolean;
  } | null>(null);

  if (!isOpen) return null;

  async function handleConvert() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await convertLeadToCustomer(lead.id);
      if (res.error) {
        setError(res.error);
        setIsLoading(false);
        return;
      }

      if (res.success && res.customerId) {
        setResult({
          customerId: res.customerId,
          customerNumber: res.customerNumber || 'CUS-000000',
          isExisting: Boolean(res.isExistingCustomer),
        });
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during lead conversion');
      setIsLoading(false);
    }
  }

  function handleNavigateToCustomer() {
    if (!result) return;
    const targetPath = basePath.startsWith('/admin')
      ? `/admin/customers/${result.customerId}`
      : `/staff/customers/${result.customerId}`;
    router.push(targetPath);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Convert Lead to Customer</h3>
            <p className="text-xs text-slate-500">
              Transform qualified prospect <strong className="font-mono text-slate-800">{lead.lead_number}</strong> into an active account
            </p>
          </div>
        </div>

        {/* Success Screen */}
        {result ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
              <h4 className="text-sm font-bold text-emerald-900">
                {result.isExisting ? 'Lead Linked to Customer' : 'Customer Account Created'}
              </h4>
              <p className="mt-1 text-xs text-emerald-700">
                {result.isExisting
                  ? `Lead record linked to existing customer account ${result.customerNumber}.`
                  : `Successfully generated new customer account ${result.customerNumber}.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-600"
              >
                Stay on Leads
              </Button>
              <Button
                size="sm"
                onClick={handleNavigateToCustomer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4"
              >
                View Customer Profile <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          /* Confirmation Content */
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Lead Summary Box */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3.5 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Prospect Name:</span>
                <span className="font-semibold text-slate-900">{lead.first_name} {lead.last_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Organization:</span>
                <span className="font-medium text-slate-800">{lead.company_name || lead.company || 'Individual Client'}</span>
              </div>
              {lead.email && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Primary Email:</span>
                  <span className="font-mono text-slate-700">{lead.email}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Estimated Value:</span>
                <span className="font-mono font-bold text-emerald-700">{formatCurrency(lead.estimated_value)}</span>
              </div>
            </div>

            {/* Conversion Impact Breakdown */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Atomic Conversion Actions:
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Creates a permanent <strong>Customer Profile</strong> with assigned account representative.</li>
                <li>Initial lifetime value initialized to <strong>{formatCurrency(lead.estimated_value)}</strong>.</li>
                <li>Permanently locks lead status to <strong className="text-teal-700">CONVERTED</strong>.</li>
                <li>Preserves all historical qualification notes and ownership.</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="text-xs text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConvert}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirm Conversion
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

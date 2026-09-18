'use client';

import React from 'react';
import { DealWithDetails } from '@/types/crm';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface MarkWonModalProps {
  deal: DealWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dealId: string) => Promise<void>;
}

export function MarkWonModal({ deal, isOpen, onClose, onConfirm }: MarkWonModalProps) {
  const [loading, setLoading] = React.useState(false);

  if (!deal) return null;

  const dealValue = Number(deal.value || deal.amount || 0);
  const currency = deal.currency || 'USD';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(deal.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Deal as Won"
      description="Confirm successful closure and revenue generation for this sales opportunity."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="rounded-md bg-slate-50 p-3.5 text-xs space-y-2 border border-slate-200/80">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Deal Ref:</span>
            <span className="font-mono font-semibold text-slate-800">{deal.deal_number}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Opportunity:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
              {deal.title}
            </span>
          </div>
          {deal.customer && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-medium text-slate-700 truncate max-w-[200px]">
                {deal.customer.company_name || deal.customer.name}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
            <span className="text-slate-700 font-semibold">Contract Value:</span>
            <span className="text-sm font-bold text-emerald-700">
              {formatCurrency(dealValue, currency)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          This will move the opportunity to <strong className="text-slate-900">Closed Won</strong>, set the status to <strong className="text-slate-900">Won</strong>, set win probability to <strong className="text-slate-900">100%</strong>, and record today as the closed date.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            {loading ? 'Confirming...' : 'Confirm Won'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

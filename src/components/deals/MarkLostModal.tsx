'use client';

import React from 'react';
import { DealWithDetails } from '@/types/crm';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { XCircle, AlertCircle } from 'lucide-react';

interface MarkLostModalProps {
  deal: DealWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dealId: string, lostReason: string) => Promise<void>;
}

export function MarkLostModal({ deal, isOpen, onClose, onConfirm }: MarkLostModalProps) {
  const [lostReason, setLostReason] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setLostReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!deal) return null;

  const dealValue = Number(deal.value || deal.amount || 0);
  const currency = deal.currency || 'USD';

  const handleConfirm = async () => {
    const trimmed = lostReason.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Please provide a specific loss reason (minimum 2 characters).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(deal.id, trimmed);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record loss reason.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Deal as Lost"
      description="Document why this opportunity was lost for pipeline analytics and executive review."
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
          <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
            <span className="text-slate-600 font-semibold">Value:</span>
            <span className="text-xs font-bold text-slate-900">
              {formatCurrency(dealValue, currency)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="lost-reason" className="block text-xs font-semibold text-slate-700">
            Loss Reason <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="lost-reason"
            rows={3}
            placeholder="e.g. Budget constraints, selected competitor X, project delayed..."
            value={lostReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setLostReason(e.target.value);
              if (error) setError(null);
            }}
            className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none resize-none"
          />
          {error && (
            <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

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
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            {loading ? 'Recording...' : 'Confirm Lost'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

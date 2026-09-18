'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DealWithDetails } from '@/types/crm';
import { DealStage, DealStatus, DealPriority, DealCurrency } from '@/types/database.types';
import { DEAL_STAGE_CONFIG, DEAL_STATUS_CONFIG, DEAL_PRIORITY_CONFIG, CURRENCY_CONFIG } from '@/lib/constants';
import { createDeal, updateDeal, searchCustomersForDeal } from '@/lib/actions/deals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  AlertCircle,
  Search,
  Check,
} from 'lucide-react';

interface DealFormProps {
  initialData?: DealWithDetails;
  currentUserId: string;
  basePath: '/admin/deals' | '/staff/deals';
  staffMembers?: Array<{ id: string; name: string; email: string }>;
  preselectedCustomerId?: string;
  preselectedCustomerName?: string;
  preselectedLeadId?: string;
}

export function DealForm({
  initialData,
  currentUserId,
  basePath,
  staffMembers = [],
  preselectedCustomerId,
  preselectedCustomerName,
  preselectedLeadId,
}: DealFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form states
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [description, setDescription] = React.useState(initialData?.description || '');
  const [customerId, setCustomerId] = React.useState(
    initialData?.customer_id || preselectedCustomerId || ''
  );
  const [customerName, setCustomerName] = React.useState(
    initialData?.customer?.company_name || initialData?.customer?.name || preselectedCustomerName || ''
  );
  const [leadId, setLeadId] = React.useState(initialData?.lead_id || preselectedLeadId || '');
  const [value, setValue] = React.useState(
    initialData ? String(initialData.value || initialData.amount || 0) : '2500000'
  );
  const [currency, setCurrency] = React.useState<DealCurrency>(
    (initialData?.currency as DealCurrency) || 'NGN'
  );
  const [stage, setStage] = React.useState<DealStage>(initialData?.stage || 'NEW');
  const [status, setStatus] = React.useState<DealStatus>(initialData?.status || 'OPEN');
  const [priority, setPriority] = React.useState<DealPriority>(initialData?.priority || 'MEDIUM');
  const [probability, setProbability] = React.useState(
    initialData?.probability !== undefined ? String(initialData.probability) : '10'
  );
  const [expectedCloseDate, setExpectedCloseDate] = React.useState(
    initialData?.expected_close_date || ''
  );
  const [assignedTo, setAssignedTo] = React.useState(
    initialData?.assigned_to || currentUserId || ''
  );
  const [notes, setNotes] = React.useState(initialData?.notes || '');
  const [lostReason, setLostReason] = React.useState(initialData?.lost_reason || '');

  // Customer search picker state
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState('');
  const [customerResults, setCustomerResults] = React.useState<
    Array<{ id: string; name: string; company_name: string | null; customer_number: string }>
  >([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = React.useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false);

  // Feedback states
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Auto-adjust probability and status when stage changes
  const handleStageChange = (newStage: DealStage) => {
    setStage(newStage);
    const defaultProb = DEAL_STAGE_CONFIG[newStage]?.defaultProbability;
    if (defaultProb !== undefined) {
      setProbability(String(defaultProb));
    }

    if (newStage === 'CLOSED_WON') {
      setStatus('WON');
    } else if (newStage === 'CLOSED_LOST') {
      setStatus('LOST');
    } else {
      setStatus('OPEN');
    }
  };

  // Debounced customer search
  React.useEffect(() => {
    if (!showCustomerDropdown) return;
    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await searchCustomersForDeal(customerSearchQuery);
        setCustomerResults(res);
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, showCustomerDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a deal title.');
      return;
    }

    if (!customerId) {
      setError('Please select an active customer account for this deal.');
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) {
      setError('Deal value must be a valid positive number.');
      return;
    }

    const numProb = Number(probability);
    if (isNaN(numProb) || numProb < 0 || numProb > 100) {
      setError('Win probability must be between 0% and 100%.');
      return;
    }

    if (stage === 'CLOSED_LOST' && (!lostReason || lostReason.trim().length < 2)) {
      setError('A loss reason is required when stage is Closed Lost.');
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      customer_id: customerId,
      lead_id: leadId || undefined,
      value: numValue,
      currency,
      stage,
      status,
      priority,
      probability: numProb,
      expected_close_date: expectedCloseDate || undefined,
      assigned_to: assignedTo || undefined,
      notes: notes.trim() || undefined,
      lost_reason: stage === 'CLOSED_LOST' ? lostReason.trim() : undefined,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateDeal(initialData.id, payload, currentUserId);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        router.push(`${basePath}/${initialData.id}`);
      } else {
        const res = await createDeal(payload, currentUserId);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        router.push(basePath);
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to save deal opportunity.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Basic Deal Information */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
          1. Opportunity Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700">
              Deal Title <span className="text-rose-500">*</span>
            </label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Enterprise Platform License & SLA"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
              Opportunity Summary / Scope
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Brief description of the customer's requirements, project scope, or solution outline..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Customer Association */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
          2. Customer Account
        </h3>

        <div className="space-y-1.5 relative">
          <label className="block text-xs font-semibold text-slate-700">
            Associated Customer <span className="text-rose-500">*</span>
          </label>

          {customerName ? (
            <div className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span className="font-semibold text-slate-800">{customerName}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCustomerId('');
                  setCustomerName('');
                  setShowCustomerDropdown(true);
                }}
                className="h-6 px-2 text-[11px] text-slate-600 hover:text-slate-900"
              >
                Change Customer
              </Button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search customer account by company name, contact, or ref..."
                  value={customerSearchQuery}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomerSearchQuery(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  className="pl-9 text-xs h-9"
                />
              </div>

              {showCustomerDropdown && (
                <div className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {isSearchingCustomers ? (
                    <div className="p-3 text-xs text-slate-500 text-center">Searching accounts...</div>
                  ) : customerResults.length === 0 ? (
                    <div className="p-3 text-xs text-slate-500 text-center">
                      No matching customers found.
                    </div>
                  ) : (
                    customerResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setCustomerId(c.id);
                          setCustomerName(c.company_name || c.name);
                          setShowCustomerDropdown(false);
                        }}
                        className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">
                            {c.company_name || c.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {c.customer_number}
                          </span>
                        </div>
                        <Check className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Financials & Pipeline Progression */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
          3. Financials & Stage Progression
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Currency */}
          <div className="space-y-1.5">
            <label htmlFor="currency" className="block text-xs font-semibold text-slate-700">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as DealCurrency)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              {Object.entries(CURRENCY_CONFIG).map(([code, cfg]) => (
                <option key={code} value={code}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Deal Value */}
          <div className="space-y-1.5">
            <label htmlFor="value" className="block text-xs font-semibold text-slate-700">
              Contract Value <span className="text-rose-500">*</span>
            </label>
            <Input
              id="value"
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
              required
              className="text-xs h-9 font-mono font-medium"
            />
          </div>

          {/* Win Probability */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="probability" className="block text-xs font-semibold text-slate-700">
                Win Probability (%)
              </label>
              <span className="font-mono text-xs font-bold text-slate-800">{probability}%</span>
            </div>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProbability(e.target.value)}
              className="text-xs h-9 font-mono"
            />
          </div>

          {/* Deal Stage */}
          <div className="space-y-1.5">
            <label htmlFor="stage" className="block text-xs font-semibold text-slate-700">
              Pipeline Stage
            </label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => handleStageChange(e.target.value as DealStage)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              {Object.entries(DEAL_STAGE_CONFIG).map(([code, cfg]) => (
                <option key={code} value={code}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label htmlFor="priority" className="block text-xs font-semibold text-slate-700">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as DealPriority)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              {Object.entries(DEAL_PRIORITY_CONFIG).map(([code, cfg]) => (
                <option key={code} value={code}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Expected Close Date */}
          <div className="space-y-1.5">
            <label htmlFor="expected-date" className="block text-xs font-semibold text-slate-700">
              Expected Close Date
            </label>
            <Input
              id="expected-date"
              type="date"
              value={expectedCloseDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpectedCloseDate(e.target.value)}
              className="text-xs h-9"
            />
          </div>
        </div>

        {/* Conditional Loss Reason when stage is CLOSED_LOST */}
        {stage === 'CLOSED_LOST' && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label htmlFor="lost-reason" className="block text-xs font-semibold text-rose-700">
              Loss Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="lost-reason"
              rows={2}
              placeholder="Why was this opportunity lost? (Competitor, pricing, budget, etc.)"
              value={lostReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLostReason(e.target.value)}
              required
              className="w-full rounded-md border border-rose-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      {/* Section 4: Assignment & Notes */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-2">
          4. Assignment & Internal Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="assigned-to" className="block text-xs font-semibold text-slate-700">
              Assigned Representative
            </label>
            <select
              id="assigned-to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-xs focus:border-slate-400 focus:outline-none"
            >
              <option value="00000000-0000-0000-0000-000000000002">Marcus Vance (Staff)</option>
              <option value="00000000-0000-0000-0000-000000000003">Elena Rostova (Staff)</option>
              <option value="00000000-0000-0000-0000-000000000001">Sarah Chen (Admin)</option>
              {staffMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="notes" className="block text-xs font-semibold text-slate-700">
              Internal Collaboration Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Add deal progression updates, executive notes, stakeholder feedback..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          disabled={loading}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Opportunity' : 'Create Opportunity'}
        </Button>
      </div>
    </form>
  );
}

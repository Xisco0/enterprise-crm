'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { InteractionWithPerformer } from '@/types/crm';
import { InteractionType } from '@/types/database.types';
import { INTERACTION_TYPE_CONFIG } from '@/lib/constants';
import { createInteraction, updateInteraction } from '@/lib/actions/interactions';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Phone,
  Mail,
  Users,
  FileText,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  User,
} from 'lucide-react';

interface InteractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  initialData?: InteractionWithPerformer | null;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  dealId?: string;
  dealTitle?: string;
  onSuccess?: () => void;
}

export function InteractionFormModal({
  isOpen,
  onClose,
  currentUserId,
  initialData,
  customerId,
  customerName,
  leadId,
  leadName,
  dealId,
  dealTitle,
  onSuccess,
}: InteractionFormModalProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form State
  const [type, setType] = React.useState<InteractionType>(initialData?.type || 'CALL');
  const [subject, setSubject] = React.useState(initialData?.subject || '');
  const [description, setDescription] = React.useState(initialData?.description || initialData?.notes || '');
  const [interactionAt, setInteractionAt] = React.useState(
    initialData?.interaction_at
      ? new Date(initialData.interaction_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = React.useState(
    initialData?.duration_minutes ? String(initialData.duration_minutes) : ''
  );
  const [outcome, setOutcome] = React.useState(initialData?.outcome || '');

  // Feedback State
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset or initialize on open
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setSubject(initialData.subject);
        setDescription(initialData.description || initialData.notes || '');
        setInteractionAt(
          initialData.interaction_at
            ? new Date(initialData.interaction_at).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16)
        );
        setDurationMinutes(initialData.duration_minutes ? String(initialData.duration_minutes) : '');
        setOutcome(initialData.outcome || '');
      } else {
        setType('CALL');
        setSubject('');
        setDescription('');
        setInteractionAt(new Date().toISOString().slice(0, 16));
        setDurationMinutes('');
        setOutcome('');
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const targetCustomerId = customerId || initialData?.customer_id;
  const targetLeadId = leadId || initialData?.lead_id;
  const targetDealId = dealId || initialData?.deal_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError('Please provide a subject summary.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide interaction details or discussion notes.');
      return;
    }

    if (!targetCustomerId && !targetLeadId && !targetDealId) {
      setError('This interaction must be associated with a Customer, Lead, or Deal.');
      return;
    }

    const dur = durationMinutes.trim() ? Number(durationMinutes) : null;
    if (dur !== null && (isNaN(dur) || dur < 0)) {
      setError('Duration must be a positive number of minutes.');
      return;
    }

    setLoading(true);

    const payload = {
      type,
      subject: subject.trim(),
      description: description.trim(),
      customer_id: targetCustomerId || undefined,
      lead_id: targetLeadId || undefined,
      deal_id: targetDealId || undefined,
      interaction_at: new Date(interactionAt).toISOString(),
      duration_minutes: dur,
      outcome: outcome.trim() || undefined,
    };

    try {
      if (isEditing && initialData) {
        const res = await updateInteraction(initialData.id, payload, currentUserId);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      } else {
        const res = await createInteraction(payload, currentUserId);
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to record interaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Interaction Record' : 'Record New Activity / Interaction'}
      description="Document client communication, calls, meetings, or internal collaboration notes."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Associated CRM Context Tag */}
        {(customerName || leadName || dealTitle) && (
          <div className="flex flex-wrap items-center gap-2 rounded-md bg-slate-50 p-2.5 text-xs border border-slate-200/80">
            <span className="text-slate-500 font-medium">Associated Record:</span>
            {customerName && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                <Building2 className="h-3 w-3 text-slate-500" />
                {customerName}
              </span>
            )}
            {leadName && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                <User className="h-3 w-3 text-slate-500" />
                {leadName}
              </span>
            )}
            {dealTitle && (
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                <Briefcase className="h-3 w-3 text-slate-500" />
                {dealTitle}
              </span>
            )}
          </div>
        )}

        {/* Activity Type Selector Buttons */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Activity Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'OTHER'] as const).map((t) => {
              const cfg = INTERACTION_TYPE_CONFIG[t];
              const isSelected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded border transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ring-slate-400 font-bold`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Header */}
        <div className="space-y-1.5">
          <label htmlFor="subject" className="block text-xs font-semibold text-slate-700">
            Subject Summary <span className="text-rose-500">*</span>
          </label>
          <Input
            id="subject"
            type="text"
            placeholder="e.g. Discussed pricing options, Project kickoff call, Demo review..."
            value={subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            required
            className="h-9 text-xs"
          />
        </div>

        {/* Date & Time, Duration, Outcome Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Interaction Date/Time */}
          <div className="space-y-1.5">
            <label htmlFor="interaction-at" className="block text-xs font-semibold text-slate-700">
              Date & Time <span className="text-rose-500">*</span>
            </label>
            <Input
              id="interaction-at"
              type="datetime-local"
              value={interactionAt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInteractionAt(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Duration in Minutes */}
          <div className="space-y-1.5">
            <label htmlFor="duration" className="block text-xs font-semibold text-slate-700">
              Duration (Minutes)
            </label>
            <Input
              id="duration"
              type="number"
              min="0"
              placeholder="e.g. 30"
              value={durationMinutes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDurationMinutes(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Outcome / Result */}
          <div className="space-y-1.5">
            <label htmlFor="outcome" className="block text-xs font-semibold text-slate-700">
              Outcome / Next Step
            </label>
            <Input
              id="outcome"
              type="text"
              placeholder="e.g. Proposal requested, Interested"
              value={outcome}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutcome(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
            Interaction Details & Minutes <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Record verbatim notes, discussed action items, key decisions, or customer queries..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            required
            className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none resize-none"
          />
        </div>

        {/* Modal Action Buttons */}
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
            type="submit"
            size="sm"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Interaction' : 'Save Interaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LeadWithAssignee } from '@/types/crm';
import { createLead, updateLead, checkLeadDuplicates, DuplicateCheckResult } from '@/lib/actions/leads';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  User,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Save,
  ArrowLeft,
  Briefcase,
  Flame,
} from 'lucide-react';
import { LEAD_STATUS_CONFIG, LEAD_PRIORITY_CONFIG, LEAD_SOURCE_CONFIG } from '@/lib/constants';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface LeadFormProps {
  lead?: LeadWithAssignee;
  basePath: '/admin/leads' | '/staff/leads';
  staffMembers?: StaffMember[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export function LeadForm({
  lead,
  basePath,
  staffMembers = [],
  currentUserId,
  isAdmin = false,
}: LeadFormProps) {
  const router = useRouter();
  const isEditing = Boolean(lead);

  const [leadType, setLeadType] = useState<'INDIVIDUAL' | 'BUSINESS'>(
    lead?.lead_type || 'BUSINESS'
  );
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(
    lead?.priority || 'MEDIUM'
  );
  const [status, setStatus] = useState(lead?.status || 'NEW');
  const [source, setSource] = useState(lead?.source || 'WEBSITE');
  const [confidenceScore, setConfidenceScore] = useState<number>(lead?.confidence_score ?? 50);

  const [email, setEmail] = useState(lead?.email || '');
  const [phone, setPhone] = useState(lead?.phone || '');
  const [companyName, setCompanyName] = useState(lead?.company_name || lead?.company || '');

  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleCheckDuplicates() {
    if (!email && !phone) return;
    setIsCheckingDuplicates(true);
    try {
      const res = await checkLeadDuplicates(email, phone, companyName, lead?.id);
      if (res.hasDuplicate) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // Ignore
    } finally {
      setIsCheckingDuplicates(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set('lead_type', leadType);
    formData.set('priority', priority);
    formData.set('status', status);
    formData.set('source', source);
    formData.set('confidence_score', String(confidenceScore));

    try {
      let result;
      if (isEditing && lead) {
        result = await updateLead(lead.id, formData);
      } else {
        result = await createLead(formData);
      }

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      if (result.success) {
        if (isEditing && lead) {
          router.push(`${basePath}/${lead.id}`);
        } else if (result.leadId) {
          router.push(`${basePath}/${result.leadId}`);
        } else {
          router.push(basePath);
        }
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            Validation Failed
          </div>
          <p className="mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Duplicate Record Warning */}
      {duplicateWarning && duplicateWarning.hasDuplicate && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Potential Duplicate Prospect Detected
          </div>
          <p className="mt-1">
            An existing record with matching contact details was found in the database. You may still save this lead if it is a distinct opportunity:
          </p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {duplicateWarning.matches.map((m, idx) => (
              <li key={idx}>
                <strong>{m.type} {m.number}</strong>: {m.name} (Matched on {m.matchedOn})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SECTION 1: Lead Type & Basic Contact */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            1. Prospect Contact Information
          </h3>
          <p className="text-xs text-slate-500">
            Name, primary communication channels, and entity classification.
          </p>
        </div>

        {/* Lead Type Toggle */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Prospect Entity Classification <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLeadType('BUSINESS')}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                leadType === 'BUSINESS'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Corporate / Business Account
            </button>
            <button
              type="button"
              onClick={() => setLeadType('INDIVIDUAL')}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                leadType === 'INDIVIDUAL'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Individual Practitioner / Consultant
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              First Name <span className="text-rose-500">*</span>
            </label>
            <Input
              name="first_name"
              required
              defaultValue={lead?.first_name}
              placeholder="e.g. Rachel"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <Input
              name="last_name"
              required
              defaultValue={lead?.last_name}
              placeholder="e.g. Adams"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="e.g. radams@beaconrobotics.com"
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="e.g. +1 (408) 555-7120"
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Organization & Role */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            2. Organization & Professional Role
          </h3>
          <p className="text-xs text-slate-500">
            Company affiliation, job title, and inbound lead acquisition source.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Company / Organization Name {leadType === 'BUSINESS' && <span className="text-rose-500">*</span>}
            </label>
            <Input
              name="company_name"
              required={leadType === 'BUSINESS'}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={leadType === 'BUSINESS' ? 'e.g. Beacon Robotics' : 'Optional for individuals'}
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Job Title / Decision Maker Role
            </label>
            <Input
              name="job_title"
              defaultValue={lead?.job_title || ''}
              placeholder="e.g. VP of Engineering"
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Lead Acquisition Source <span className="text-rose-500">*</span>
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
            >
              {Object.entries(LEAD_SOURCE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Qualification, Priority & Pipeline Scoring */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            3. Qualification, Priority & Pipeline Scoring
          </h3>
          <p className="text-xs text-slate-500">
            Pipeline lifecycle state, urgency tier, projected contract value, and win probability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Priority Tier <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((p) => {
                const cfg = LEAD_PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-center text-xs font-semibold rounded border transition-all ${
                      isSelected
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-1 ring-slate-400`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Lead Lifecycle Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              disabled={isEditing && lead?.status === 'CONVERTED'}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none disabled:bg-slate-100"
            >
              {Object.entries(LEAD_STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key} disabled={key === 'CONVERTED' && !isEditing}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Estimated Deal Value (₦ NGN)
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₦</span>
              <Input
                name="estimated_value"
                type="number"
                min="0"
                step="5000"
                defaultValue={lead?.estimated_value ?? 0}
                className="pl-8 h-9 text-xs font-mono font-semibold"
              />
            </div>
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Confidence Score
              </label>
              <span className="text-xs font-bold text-slate-900 font-mono">
                {confidenceScore}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900 mt-2"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Assignment & Internal Notes */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-500" />
            4. Assignment & Internal Context
          </h3>
          <p className="text-xs text-slate-500">
            Ownership routing and private CRM qualification notes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Assigned Staff */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Assigned Account Representative
            </label>
            {isAdmin && staffMembers.length > 0 ? (
              <select
                name="assigned_to"
                defaultValue={lead?.assigned_to || currentUserId || ''}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name} ({staff.email})
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {lead?.assignee
                  ? `${lead.assignee.first_name} ${lead.assignee.last_name}`
                  : 'Assigned to your staff account'}
                <input
                  type="hidden"
                  name="assigned_to"
                  value={lead?.assigned_to || currentUserId || ''}
                />
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Internal Discovery & Qualification Notes
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={lead?.notes || ''}
              placeholder="Record pain points, budget authority, timeline, and next contact actions..."
              className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="text-xs text-slate-600"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Cancel & Return
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-5"
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {isLoading ? 'Saving Lead...' : isEditing ? 'Save Changes' : 'Capture Prospect'}
        </Button>
      </div>
    </form>
  );
}

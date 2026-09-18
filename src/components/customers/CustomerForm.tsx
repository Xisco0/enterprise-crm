'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerWithAssignee, CustomerType, CustomerStatus, Profile } from '@/types/crm';
import { createCustomer, updateCustomer } from '@/lib/actions/customers';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, User, MapPin, Shield, FileText, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CustomerFormProps {
  initialData?: CustomerWithAssignee | null;
  staffList: Profile[];
  basePath: '/admin/customers' | '/staff/customers';
  isStaffPortal?: boolean;
  currentUserId?: string;
}

export function CustomerForm({
  initialData,
  staffList,
  basePath,
  isStaffPortal = false,
  currentUserId,
}: CustomerFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  // Form State
  const [firstName, setFirstName] = useState(initialData?.first_name || '');
  const [lastName, setLastName] = useState(initialData?.last_name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');

  const [customerType, setCustomerType] = useState<CustomerType>(initialData?.customer_type || 'BUSINESS');
  const [companyName, setCompanyName] = useState(initialData?.company_name || '');
  const [jobTitle, setJobTitle] = useState(initialData?.job_title || '');
  const [industry, setIndustry] = useState(initialData?.industry || 'Technology & SaaS');
  const [website, setWebsite] = useState(initialData?.website || '');

  const [status, setStatus] = useState<CustomerStatus>(initialData?.status || 'ACTIVE');
  const [lifetimeValue, setLifetimeValue] = useState(initialData?.lifetime_value ? String(initialData.lifetime_value) : '0');
  const [assignedTo, setAssignedTo] = useState(initialData?.assigned_to || currentUserId || (staffList[0]?.user_id || ''));

  const [addressStreet, setAddressStreet] = useState(initialData?.address_street || '');
  const [addressCity, setAddressCity] = useState(initialData?.address_city || '');
  const [addressState, setAddressState] = useState(initialData?.address_state || '');
  const [addressCountry, setAddressCountry] = useState(initialData?.address_country || 'United States');
  const [addressZip, setAddressZip] = useState(initialData?.address_zip || '');

  const [notes, setNotes] = useState(initialData?.notes || '');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    if (email) formData.append('email', email);
    if (phone) formData.append('phone', phone);

    formData.append('customer_type', customerType);
    if (companyName) formData.append('company_name', companyName);
    if (jobTitle) formData.append('job_title', jobTitle);
    if (industry) formData.append('industry', industry);
    if (website) formData.append('website', website);

    formData.append('status', status);
    formData.append('lifetime_value', lifetimeValue);
    if (assignedTo) formData.append('assigned_to', assignedTo);

    if (addressStreet) formData.append('address_street', addressStreet);
    if (addressCity) formData.append('address_city', addressCity);
    if (addressState) formData.append('address_state', addressState);
    if (addressCountry) formData.append('address_country', addressCountry);
    if (addressZip) formData.append('address_zip', addressZip);

    if (notes) formData.append('notes', notes);

    try {
      if (isEditing && initialData) {
        const res = await updateCustomer(initialData.id, formData);
        if (res.error) {
          setError(res.error);
        } else {
          router.push(`${basePath}/${initialData.id}`);
        }
      } else {
        const res = await createCustomer(formData);
        if (res.error) {
          setError(res.error);
        } else if (res.customerId) {
          router.push(`${basePath}/${res.customerId}`);
        } else {
          router.push(basePath);
        }
      }
    } catch {
      setError('An unexpected error occurred while saving the customer record.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb / Header */}
      <div className="flex items-center justify-between">
        <Link
          href={isEditing && initialData ? `${basePath}/${initialData.id}` : basePath}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {isEditing ? 'Customer Record' : 'Customers Directory'}
        </Link>
        <div className="flex items-center gap-2">
          <Link href={basePath}>
            <Button type="button" variant="outline" size="sm" className="text-xs" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-5"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Customer Record'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Primary Contact Information */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            <CardTitle className="text-sm">1. Primary Contact Information</CardTitle>
          </div>
          <CardDescription>Individual stakeholder details for communication and correspondence.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="First Name *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Katherine"
              required
            />
            <Input
              label="Last Name *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Ward"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Work Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@organization.com"
              helperText="Unique primary correspondence address"
            />
            <Input
              label="Direct Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Business & Account Structure */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-700" />
            <CardTitle className="text-sm">2. Organization & Business Information</CardTitle>
          </div>
          <CardDescription>Company profile, account categorization, and industry vertical.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Customer Classification *"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              options={[
                { label: 'Corporate / Business Entity', value: 'BUSINESS' },
                { label: 'Individual / Consultant', value: 'INDIVIDUAL' },
              ]}
            />
            <div className="sm:col-span-2">
              <Input
                label="Company / Organization Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Vanguard Health Systems"
                helperText="Leave empty if this is an individual retail client"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Job Title / Role"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Director of Operations"
            />
            <Select
              label="Industry Classification"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={[
                { label: 'Technology & SaaS', value: 'Technology & SaaS' },
                { label: 'Healthcare & Life Sciences', value: 'Healthcare & Life Sciences' },
                { label: 'Financial Services & Banking', value: 'Financial Services & Banking' },
                { label: 'Supply Chain & Logistics', value: 'Supply Chain & Logistics' },
                { label: 'Manufacturing & Industrial', value: 'Manufacturing & Industrial' },
                { label: 'Retail & E-Commerce', value: 'Retail & E-Commerce' },
                { label: 'Professional Services', value: 'Professional Services' },
                { label: 'Other', value: 'Other' },
              ]}
            />
            <Input
              label="Website URL"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Physical Address */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-700" />
            <CardTitle className="text-sm">3. Physical & Billing Location</CardTitle>
          </div>
          <CardDescription>Primary corporate headquarters or office address.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <Input
            label="Street Address"
            value={addressStreet}
            onChange={(e) => setAddressStreet(e.target.value)}
            placeholder="e.g. 75 Cambridge Pkwy, Suite 400"
          />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input
              label="City"
              value={addressCity}
              onChange={(e) => setAddressCity(e.target.value)}
              placeholder="Boston"
            />
            <Input
              label="State / Province"
              value={addressState}
              onChange={(e) => setAddressState(e.target.value)}
              placeholder="MA"
            />
            <Input
              label="Postal / ZIP Code"
              value={addressZip}
              onChange={(e) => setAddressZip(e.target.value)}
              placeholder="02142"
            />
            <Input
              label="Country"
              value={addressCountry}
              onChange={(e) => setAddressCountry(e.target.value)}
              placeholder="United States"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Assignment, Status & Financials */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-700" />
            <CardTitle className="text-sm">4. Account Governance & Assignment</CardTitle>
          </div>
          <CardDescription>Internal sales representative ownership and lifecycle status.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Select
              label="Assigned Account Executive *"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={isStaffPortal && !staffList.some((s) => s.user_id === currentUserId && s.role === 'ADMIN')}
              options={
                staffList.length > 0
                  ? staffList.map((s) => ({
                      label: `${s.first_name} ${s.last_name} (${s.department || s.role})`,
                      value: s.user_id,
                    }))
                  : [{ label: 'Default Staff Rep', value: currentUserId || '' }]
              }
            />

            <Select
              label="Account Lifecycle Status *"
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              options={[
                { label: 'Active Account', value: 'ACTIVE' },
                { label: 'Inactive / Dormant', value: 'INACTIVE' },
                { label: 'Prospect (Contract Pending)', value: 'PROSPECT' },
                { label: 'Archived Record', value: 'ARCHIVED' },
              ]}
            />

            <Input
              label="Contract / Lifetime Value ($)"
              type="number"
              min="0"
              step="100"
              value={lifetimeValue}
              onChange={(e) => setLifetimeValue(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* 5. Additional Internal Notes */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <CardTitle className="text-sm">5. Internal Account Notes</CardTitle>
          </div>
          <CardDescription>Important business context, contract specifics, or client preferences.</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record important client notes, executive background, or service agreement terms..."
            className="w-full rounded-md border border-slate-300 p-3 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </CardContent>
      </Card>

      {/* Bottom Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href={isEditing && initialData ? `${basePath}/${initialData.id}` : basePath}>
          <Button type="button" variant="outline" size="md" className="text-xs" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          size="md"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-6"
          isLoading={isSubmitting}
        >
          {isEditing ? 'Save Customer Changes' : 'Create Customer Record'}
        </Button>
      </div>
    </form>
  );
}

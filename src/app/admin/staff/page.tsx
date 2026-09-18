'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { UserPlus, Shield, Mail, Phone, CheckCircle2, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { inviteStaffMember, toggleStaffStatus, getAllStaffProfiles } from '@/lib/actions/staff';
import { formatDate } from '@/lib/utils';
import { Profile } from '@/types/crm';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<Profile[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invite Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [department, setDepartment] = useState('Enterprise Sales');
  const [jobTitle, setJobTitle] = useState('Sales Representative');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    const data = await getAllStaffProfiles();
    setStaffList(data as unknown as Profile[]);
  }

  async function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('role', role);
    formData.append('department', department);
    formData.append('job_title', jobTitle);
    if (phone) formData.append('phone', phone);

    try {
      const res = await inviteStaffMember(formData);
      if (res.error) {
        setActionMessage({ type: 'error', text: res.error });
      } else {
        setActionMessage({ type: 'success', text: res.message || 'Staff invitation sent successfully.' });
        setIsInviteModalOpen(false);
        // Reset fields
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        await loadStaff();
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to process staff invitation.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusToggle(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await toggleStaffStatus(userId, newStatus);
      if (res.error) {
        setActionMessage({ type: 'error', text: res.error });
      } else {
        setActionMessage({ type: 'success', text: res.message || `Status updated to ${newStatus}.` });
        setStaffList((prev) =>
          prev.map((s) => (s.user_id === userId ? { ...s, status: newStatus } : s))
        );
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to update account status.' });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Staff & Identity Roster</h2>
          <p className="text-xs text-slate-500">
            Provision team members, configure RBAC role assignments, and govern account activity.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite Staff Member
        </Button>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs border ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Staff Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role & Privileges</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Member Since</TableHead>
                <TableHead className="text-right">Governance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffList.map((member) => (
                <TableRow key={member.id || member.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {member.first_name[0]}
                        {member.last_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-[11px] text-slate-500">{member.job_title || 'Staff'}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {member.email}
                          </span>
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {member.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[11px]">
                      {member.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {member.department || 'Sales'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === 'ACTIVE'
                          ? 'success'
                          : member.status === 'SUSPENDED'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="text-[11px]"
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {formatDate(member.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {member.role !== 'ADMIN' ? (
                      <Button
                        variant={member.status === 'ACTIVE' ? 'outline' : 'secondary'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleStatusToggle(member.user_id, member.status)}
                      >
                        {member.status === 'ACTIVE' ? (
                          <>
                            <UserX className="w-3.5 h-3.5 mr-1 text-rose-600" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Activate
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Protected</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Staff Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Staff Member"
        description="Dispatch a secure Supabase invitation for an employee to join the CRM platform."
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Elena"
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Rostova"
              required
            />
          </div>

          <Input
            label="Corporate Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="elena.rostova@enterprise.com"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'STAFF' | 'ADMIN')}
              options={[
                { label: 'STAFF (Sales / Representative)', value: 'STAFF' },
                { label: 'ADMIN (Full System Administrator)', value: 'ADMIN' },
              ]}
            />
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { label: 'Enterprise Sales', value: 'Enterprise Sales' },
                { label: 'Mid-Market Sales', value: 'Mid-Market Sales' },
                { label: 'Account Management', value: 'Account Management' },
                { label: 'Revenue Operations', value: 'Revenue Operations' },
                { label: 'Executive Leadership', value: 'Executive Leadership' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Account Executive"
            />
            <Input
              label="Work Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white"
              isLoading={isSubmitting}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User, Shield, ChevronDown, CheckCircle2, Building, Mail, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';
import { SignOutModal } from '@/components/auth/SignOutModal';

interface UserMenuProps {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
    job_title?: string | null;
    department?: string | null;
    avatar_url?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(user.first_name, user.last_name);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative font-sans" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 rounded-xl p-1.5 text-left text-sm transition-all hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white font-heading shrink-0 shadow-2xs ${
              user.role === 'ADMIN'
                ? 'bg-purple-900 text-white ring-1 ring-purple-400/40'
                : 'bg-blue-600 text-white ring-1 ring-blue-400/40'
            }`}
          >
            {initials}
          </div>
          <div className="hidden text-left md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-900">
                {user.first_name} {user.last_name}
              </span>
              <Badge
                variant={user.role === 'ADMIN' ? 'purple' : 'info'}
                className="text-[9px] px-1 py-0 h-4"
              >
                {user.role}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-600 truncate max-w-[150px] font-sans">
              {user.job_title || user.email}
            </p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
            {/* Header Summary */}
            <div className="p-2.5 border-b border-slate-100 mb-1.5 bg-slate-50/90 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-bold text-slate-900">
                  {user.first_name} {user.last_name}
                </span>
                <span
                  className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate mt-0.5 flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" /> {user.email}
              </p>
              {user.job_title && (
                <p className="text-[10px] text-slate-700 font-medium mt-1">
                  {user.job_title} &bull; {user.department || 'Revenue'}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <div className="space-y-0.5 text-xs">
              <Link
                href={user.role === 'ADMIN' ? '/admin/settings' : '/staff/reports'}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Workspace Profile</span>
              </Link>

              <Link
                href="/reset-password"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                <span>Change Password</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsSignOutModalOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Sign Out of CRM</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Sign Out Modal */}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        user={user}
      />
    </>
  );
}


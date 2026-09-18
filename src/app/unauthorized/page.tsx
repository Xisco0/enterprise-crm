'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignOutModal } from '@/components/auth/SignOutModal';

export default function UnauthorizedPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  const isInactive = searchParams?.reason === 'inactive';
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900 font-heading">
          {isInactive ? 'Account Deactivated' : 'Access Restricted'}
        </h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          {isInactive
            ? 'Your employee account status is inactive or suspended. Please contact your CRM system administrator for reinstatement.'
            : 'You do not have administrative privileges to access this area of the CRM. Your activity is logged under Row-Level Security.'}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {!isInactive && (
            <Link href="/staff/dashboard">
              <Button variant="primary" className="w-full text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Return to Staff Workspace
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="w-full text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
          </Button>
        </div>
      </div>

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </div>
  );
}


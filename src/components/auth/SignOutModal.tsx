'use client';

import React, { useState } from 'react';
import { LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/lib/actions/auth';
import { getInitials } from '@/lib/utils';

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
  };
}

export function SignOutModal({ isOpen, onClose, user }: SignOutModalProps) {
  const [isPending, setIsPending] = useState(false);

  const handleConfirmSignOut = async () => {
    setIsPending(true);
    try {
      await logout();
    } catch (err) {
      console.error('Sign out failed:', err);
      setIsPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) onClose();
      }}
      title="Sign Out Confirmation"
      description="Confirm your intent to end your current session."
      maxWidth="sm"
    >
      <div className="space-y-4 font-sans pt-1">
        {/* User Card if available */}
        {user && (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/90 p-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white font-heading ${
                  user.role === 'ADMIN' ? 'bg-purple-900' : 'bg-blue-600'
                }`}
              >
                {getInitials(user.first_name, user.last_name)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900 truncate">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <Badge
              variant={user.role === 'ADMIN' ? 'purple' : 'info'}
              className="text-[10px] shrink-0 ml-2"
            >
              {user.role}
            </Badge>
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Are you sure you want to sign out? Any unsaved progress in active forms or filters will be cleared.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </Button>

          <form action={handleConfirmSignOut}>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Yes, Sign Out</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

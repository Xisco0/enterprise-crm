'use client';

import React, { useState } from 'react';
import { UserMenu } from '@/components/layout/UserMenu';
import { Bell, Search, Menu, Sparkles, Command } from 'lucide-react';
import { useMobileNav } from './MobileNavContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    role: 'ADMIN' | 'STAFF';
    job_title?: string | null;
    department?: string | null;
    avatar_url?: string | null;
  };
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, user, actions }: HeaderProps) {
  const { toggle } = useMobileNav();
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Formatted date string
  const todayDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left Area: Mobile Menu Toggle + Title Info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 md:hidden transition-colors shadow-2xs cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-base sm:text-lg font-bold text-slate-900 leading-none truncate">
              {title}
            </h1>
            <span className="hidden sm:inline-flex text-[11px] font-sans font-medium text-slate-500">
              &bull; {todayDateStr}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-600 font-sans mt-0.5 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls: Actions + Quick Search + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {/* Global Quick Search Pill */}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 lg:flex hover:border-slate-300 transition-colors shadow-2xs">
          <Search className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-sans">Search records, deals, tasks...</span>
          <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-600">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          </button>

          {showNotificationToast && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-50 animate-in fade-in-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900 font-heading">
                  System Notifications
                </span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-slate-800 font-medium text-[11px]">Database synced successfully</p>
                    <p className="text-slate-500 text-[10px]">Real-time RLS connection active</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* User Profile Dropdown */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}


'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  UserCheck, 
  TrendingUp, 
  MessageSquare, 
  CheckSquare, 
  Users, 
  Settings,
  ShieldCheck,
  BarChart3,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileNav } from './MobileNavContext';

interface NavGroup {
  groupName: string;
  items: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

const navGroups: NavGroup[] = [
  {
    groupName: 'Platform Overview',
    items: [
      { label: 'Executive Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    ],
  },
  {
    groupName: 'Revenue Operations',
    items: [
      { label: 'Client Accounts', href: '/admin/customers', icon: Building2 },
      { label: 'Leads Pipeline', href: '/admin/leads', icon: UserCheck },
      { label: 'Deals & Revenue', href: '/admin/deals', icon: TrendingUp },
      { label: 'Activity Hub', href: '/admin/interactions', icon: MessageSquare },
      { label: 'Tasks & Follow-ups', href: '/admin/tasks', icon: CheckSquare },
    ],
  },
  {
    groupName: 'Administration',
    items: [
      { label: 'Staff & Team', href: '/admin/staff', icon: Users },
      { label: 'CRM Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useMobileNav();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white text-slate-700 font-sans select-none border-r border-slate-200">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs font-heading font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
              AP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-sm font-bold tracking-tight text-slate-900 leading-none">
                  Apex CRM
                </span>
                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-sans font-semibold text-brand-700 border border-brand-200">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-sans flex items-center gap-1 mt-0.5 font-medium">
                <ShieldCheck className="w-3 h-3 text-brand-600" /> Admin Operations
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={close}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="overflow-y-auto px-3 py-4 space-y-6 max-h-[calc(100vh-140px)]">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading">
                {group.groupName}
              </div>
              <nav className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={close}
                      className={cn(
                        'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-200/70'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                          )}
                        />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Status */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              PostgreSQL RLS Active
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-500">Tier 1</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Role-based multi-tenant isolation enforced.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}


import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2, TrendingUp, Users, Zap, Building2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-12 bg-slate-50 font-sans">
      {/* Left Form Area */}
      <div className="flex min-h-screen flex-col justify-between p-6 sm:p-10 lg:col-span-7 xl:col-span-6 lg:p-14">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="font-heading font-bold text-sm tracking-tight text-white">AP</span>
            </div>
            <div>
              <span className="font-heading text-base font-bold tracking-tight text-slate-900 leading-none block">
                Apex CRM
              </span>
              <span className="text-[11px] text-slate-500 font-medium font-sans">Enterprise Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Systems Normal</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="my-auto py-8 w-full max-w-md mx-auto">
          {children}
        </div>

        {/* Footer Security Badges */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> 256-bit AES
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> PostgreSQL RLS
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-brand-600" /> SOC2 Compliant
            </span>
          </div>
          <span className="text-slate-400">© 2026 Apex CRM Inc.</span>
        </div>
      </div>

      {/* Right Hero Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative bg-slate-950 text-white flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        {/* Top Feature Tag */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 border border-slate-800 px-3 py-1 text-xs font-semibold text-brand-400 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" /> High Velocity Revenue Operating System
          </div>
        </div>

        {/* Center Value Proposition & Live Metric Mockups */}
        <div className="relative z-10 space-y-8 my-auto py-12">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Manage accounts, pipeline, and follow-ups with surgical precision.
            </h2>
            <p className="text-sm xl:text-base text-slate-400 font-normal leading-relaxed max-w-lg">
              Enterprise-grade relationship platform built on PostgreSQL Row Level Security, deterministic conversion workflows, and multi-currency reporting.
            </p>
          </div>

          {/* Metric Highlight Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Deals</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">$12.4M</div>
              <p className="text-[11px] text-slate-400">Across 7 pipeline stages</p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4 backdrop-blur-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Conversion Rate</span>
                <Users className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">34.8%</div>
              <p className="text-[11px] text-slate-400">Lead-to-Customer conversion</p>
            </div>
          </div>

          {/* Customer Quote */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5 backdrop-blur-xs">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &ldquo;Apex CRM gave our leadership complete visibility across our sales pipeline while enforcing strict territory privacy for our sales team.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 font-heading">
                SC
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Sarah Chen</span>
                <span className="text-[10px] text-slate-400 block">Head of Revenue Operations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom System Pill */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 pt-4">
          <span>Apex CRM v2.0 Enterprise</span>
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Multi-Tenant RLS
          </span>
        </div>
      </div>
    </div>
  );
}


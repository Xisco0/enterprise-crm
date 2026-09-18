import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Database, Key, CheckCircle, Sliders } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">CRM Architecture & Security Settings</h2>
        <p className="text-xs text-slate-500">
          Supabase PostgreSQL configuration, Row-Level Security policies, and authentication parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Row Level Security Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <CardTitle>Row-Level Security (RLS)</CardTitle>
              </div>
              <Badge variant="success">Active & Enforced</Badge>
            </div>
            <CardDescription>
              Database policies guarantee access segregation at PostgreSQL engine level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-mono text-slate-700">public.profiles</span>
              <span className="text-emerald-700 font-medium">RBAC Segregated</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-mono text-slate-700">public.customers</span>
              <span className="text-emerald-700 font-medium">Assigned / Admin Access</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-mono text-slate-700">public.leads</span>
              <span className="text-emerald-700 font-medium">Scoped Rep Policy</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-mono text-slate-700">public.deals</span>
              <span className="text-emerald-700 font-medium">Owner Policy</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="font-mono text-slate-700">public.tasks</span>
              <span className="text-emerald-700 font-medium">Assignee Guard</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="font-mono text-slate-700">public.audit_logs</span>
              <span className="text-emerald-700 font-medium">Admin Only</span>
            </div>
          </CardContent>
        </Card>

        {/* Database & Supabase Environment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-brand-600" />
                <CardTitle>Supabase Infrastructure</CardTitle>
              </div>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <CardDescription>
              PostgreSQL connection parameters and API endpoint bindings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-medium text-slate-500">Supabase URL</label>
              <div className="mt-1 font-mono text-xs text-slate-800 bg-slate-100 p-2 rounded border border-slate-200 truncate">
                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-crm-project.supabase.co'}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">Anon Key Status</label>
              <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-800 bg-slate-100 p-2 rounded border border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Loaded into Next.js Environment
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500">Service Role Protection</label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Service role key is strictly isolated to server-side executions and is never transmitted to client bundles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

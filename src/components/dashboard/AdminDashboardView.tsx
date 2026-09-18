'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AdminDashboardData,
  TaskWithDetails,
  DealWithDetails,
  InteractionWithPerformer 
} from '@/types/crm';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  FileText,
  MessageSquare,
  ArrowUpRight,
  Briefcase,
  UserCheck,
  Clock,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  CheckSquare,
  Square,
  RotateCw,
  Zap
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';
import { DEAL_STAGE_CONFIG, TASK_PRIORITY_CONFIG, TASK_STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/lib/constants';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { InteractionFormModal } from '@/components/interactions/InteractionFormModal';
import { toggleTaskComplete } from '@/lib/actions/tasks';
import { useRouter } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AdminDashboardViewProps {
  data: AdminDashboardData;
}

export function AdminDashboardView({ data }: AdminDashboardViewProps) {
  const router = useRouter();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const primaryPipeline = data.pipelineByCurrency[0] || { currency: 'NGN', totalValue: 0, count: 0 };

  const handleQuickToggleTask = async (task: TaskWithDetails) => {
    try {
      setCompletingTaskId(task.id);
      const willBeCompleted = task.status !== 'COMPLETED';
      await toggleTaskComplete(task.id, willBeCompleted);
      router.refresh();
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Stage column styling definitions
  const stageColColors: Record<string, { headerBg: string; border: string; text: string }> = {
    NEW: { headerBg: 'bg-sky-100/80', border: 'border-sky-200', text: 'text-sky-900' },
    QUALIFICATION: { headerBg: 'bg-emerald-100/80', border: 'border-emerald-200', text: 'text-emerald-900' },
    PROPOSAL: { headerBg: 'bg-amber-100/80', border: 'border-amber-200', text: 'text-amber-900' },
    NEGOTIATION: { headerBg: 'bg-rose-100/80', border: 'border-rose-200', text: 'text-rose-900' },
    CLOSED_WON: { headerBg: 'bg-emerald-200/80', border: 'border-emerald-300', text: 'text-emerald-950' },
    CLOSED_LOST: { headerBg: 'bg-rose-200/80', border: 'border-rose-300', text: 'text-rose-950' },
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* 1. Top Welcome Banner & Quick Action Controls */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {greeting}, Revenue Operations
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Executive Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-2xl">
            Real-time pipeline valuation, team resource allocations, and operational health metrics across all territories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2 xl:pt-0">
          {/* Pipeline Health Status Donut Gauge */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 shadow-2xs">
            <div className="text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 font-heading">
                Pipeline Health Status
              </span>
              <div className="relative mt-1 flex h-11 w-11 items-center justify-center mx-auto">
                <svg className="h-11 w-11 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500"
                    strokeDasharray="25, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="65, 100"
                    strokeDashoffset="-25"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold leading-none text-emerald-600 font-heading">On</span>
                  <span className="text-[9px] font-bold leading-none text-emerald-600 font-heading">Track</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsInteractionModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5 text-slate-500" /> Log Activity
            </button>

            <button
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" /> New Task
            </button>

            <Link href="/admin/deals/new">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer">
                <Plus className="h-3.5 w-3.5 text-slate-600" /> New Deal
              </span>
            </Link>

            <Link href="/admin/leads/new">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer">
                <Plus className="h-3.5 w-3.5 text-slate-600" /> New Lead
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Switcher & Filter / Compare Row */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
          <TabsList>
            <TabsTrigger value="overview">Executive Overview</TabsTrigger>
            <TabsTrigger value="analytics">Pipeline & Deals</TabsTrigger>
            <TabsTrigger value="workload">Team Capacity</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" /> Refresh Data
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Compare to:</span>
              <select
                aria-label="Compare time range"
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer shadow-2xs transition-all"
              >
                <option>vs Last Month</option>
                <option>vs Last Quarter</option>
                <option>vs Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Primary KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Pipeline Valuation"
              value={formatCurrency(primaryPipeline.totalValue, primaryPipeline.currency)}
              subtitle={`${data.openDealsCount} opportunities currently in flight`}
              trend="up"
              change="+14.2%"
              badgeStyle="trend"
              icon={TrendingUp}
              iconColor="sky"
            />
            <StatCard
              title="Client Accounts"
              value={data.totalCustomers}
              subtitle={`${data.activeCustomers} active enterprise organizations`}
              trend="neutral"
              change="vs Last Month"
              badgeStyle="pill"
              icon={Users}
              iconColor="emerald"
            />
            <StatCard
              title="Active Prospect Leads"
              value={data.activeLeads}
              subtitle="Qualified inbound & territory prospects"
              trend="up"
              change="+8.5%"
              badgeStyle="trend"
              icon={Target}
              iconColor="purple"
            />
            <StatCard
              title="Actionable Team Tasks"
              value={data.taskWorkload.pendingCount + data.taskWorkload.inProgressCount}
              subtitle={`${data.taskWorkload.overdueCount} require immediate follow-up`}
              trend="down"
              change={data.taskWorkload.overdueCount > 0 ? `${data.taskWorkload.overdueCount} overdue` : 'On track'}
              badgeStyle={data.taskWorkload.overdueCount > 0 ? 'warning' : 'trend'}
              icon={AlertTriangle}
              iconColor="amber"
            />
          </div>

      {/* 3. Monthly Won/Lost Performance & Pipeline Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Closed Won This Month */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 font-heading">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Closed Won (This Month)
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
              +{data.wonDealsThisMonth.count}
            </span>
          </div>
          <div className="my-2 flex items-center gap-4">
            <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(data.wonDealsThisMonth.totalValue, data.wonDealsThisMonth.currency)}
            </span>
            <div className="flex-1 h-3 rounded-full bg-emerald-100 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(15, (data.wonDealsThisMonth.count / 3) * 100))}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            <strong className="font-semibold text-slate-700">{data.wonDealsThisMonth.count} contractual deals</strong> closed won
          </p>
        </div>

        {/* Closed Lost This Month */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 font-heading">
              <TrendingDown className="w-4 h-4 text-rose-600" /> Closed Lost (This Month)
            </span>
            <span className="inline-flex items-center rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-800">
              {data.lostDealsThisMonth.count}
            </span>
          </div>
          <div className="my-2 flex items-center gap-4">
            <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(data.lostDealsThisMonth.totalValue, data.lostDealsThisMonth.currency)}
            </span>
            <div className="flex-1 h-3 rounded-full bg-rose-100 overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (data.lostDealsThisMonth.count / 3) * 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            <strong className="font-semibold text-slate-700">{data.lostDealsThisMonth.count} deals</strong> lost or disqualified
          </p>
        </div>

        {/* Pipeline Currencies */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:col-span-2 lg:col-span-1 cursor-pointer">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
              <Briefcase className="w-4 h-4 text-slate-500" /> Pipeline Currencies
            </span>
            <span className="text-[10px] text-slate-500 font-sans font-medium">
              {data.pipelineByCurrency.length} Active
            </span>
          </div>
          <div className="mt-2 space-y-2">
            {data.pipelineByCurrency.map((curr) => (
              <div key={curr.currency} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">{curr.currency === 'USD' ? '🇺🇸' : '🇳🇬'}</span>
                  <span className="font-sans font-bold text-slate-800">{curr.currency}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(curr.totalValue, curr.currency)}</span>
                  <span className="text-slate-500 font-sans">({curr.count})</span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="font-sans text-slate-600 font-medium">NGN</span>
                  <span className="font-bold text-slate-900">{formatCurrency(curr.totalValue, 'NGN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Sales Pipeline Distribution & Stage Valuation (Funnel Visualizer) */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <CardTitle>Sales Pipeline Distribution & Stage Valuation (USD / NGN Cross-Value)</CardTitle>
            <CardDescription>Live opportunity valuation across sequential CRM pipeline stages</CardDescription>
          </div>
          <Link
            href="/admin/deals/pipeline"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
          >
            Open Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['NEW', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'].map((stageKey) => {
              const stageItem = data.pipelineByStage.find((s) => s.stage === stageKey) || {
                stage: stageKey as any,
                totalValue: 0,
                count: 0,
                currency: 'NGN',
              };
              const config = DEAL_STAGE_CONFIG[stageKey as keyof typeof DEAL_STAGE_CONFIG] || {
                label: stageKey,
                bg: 'bg-slate-50',
                color: 'text-slate-700',
                border: 'border-slate-200',
              };
              const stageStyle = stageColColors[stageKey] || {
                headerBg: 'bg-slate-100',
                border: 'border-slate-200',
                text: 'text-slate-800',
              };

              // Find deals belonging to this stage
              const stageDeals = data.recentDeals.filter((d) => d.stage === stageKey);

              return (
                <div
                  key={stageKey}
                  className={`rounded-2xl border ${stageStyle.border} bg-slate-50/40 p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-sm`}
                >
                  <div>
                    {/* Stage Header Pill */}
                    <div className={`flex items-center justify-between rounded-xl ${stageStyle.headerBg} p-2.5 border ${stageStyle.border}`}>
                      <span className={`text-xs font-bold font-heading uppercase tracking-wide ${stageStyle.text}`}>
                        {config.label}
                      </span>
                      <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold font-sans text-slate-800 shadow-2xs">
                        {stageItem.count}
                      </span>
                    </div>

                    {/* Stage Total Metric */}
                    <div className="mt-3 text-base font-bold font-sans text-slate-900">
                      {formatCurrency(stageItem.totalValue, stageItem.currency)}
                    </div>

                    {/* Deals Cards in this stage */}
                    <div className="mt-3 space-y-2">
                      {stageDeals.length > 0 ? (
                        stageDeals.slice(0, 2).map((deal) => (
                          <Link
                            key={deal.id}
                            href={`/admin/deals/${deal.id}`}
                            className="block rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
                          >
                            <div className="font-semibold text-slate-900 text-xs truncate">
                              {deal.title}
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-sans font-bold text-slate-800">
                                {formatCurrency(deal.amount ?? deal.value, deal.currency)}
                              </span>
                              <span className="truncate max-w-[90px]">
                                {deal.customer?.company_name || deal.lead?.company || 'Prospect'}
                              </span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-400">
                          No active opportunities
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-2 border-t border-slate-200/60">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.max(10, (stageItem.count / (data.openDealsCount || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. Middle Section: Staff Workload & Urgent Follow-ups */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Staff Workload Table (2 Columns) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle>Staff Workload & Resource Allocation</CardTitle>
              <CardDescription>Live pipeline value, open deals, and task backlog per sales representative</CardDescription>
            </div>
            <Link
              href="/admin/staff"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
            >
              Staff Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Team Member</TableHead>
                    <TableHead className="font-semibold text-slate-700">Role</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700">Active Leads</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700">Open Deals</TableHead>
                    <TableHead className="font-semibold text-slate-700">Pipeline Value</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700">Open Tasks</TableHead>
                    <TableHead className="text-center font-semibold text-slate-700">Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.staffWorkload.map((staff) => (
                    <TableRow key={staff.staffId} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800 uppercase font-heading border border-slate-200">
                            {staff.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-xs truncate">{staff.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">{staff.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={staff.role === 'ADMIN' ? 'purple' : 'info'}
                          className="text-[10px] font-semibold"
                        >
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-xs text-slate-800 font-sans">
                        {staff.activeLeadsCount}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-xs text-slate-800 font-sans">
                        {staff.openDealsCount}
                      </TableCell>
                      <TableCell className="font-sans text-xs font-bold text-slate-900">
                        {formatCurrency(staff.openDealsValueUSD)}
                      </TableCell>
                      <TableCell className="text-center text-xs font-medium text-slate-700 font-sans">
                        {staff.pendingTasksCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {staff.overdueTasksCount > 0 ? (
                          <Badge variant="destructive" className="text-[10px] font-bold">
                            {staff.overdueTasksCount} overdue
                          </Badge>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold font-sans">0</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Priority Follow-ups (1 Column) */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle>Priority Follow-ups</CardTitle>
              {data.taskWorkload.overdueCount > 0 ? (
                <Badge variant="destructive" className="text-[10px] font-bold">
                  {data.taskWorkload.overdueCount} Overdue
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] font-semibold">
                  All Current
                </Badge>
              )}
            </div>
            <CardDescription>Urgent tasks requiring management oversight</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            {data.urgentTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-500 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-semibold text-slate-800 text-xs">No urgent follow-ups</p>
                <p className="text-[11px] text-slate-500">All scheduled actions are completed or on track.</p>
              </div>
            ) : (
              data.urgentTasks.map((task) => {
                const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
                const isOverdue =
                  task.status !== 'COMPLETED' &&
                  task.status !== 'CANCELLED' &&
                  Boolean(task.due_date) &&
                  new Date(task.due_date as string).getTime() < Date.now();

                return (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs space-y-2.5 transition-all hover:border-slate-300 hover:shadow-xs shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleTask(task)}
                          disabled={completingTaskId === task.id}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none transition-transform active:scale-90"
                          title="Click to mark complete"
                        >
                          {task.status === 'COMPLETED' ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 hover:text-emerald-600" />
                          )}
                        </button>
                        <span className="font-semibold text-slate-900 line-clamp-1 font-sans">
                          {task.title}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold font-sans tracking-tight shrink-0 ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 pl-6">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100 pl-6">
                      <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        Due: {formatDate(task.due_date)}
                      </span>
                      <span className="font-medium text-slate-700 truncate max-w-[130px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {task.assignee?.first_name} {task.assignee?.last_name}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. Bottom Section: Recent Opportunities + Omnichannel Activity Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Open Deals */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle>Recent High-Value Opportunities</CardTitle>
              <CardDescription>Latest active deals in late pipeline stages</CardDescription>
            </div>
            <Link
              href="/admin/deals"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
            >
              All Deals <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700">Opportunity</TableHead>
                    <TableHead className="font-semibold text-slate-700">Stage</TableHead>
                    <TableHead className="font-semibold text-slate-700">Value</TableHead>
                    <TableHead className="font-semibold text-slate-700">Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentDeals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-xs text-slate-500">
                        No active deals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentDeals.map((deal) => {
                      const stageConfig = DEAL_STAGE_CONFIG[deal.stage] || {
                        label: deal.stage,
                        bg: 'bg-slate-50',
                        color: 'text-slate-700',
                        border: 'border-slate-200',
                      };
                      const clientName = deal.customer?.company_name || deal.lead?.company || 'Corporate Prospect';
                      return (
                        <TableRow key={deal.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell>
                            <Link 
                              href={`/admin/deals/${deal.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600 text-xs font-sans block truncate transition-colors"
                            >
                              {deal.title}
                            </Link>
                            <div className="text-[11px] text-slate-500 truncate">{clientName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-semibold ${stageConfig.bg} ${stageConfig.color} border ${stageConfig.border}`}
                            >
                              {stageConfig.label} ({deal.probability}%)
                            </Badge>
                          </TableCell>
                          <TableCell className="font-sans font-bold text-slate-900 text-xs">
                            {formatCurrency(deal.amount ?? deal.value, deal.currency)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium">
                            {deal.assignee ? `${deal.assignee.first_name} ${deal.assignee.last_name}` : 'Unassigned'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Omnichannel Team Activity Feed */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle>Omnichannel Activity Feed</CardTitle>
              <CardDescription>Live stream of client calls, meetings, emails, and notes</CardDescription>
            </div>
            <Link
              href="/admin/interactions"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
            >
              Activity Hub <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {data.recentActivities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No recent interactions logged yet.
                </div>
              ) : (
                data.recentActivities.map((interaction) => {
                  const Icon =
                    interaction.type === 'CALL'
                      ? Phone
                      : interaction.type === 'EMAIL'
                      ? Mail
                      : interaction.type === 'MEETING'
                      ? Calendar
                      : FileText;
                  const relatedTo =
                    interaction.customer?.company_name || interaction.lead?.company || 'Enterprise Client';

                  return (
                    <div
                      key={interaction.id}
                      className="flex items-start gap-3.5 p-4 text-xs transition-colors hover:bg-slate-50/80 cursor-pointer"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mt-0.5 border border-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-slate-900 truncate">{interaction.subject}</span>
                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-sans text-slate-600">
                              {interaction.type}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                            {formatRelativeTime(interaction.performed_at || interaction.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-1">
                          {interaction.notes || interaction.description}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                          <span>
                            Logged by: <strong className="text-slate-700">{interaction.performer?.first_name} {interaction.performer?.last_name}</strong>
                          </span>
                          <span>&bull;</span>
                          <span className="truncate max-w-[160px]">
                            Target: <strong className="text-slate-700">{relatedTo}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Analytics Tab Content */}
        <TabsContent value="analytics" className="space-y-6 mt-0">
          {/* Monthly Won/Lost & Currencies */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 font-heading">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Closed Won (This Month)
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  +{data.wonDealsThisMonth.count}
                </span>
              </div>
              <div className="my-2 flex items-center gap-4">
                <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(data.wonDealsThisMonth.totalValue, data.wonDealsThisMonth.currency)}
                </span>
                <div className="flex-1 h-3 rounded-full bg-emerald-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(15, (data.wonDealsThisMonth.count / 3) * 100))}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                <strong className="font-semibold text-slate-700">{data.wonDealsThisMonth.count} contractual deals</strong> closed won
              </p>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-md cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5 font-heading">
                  <TrendingDown className="w-4 h-4 text-rose-600" /> Closed Lost (This Month)
                </span>
                <span className="inline-flex items-center rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-xs font-bold text-rose-800">
                  {data.lostDealsThisMonth.count}
                </span>
              </div>
              <div className="my-2 flex items-center gap-4">
                <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(data.lostDealsThisMonth.totalValue, data.lostDealsThisMonth.currency)}
                </span>
                <div className="flex-1 h-3 rounded-full bg-rose-100 overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (data.lostDealsThisMonth.count / 3) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                <strong className="font-semibold text-slate-700">{data.lostDealsThisMonth.count} deals</strong> lost or disqualified
              </p>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:col-span-2 lg:col-span-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
                  <Briefcase className="w-4 h-4 text-slate-500" /> Pipeline Currencies
                </span>
                <span className="text-[10px] text-slate-500 font-sans font-medium">
                  {data.pipelineByCurrency.length} Active
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {data.pipelineByCurrency.map((curr) => (
                  <div key={curr.currency} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{curr.currency === 'USD' ? '🇺🇸' : '🇳🇬'}</span>
                      <span className="font-sans font-bold text-slate-800">{curr.currency}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(curr.totalValue, curr.currency)}</span>
                      <span className="text-slate-500 font-sans">({curr.count})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="font-sans text-slate-600 font-medium">NGN</span>
                      <span className="font-bold text-slate-900">{formatCurrency(curr.totalValue, 'NGN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales Pipeline Funnel */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <CardTitle>Sales Pipeline Distribution & Stage Valuation (USD / NGN Cross-Value)</CardTitle>
                <CardDescription>Live opportunity valuation across sequential CRM pipeline stages</CardDescription>
              </div>
              <Link
                href="/admin/deals/pipeline"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
              >
                Open Kanban Board <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {['NEW', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'].map((stageKey) => {
                  const stageItem = data.pipelineByStage.find((s) => s.stage === stageKey) || {
                    stage: stageKey as any,
                    totalValue: 0,
                    count: 0,
                    currency: 'NGN',
                  };
                  const config = DEAL_STAGE_CONFIG[stageKey as keyof typeof DEAL_STAGE_CONFIG] || {
                    label: stageKey,
                    bg: 'bg-slate-50',
                    color: 'text-slate-700',
                    border: 'border-slate-200',
                  };
                  const stageStyle = stageColColors[stageKey] || {
                    headerBg: 'bg-slate-100',
                    border: 'border-slate-200',
                    text: 'text-slate-800',
                  };
                  const stageDeals = data.recentDeals.filter((d) => d.stage === stageKey);

                  return (
                    <div
                      key={stageKey}
                      className={`rounded-2xl border ${stageStyle.border} bg-slate-50/40 p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-sm`}
                    >
                      <div>
                        <div className={`flex items-center justify-between rounded-xl ${stageStyle.headerBg} p-2.5 border ${stageStyle.border}`}>
                          <span className={`text-xs font-bold font-heading uppercase tracking-wide ${stageStyle.text}`}>
                            {config.label}
                          </span>
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold font-sans text-slate-800 shadow-2xs">
                            {stageItem.count}
                          </span>
                        </div>
                        <div className="mt-3 text-base font-bold font-sans text-slate-900">
                          {formatCurrency(stageItem.totalValue, stageItem.currency)}
                        </div>
                        <div className="mt-3 space-y-2">
                          {stageDeals.length > 0 ? (
                            stageDeals.slice(0, 2).map((deal) => (
                              <Link
                                key={deal.id}
                                href={`/admin/deals/${deal.id}`}
                                className="block rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
                              >
                                <div className="font-semibold text-slate-900 text-xs truncate">
                                  {deal.title}
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                  <span className="font-sans font-bold text-slate-800">
                                    {formatCurrency(deal.amount ?? deal.value, deal.currency)}
                                  </span>
                                  <span className="truncate max-w-[90px]">
                                    {deal.customer?.company_name || deal.lead?.company || 'Prospect'}
                                  </span>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-400">
                              No active opportunities
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-200/60">
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(10, (stageItem.count / (data.openDealsCount || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Deals Table */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <CardTitle>Recent High-Value Opportunities</CardTitle>
                <CardDescription>Latest active deals in late pipeline stages</CardDescription>
              </div>
              <Link
                href="/admin/deals"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
              >
                All Deals <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Opportunity</TableHead>
                      <TableHead className="font-semibold text-slate-700">Stage</TableHead>
                      <TableHead className="font-semibold text-slate-700">Value</TableHead>
                      <TableHead className="font-semibold text-slate-700">Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentDeals.map((deal) => {
                      const stageConfig = DEAL_STAGE_CONFIG[deal.stage] || {
                        label: deal.stage,
                        bg: 'bg-slate-50',
                        color: 'text-slate-700',
                        border: 'border-slate-200',
                      };
                      return (
                        <TableRow key={deal.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell>
                            <Link 
                              href={`/admin/deals/${deal.id}`}
                              className="font-semibold text-slate-900 hover:text-blue-600 text-xs font-sans block truncate transition-colors"
                            >
                              {deal.title}
                            </Link>
                            <div className="text-[11px] text-slate-500 truncate">
                              {deal.customer?.company_name || deal.lead?.company || 'Corporate Prospect'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-semibold ${stageConfig.bg} ${stageConfig.color} border ${stageConfig.border}`}
                            >
                              {stageConfig.label} ({deal.probability}%)
                            </Badge>
                          </TableCell>
                          <TableCell className="font-sans font-bold text-slate-900 text-xs">
                            {formatCurrency(deal.amount ?? deal.value, deal.currency)}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium">
                            {deal.assignee ? `${deal.assignee.first_name} ${deal.assignee.last_name}` : 'Unassigned'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workload Tab Content */}
        <TabsContent value="workload" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Staff Workload Table (2 Columns) */}
            <Card className="lg:col-span-2 border-slate-200 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <CardTitle>Staff Workload & Resource Allocation</CardTitle>
                  <CardDescription>Live pipeline value, open deals, and task backlog per sales representative</CardDescription>
                </div>
                <Link
                  href="/admin/staff"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-sans transition-colors"
                >
                  Staff Directory <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700">Team Member</TableHead>
                        <TableHead className="font-semibold text-slate-700">Role</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700">Active Leads</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700">Open Deals</TableHead>
                        <TableHead className="font-semibold text-slate-700">Pipeline Value</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700">Open Tasks</TableHead>
                        <TableHead className="text-center font-semibold text-slate-700">Overdue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.staffWorkload.map((staff) => (
                        <TableRow key={staff.staffId} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800 uppercase font-heading border border-slate-200">
                                {staff.name.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-xs truncate">{staff.name}</div>
                                <div className="text-[11px] text-slate-500 truncate">{staff.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={staff.role === 'ADMIN' ? 'purple' : 'info'}
                              className="text-[10px] font-semibold"
                            >
                              {staff.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold text-xs text-slate-800 font-sans">
                            {staff.activeLeadsCount}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-xs text-slate-800 font-sans">
                            {staff.openDealsCount}
                          </TableCell>
                          <TableCell className="font-sans text-xs font-bold text-slate-900">
                            {formatCurrency(staff.openDealsValueUSD)}
                          </TableCell>
                          <TableCell className="text-center text-xs font-medium text-slate-700 font-sans">
                            {staff.pendingTasksCount}
                          </TableCell>
                          <TableCell className="text-center">
                            {staff.overdueTasksCount > 0 ? (
                              <Badge variant="destructive" className="text-[10px] font-bold">
                                {staff.overdueTasksCount} overdue
                              </Badge>
                            ) : (
                              <span className="text-xs text-emerald-700 font-semibold font-sans">0</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Priority Follow-ups (1 Column) */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <CardTitle>Priority Follow-ups</CardTitle>
                  {data.taskWorkload.overdueCount > 0 ? (
                    <Badge variant="destructive" className="text-[10px] font-bold">
                      {data.taskWorkload.overdueCount} Overdue
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px] font-semibold">
                      All Current
                    </Badge>
                  )}
                </div>
                <CardDescription>Urgent tasks requiring management oversight</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                {data.urgentTasks.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-semibold text-slate-800 text-xs">No urgent follow-ups</p>
                    <p className="text-[11px] text-slate-500">All scheduled actions are completed or on track.</p>
                  </div>
                ) : (
                  data.urgentTasks.map((task) => {
                    const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
                    const isOverdue =
                      task.status !== 'COMPLETED' &&
                      task.status !== 'CANCELLED' &&
                      Boolean(task.due_date) &&
                      new Date(task.due_date as string).getTime() < Date.now();

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs space-y-2.5 transition-all hover:border-slate-300 hover:shadow-xs shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleQuickToggleTask(task)}
                              disabled={completingTaskId === task.id}
                              className="mt-0.5 text-slate-400 hover:text-emerald-600 focus:outline-none transition-transform active:scale-90"
                              title="Click to mark complete"
                            >
                              {task.status === 'COMPLETED' ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 hover:text-emerald-600" />
                              )}
                            </button>
                            <span className="font-semibold text-slate-900 line-clamp-1 font-sans">
                              {task.title}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold font-sans tracking-tight shrink-0 ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}
                          >
                            {priorityConfig.label}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-2 pl-6">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 border-t border-slate-100 pl-6">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            Due: {formatDate(task.due_date)}
                          </span>
                          <span className="font-medium text-slate-700 truncate max-w-[130px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {task.assignee?.first_name} {task.assignee?.last_name}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals for Quick Actions */}
      <TaskFormModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        currentUserId="00000000-0000-0000-0000-000000000001"
        onSuccess={() => {
          setIsTaskModalOpen(false);
          router.refresh();
        }}
      />

      <InteractionFormModal 
        isOpen={isInteractionModalOpen} 
        onClose={() => setIsInteractionModalOpen(false)} 
        currentUserId="00000000-0000-0000-0000-000000000001"
        onSuccess={() => {
          setIsInteractionModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}



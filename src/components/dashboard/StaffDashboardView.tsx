'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  StaffDashboardData,
  TaskWithDetails,
  DealWithDetails,
  LeadWithAssignee,
  InteractionWithPerformer 
} from '@/types/crm';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  DollarSign, 
  Target, 
  Building2, 
  Plus, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  ArrowUpRight,
  Clock,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  UserCheck,
  Sparkles,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { DEAL_STAGE_CONFIG, TASK_PRIORITY_CONFIG, LEAD_STATUS_CONFIG, TASK_TYPE_CONFIG } from '@/lib/constants';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { InteractionFormModal } from '@/components/interactions/InteractionFormModal';
import { toggleTaskComplete } from '@/lib/actions/tasks';
import { useRouter } from 'next/navigation';

interface StaffDashboardViewProps {
  data: StaffDashboardData;
}

export function StaffDashboardView({ data }: StaffDashboardViewProps) {
  const router = useRouter();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const primaryPipeline = data.myPipelineByCurrency[0] || { currency: 'NGN', totalValue: 0, count: 0 };

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

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Welcome Header & Quick Actions Banner */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-slate-900">
              {greeting}, {data.user.firstName || 'Sales Rep'}
            </h1>
            <Badge variant="info" className="text-xs font-semibold py-0.5 px-2 bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline text-blue-600" /> Sales Workspace
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans max-w-2xl">
            You have <strong className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{data.todayTasksCount} task(s)</strong> due today and <strong className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{data.myOpenDealsCount} active deal(s)</strong> in your pipeline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
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

          <Link href="/staff/deals/new">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer">
              <Plus className="h-3.5 w-3.5 text-slate-600" /> New Deal
            </span>
          </Link>

          <Link href="/staff/leads/new">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200 hover:border-slate-400 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-95 cursor-pointer">
              <Plus className="h-3.5 w-3.5 text-slate-600" /> New Lead
            </span>
          </Link>
        </div>
      </div>

      {/* Personal KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Pipeline Value"
          value={formatCurrency(primaryPipeline.totalValue, primaryPipeline.currency)}
          subtitle={`${data.myOpenDealsCount} opportunities assigned`}
          trend="up"
          change="+12.4%"
          badgeStyle="trend"
          iconColor="sky"
          icon={TrendingUp}
        />
        <StatCard
          title="My Active Deals"
          value={data.myOpenDealsCount}
          subtitle="In proposal & negotiation"
          trend="neutral"
          change="vs Last Month"
          badgeStyle="pill"
          iconColor="emerald"
          icon={Target}
        />
        <StatCard
          title="My Active Leads"
          value={data.myActiveLeadsCount}
          subtitle="Inbound prospects to qualify"
          trend="up"
          change="+8.5%"
          badgeStyle="trend"
          iconColor="purple"
          icon={Clock}
        />
        <StatCard
          title="My Client Accounts"
          value={data.myCustomersCount}
          subtitle="Direct enterprise accounts"
          trend="neutral"
          iconColor="amber"
          icon={Building2}
        />
      </div>

      {/* Main Grid: Today's Actionable Agenda + My Inbound Leads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Agenda / Actionable Tasks */}
        <Card className="flex flex-col border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-base font-heading">My Actionable Agenda</CardTitle>
                {data.overdueTasksCount > 0 && (
                  <Badge variant="destructive" className="text-[11px] font-semibold py-0.5 px-2">
                    {data.overdueTasksCount} Overdue
                  </Badge>
                )}
              </div>
              <CardDescription>Scheduled follow-ups and priority action items</CardDescription>
            </div>
            <Link 
              href="/staff/tasks" 
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors group"
            >
              All Tasks <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 flex-1 space-y-3">
            {data.todayAgendaTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending tasks scheduled for today.</p>
              </div>
            ) : (
              data.todayAgendaTasks.map((task) => {
                const priorityConfig = TASK_PRIORITY_CONFIG[task.priority] || TASK_PRIORITY_CONFIG.MEDIUM;
                const relatedName = task.customer?.company_name || task.lead?.company || task.deal?.title;
                const isOverdue = task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && Boolean(task.due_date) && new Date(task.due_date as string).getTime() < Date.now();
                const isPendingThis = completingTaskId === task.id;

                return (
                  <div 
                    key={task.id} 
                    className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all hover:border-brand-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleTask(task)}
                          disabled={isPendingThis}
                          aria-label="Toggle task status"
                          className="mt-0.5 text-slate-400 hover:text-brand-600 focus:outline-none transition-colors"
                        >
                          {task.status === 'COMPLETED' ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <h4 className={`text-xs font-bold text-slate-900 line-clamp-1 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-sans">{task.description}</p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold font-sans tracking-tight shrink-0 ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 mt-2.5 text-[11px] text-slate-500 border-t border-slate-100">
                      <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                        <Clock className="w-3 h-3" />
                        Due: {formatDate(task.due_date)}
                      </span>
                      {relatedName && (
                        <span className="truncate max-w-[170px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {relatedName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* My Inbound Leads */}
        <Card className="flex flex-col border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-heading">My Inbound Leads</CardTitle>
              <CardDescription>Prospects currently assigned to your pipeline</CardDescription>
            </div>
            <Link 
              href="/staff/leads" 
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors group"
            >
              Lead Roster <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Contact / Company</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Est. Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.myRecentLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-xs text-slate-500">
                      No active leads assigned to you.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.myRecentLeads.map((lead) => {
                    const statusConfig = LEAD_STATUS_CONFIG[lead.status] || {
                      label: lead.status,
                      bg: 'bg-slate-100',
                      color: 'text-slate-700',
                    };
                    const initials = `${lead.first_name?.[0] || ''}${lead.last_name?.[0] || ''}`.toUpperCase() || 'L';

                    return (
                      <TableRow key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700 border border-brand-200">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <Link 
                                href={`/staff/leads/${lead.id}`}
                                className="font-semibold text-slate-900 hover:text-brand-600 text-xs truncate block"
                              >
                                {lead.first_name} {lead.last_name}
                              </Link>
                              <div className="text-[11px] text-slate-500 truncate">{lead.company_name || lead.company || 'Individual'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-sans font-semibold text-slate-900 text-xs">
                          {formatCurrency(lead.estimated_value)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: My Active Deals + My Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Active Deals */}
        <Card className="flex flex-col border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-heading">My Deals in Pipeline</CardTitle>
              <CardDescription>Active sales opportunities assigned to you</CardDescription>
            </div>
            <Link 
              href="/staff/deals" 
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors group"
            >
              Full Pipeline <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Opportunity</TableHead>
                  <TableHead className="font-semibold text-slate-700">Stage</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Amount</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Target Close</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.myActiveDeals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-xs text-slate-500">
                      No active deals assigned to you.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.myActiveDeals.map((deal) => {
                    const stageConfig = DEAL_STAGE_CONFIG[deal.stage] || {
                      label: deal.stage,
                      bg: 'bg-slate-100',
                      color: 'text-slate-700',
                      border: 'border-slate-200',
                    };
                    const clientName = deal.customer?.company_name || deal.lead?.company || 'Prospective Client';

                    return (
                      <TableRow key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                        <TableCell>
                          <Link 
                            href={`/staff/deals/${deal.id}`}
                            className="font-semibold text-slate-900 hover:text-brand-600 text-xs block truncate"
                          >
                            {deal.title}
                          </Link>
                          <div className="text-[11px] text-slate-500 truncate">{clientName}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] font-semibold ${stageConfig.bg} ${stageConfig.color} border ${stageConfig.border}`}>
                            {stageConfig.label} ({deal.probability}%)
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-sans font-bold text-slate-900 text-xs">
                          {formatCurrency(deal.amount ?? deal.value, deal.currency)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-600">
                          {formatDate(deal.expected_close_date)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* My Recent Activities */}
        <Card className="flex flex-col border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-heading">My Logged Communications</CardTitle>
              <CardDescription>Recent calls, emails, and meetings you performed</CardDescription>
            </div>
            <Link 
              href="/staff/interactions" 
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors group"
            >
              Activity History <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {data.myRecentActivities.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No interactions logged recently.
                </div>
              ) : (
                data.myRecentActivities.map((interaction) => {
                  const Icon = interaction.type === 'CALL' ? Phone : interaction.type === 'EMAIL' ? Mail : interaction.type === 'MEETING' ? Calendar : MessageSquare;
                  const relatedTo = interaction.customer?.company_name || interaction.lead?.company || 'Account';

                  return (
                    <div key={interaction.id} className="flex items-start gap-3.5 p-3.5 text-xs transition-colors hover:bg-slate-50/70">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 mt-0.5 border border-slate-200 shadow-xs">
                        <Icon className="h-4 w-4 text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-slate-900 truncate">{interaction.subject}</span>
                            <Badge variant="outline" className="text-[9px] py-0 px-1 font-medium text-slate-600">{interaction.type}</Badge>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                            {formatRelativeTime(interaction.performed_at || interaction.created_at)}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-1 font-sans">
                          {interaction.notes || interaction.description}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500">
                          <span className="truncate max-w-[200px]">Account: <strong className="text-slate-700 font-medium">{relatedTo}</strong></span>
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

      {/* Modals for Quick Actions */}
      <TaskFormModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        currentUserId={data.user.id}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          router.refresh();
        }}
      />

      <InteractionFormModal 
        isOpen={isInteractionModalOpen} 
        onClose={() => setIsInteractionModalOpen(false)} 
        currentUserId={data.user.id}
        onSuccess={() => {
          setIsInteractionModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { InteractionWithPerformer } from '@/types/crm';
import { INTERACTION_TYPE_CONFIG } from '@/lib/constants';
import { deleteInteraction } from '@/lib/actions/interactions';
import { InteractionFormModal } from './InteractionFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  Mail,
  Users,
  FileText,
  Activity,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

interface ActivityTimelineProps {
  interactions: InteractionWithPerformer[];
  currentUserId: string;
  currentUserRole?: string;
  customerId?: string;
  customerName?: string;
  leadId?: string;
  leadName?: string;
  dealId?: string;
  dealTitle?: string;
  title?: string;
  showAddButton?: boolean;
}

export function ActivityTimeline({
  interactions,
  currentUserId,
  currentUserRole = 'STAFF',
  customerId,
  customerName,
  leadId,
  leadName,
  dealId,
  dealTitle,
  title = 'Activity & Interaction Timeline',
  showAddButton = true,
}: ActivityTimelineProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingInteraction, setEditingInteraction] = React.useState<InteractionWithPerformer | null>(null);
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (interaction: InteractionWithPerformer) => {
    setEditingInteraction(interaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this interaction record?')) {
      await deleteInteraction(id, currentUserId, currentUserRole);
    }
  };

  // Group interactions by Date
  const groupedInteractions = React.useMemo(() => {
    const groups: Record<string, InteractionWithPerformer[]> = {};

    interactions.forEach((item) => {
      const dateObj = new Date(item.interaction_at || item.created_at);
      const dateKey = dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  }, [interactions]);

  const dateKeys = Object.keys(groupedInteractions);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return <Phone className="h-3.5 w-3.5" />;
      case 'EMAIL':
        return <Mail className="h-3.5 w-3.5" />;
      case 'MEETING':
        return <Users className="h-3.5 w-3.5" />;
      case 'NOTE':
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-xs p-5 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-500" />
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological audit of client calls, meetings, emails, and internal notes.
          </p>
        </div>

        {showAddButton && (
          <Button
            size="sm"
            onClick={() => {
              setEditingInteraction(null);
              setIsModalOpen(true);
            }}
            className="h-8 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Log Activity
          </Button>
        )}
      </div>

      {/* Timeline Content */}
      {interactions.length === 0 ? (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <MessageSquare className="h-7 w-7 text-slate-400 mb-2" />
          <h3 className="text-xs font-semibold text-slate-800">No activity recorded yet</h3>
          <p className="mt-1 text-[11px] text-slate-500 max-w-sm">
            Start keeping track of conversations, meetings, emails, and notes for this account.
          </p>
          {showAddButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingInteraction(null);
                setIsModalOpen(true);
              }}
              className="mt-3 h-7 text-xs bg-white"
            >
              <Plus className="h-3 w-3 mr-1" /> Log First Activity
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {dateKeys.map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header Pill */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {dateKey}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Items under this Date */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {groupedInteractions[dateKey].map((item) => {
                  const cfg = INTERACTION_TYPE_CONFIG[item.type] || {
                    label: item.type,
                    color: 'text-slate-700',
                    bg: 'bg-slate-100',
                    border: 'border-slate-200',
                  };
                  const isExpanded = Boolean(expandedIds[item.id]);
                  const canEdit =
                    currentUserRole === 'ADMIN' || item.performed_by === currentUserId;

                  const timeStr = new Date(item.interaction_at || item.created_at).toLocaleTimeString(
                    'en-US',
                    {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    }
                  );

                  return (
                    <div
                      key={item.id}
                      className="relative rounded-md border border-slate-200/90 bg-white p-3.5 shadow-xs hover:border-slate-300 transition-all space-y-2"
                    >
                      {/* Left Dot on Timeline Bar */}
                      <div
                        className={`absolute -left-[27px] top-3.5 flex h-5 w-5 items-center justify-center rounded-full border bg-white ${cfg.color} ${cfg.border} shadow-xs`}
                      >
                        {getTypeIcon(item.type)}
                      </div>

                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold uppercase px-1.5 py-0 border ${cfg.border} ${cfg.bg} ${cfg.color}`}
                            >
                              {cfg.label}
                            </Badge>
                            <span className="font-mono text-[10px] text-slate-400">
                              {item.interaction_number}
                            </span>
                            <span className="text-[11px] text-slate-400">• {timeStr}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 pt-0.5">
                            {item.subject}
                          </h4>
                        </div>

                        {/* Actions (Edit / Delete) */}
                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-800"
                              title="Edit interaction"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="h-6 w-6 p-0 text-rose-400 hover:text-rose-700"
                              title="Delete interaction"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Description / Verbatim Content */}
                      <div className="text-xs text-slate-700 leading-relaxed">
                        {item.description && item.description.length > 180 && !isExpanded ? (
                          <div>
                            <p className="line-clamp-2">{item.description}</p>
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.id)}
                              className="inline-flex items-center text-[11px] font-semibold text-blue-600 hover:underline mt-1 cursor-pointer"
                            >
                              Read full notes <ChevronDown className="h-3 w-3 ml-0.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="whitespace-pre-line">{item.description || item.notes}</p>
                            {item.description && item.description.length > 180 && isExpanded && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(item.id)}
                                className="inline-flex items-center text-[11px] font-semibold text-blue-600 hover:underline mt-1 cursor-pointer"
                              >
                                Collapse <ChevronUp className="h-3 w-3 ml-0.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Meta Tags (Performer, Duration, Outcome) */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        {item.performer && (
                          <span className="text-slate-500">
                            Logged by{' '}
                            <strong className="text-slate-800 font-medium">
                              {item.performer.first_name} {item.performer.last_name}
                            </strong>
                          </span>
                        )}

                        {item.duration_minutes && (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {item.duration_minutes} mins
                          </span>
                        )}

                        {item.outcome && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            Outcome: {item.outcome}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record / Edit Activity Modal */}
      <InteractionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInteraction(null);
        }}
        currentUserId={currentUserId}
        initialData={editingInteraction}
        customerId={customerId}
        customerName={customerName}
        leadId={leadId}
        leadName={leadName}
        dealId={dealId}
        dealTitle={dealTitle}
      />
    </div>
  );
}

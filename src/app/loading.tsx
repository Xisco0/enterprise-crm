import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      <p className="mt-2 text-xs text-slate-400">Loading CRM data...</p>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring/diagnostics
    console.error('CRM Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Application Error Encountered</h2>
        <p className="mt-2 text-xs text-slate-500">
          An unexpected error occurred while executing this operation. The incident has been recorded for diagnostics.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => reset()} variant="primary" className="w-full text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full text-xs">
            Reload Application
          </Button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Record or Page Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">
          The requested CRM page or entity identifier does not exist or may have been archived.
        </p>

        <div className="mt-6">
          <Link href="/">
            <Button variant="primary" className="w-full text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await resetPassword(null, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.message) {
        setMessage(result.message);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-left">
        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-3 border border-slate-200">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Reset password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
          Enter your registered work email and we&apos;ll dispatch a secure recovery link.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs text-rose-800 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-sans">
            <span className="font-semibold block">Request failed</span>
            <span className="text-rose-700">{error}</span>
          </div>
        </div>
      )}

      {message && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-xs text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-sans">
            <span className="font-semibold block">Instructions sent</span>
            <span className="text-emerald-700">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Corporate Email"
          name="email"
          type="email"
          placeholder="name@enterprise.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
          disabled={isLoading}
          required
          autoComplete="email"
          className="h-10 text-sm font-sans"
        />

        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-heading font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 mt-2"
          isLoading={isLoading}
          disabled={isLoading || !email}
        >
          {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
        </Button>
      </form>

      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold font-sans transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

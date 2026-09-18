'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, Check } from 'lucide-react';

interface DemoAccount {
  name: string;
  roleTitle: string;
  email: string;
  password: string;
  roleBadge: 'ADMIN' | 'STAFF';
  avatarInitials: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Sarah Chen',
    roleTitle: 'Head of Revenue Ops',
    email: 'admin@enterprise.com',
    password: 'Password123!',
    roleBadge: 'ADMIN',
    avatarInitials: 'SC',
  },
  {
    name: 'Marcus Vance',
    roleTitle: 'Senior Account Executive',
    email: 'marcus.vance@enterprise.com',
    password: 'Password123!',
    roleBadge: 'STAFF',
    avatarInitials: 'MV',
  },
  {
    name: 'Elena Rostova',
    roleTitle: 'Sales Representative',
    email: 'elena.rostova@enterprise.com',
    password: 'Password123!',
    roleBadge: 'STAFF',
    avatarInitials: 'ER',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await login(null, formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      // Next.js redirect creates a NEXT_REDIRECT digest error which indicates successful redirect
      if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
        return;
      }
      setError('Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectDemo = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemo(account.email);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5 text-left">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-sans leading-relaxed">
          Sign in to access your CRM pipeline, accounts, and performance analytics.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-xs text-rose-800 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-sans">
            <span className="font-semibold block">Authentication failed</span>
            <span className="text-rose-700">{error}</span>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Work Email Address"
            name="email"
            type="email"
            placeholder="name@enterprise.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (selectedDemo && e.target.value !== selectedDemo) {
                setSelectedDemo(null);
              }
            }}
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            disabled={isLoading}
            required
            autoComplete="email"
            className="h-10 text-sm font-sans"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-700 font-sans">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors font-sans hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 focus:outline-none transition-colors p-1 rounded-md"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            disabled={isLoading}
            required
            autoComplete="current-password"
            className="h-10 text-sm font-sans"
          />
        </div>

        {/* Remember me option */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition-colors"
            />
            <span className="text-xs text-slate-600 font-medium font-sans">
              Remember me on this browser
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-heading font-semibold text-sm rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2 mt-2"
          isLoading={isLoading}
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            'Verifying credentials...'
          ) : (
            <>
              Sign In to Workspace
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Demo Credentials Section */}
      <div className="border-t border-slate-200/80 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 font-heading uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>1-Click Demo Accounts</span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">Click to pre-fill</span>
        </div>

        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((account) => {
            const isSelected = selectedDemo === account.email;
            return (
              <button
                key={account.email}
                type="button"
                onClick={() => handleSelectDemo(account)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold font-heading shrink-0 ${
                      account.roleBadge === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {account.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 font-sans">
                        {account.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md font-sans ${
                          account.roleBadge === 'ADMIN'
                            ? 'bg-purple-100/80 text-purple-700'
                            : 'bg-blue-100/80 text-blue-700'
                        }`}
                      >
                        {account.roleBadge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans block">
                      {account.roleTitle} &bull; {account.email}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isSelected ? (
                    <div className="h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="h-3 w-3" />
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 font-sans hover:text-slate-600">
                      Select
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

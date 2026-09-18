import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Header } from '@/components/layout/Header';
import { MobileNavProvider } from '@/components/layout/MobileNavContext';
import { Profile } from '@/types/crm';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile: Profile | null = await getCurrentProfile();

  if (profile && profile.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  // If in local mock preview mode or authenticated user
  const user: Profile = profile || {
    id: '00000000-0000-0000-0000-000000000001',
    user_id: '00000000-0000-0000-0000-000000000001',
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'admin@enterprise.com',
    role: 'ADMIN',
    status: 'ACTIVE',
    job_title: 'Head of Revenue Operations',
    department: 'Executive Leadership',
    phone: '+1 (555) 100-2001',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <AdminSidebar />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <Header
            title="Revenue Operations & Administration"
            subtitle="Organization-wide CRM pipeline, account visibility, and system management"
            user={user}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}


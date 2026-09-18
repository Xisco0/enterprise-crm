import React from 'react';
import { getCurrentProfile } from '@/lib/actions/auth';
import { StaffSidebar } from '@/components/layout/StaffSidebar';
import { Header } from '@/components/layout/Header';
import { MobileNavProvider } from '@/components/layout/MobileNavContext';
import { Profile } from '@/types/crm';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile: Profile | null = await getCurrentProfile();

  // If in local mock preview mode or authenticated user
  const user: Profile = profile || {
    id: '00000000-0000-0000-0000-000000000002',
    user_id: '00000000-0000-0000-0000-000000000002',
    first_name: 'Marcus',
    last_name: 'Vance',
    email: 'marcus.vance@enterprise.com',
    role: 'STAFF',
    status: 'ACTIVE',
    job_title: 'Senior Account Executive',
    department: 'Enterprise Sales',
    phone: '+1 (555) 200-3002',
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <StaffSidebar />
        <div className="md:pl-64 flex flex-col min-h-screen">
          <Header
            title="Sales Representative Workspace"
            subtitle="Assigned accounts, daily follow-ups, and active pipeline"
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


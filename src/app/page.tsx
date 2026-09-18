import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/actions/auth';

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  if (profile.role === 'ADMIN') {
    redirect('/admin/dashboard');
  }

  redirect('/staff/dashboard');
}

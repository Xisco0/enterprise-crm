import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/reset-password');
  const isAdminRoute = pathname.startsWith('/admin');
  const isStaffRoute = pathname.startsWith('/staff');
  const isRootRoute = pathname === '/';

  // 1. Unauthenticated users trying to access protected routes
  if (!user && (isAdminRoute || isStaffRoute)) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated user handling
  if (user) {
    // Fetch profile role
    const { data } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .single();

    const profile = data as { role?: string; status?: string } | null;
    const role = profile?.role ?? 'STAFF';
    const status = profile?.status ?? 'ACTIVE';

    if (status === 'SUSPENDED' || status === 'INACTIVE') {
      const redirectUrl = new URL('/unauthorized?reason=inactive', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Authenticated user accessing /login, /, or /reset-password -> redirect to their portal
    if (isAuthRoute || isRootRoute) {
      const targetPath = role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard';
      return NextResponse.redirect(new URL(targetPath, request.url));
    }

    // Role-based route guard: Staff attempting to access /admin/*
    if (isAdminRoute && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  // Sanitize next redirect parameter to avoid open redirects
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
      }
    } catch (err) {
      console.error('Error exchanging auth code for session:', err);
    }
  }

  // Return the user to login with an error message if code exchange failed
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin));
}

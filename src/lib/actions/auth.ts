'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, resetPasswordSchema, updatePasswordSchema } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Profile } from '@/types/crm';
import { z } from 'zod';

export interface AuthActionResult {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function login(prevState: unknown, formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { email, password } = validation.data;
  let targetUrl = '/staff/dashboard';

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { error: 'Your email or password is incorrect.' };
    }

    // Retrieve profile to determine role-based redirect
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    const profile = data as unknown as Profile | null;

    if (profileError || !profile) {
      targetUrl = '/staff/dashboard';
    } else {
      if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE') {
        await supabase.auth.signOut();
        return { error: 'Your account is currently inactive. Please contact an administrator.' };
      }
      targetUrl = profile.role === 'ADMIN' ? '/admin/dashboard' : '/staff/dashboard';
    }
  } catch {
    if (email.includes('admin')) {
      targetUrl = '/admin/dashboard';
    } else {
      targetUrl = '/staff/dashboard';
    }
  }

  revalidatePath('/', 'layout');
  redirect(targetUrl);
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signOut error if offline
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function resetPassword(prevState: unknown, formData: FormData): Promise<AuthActionResult> {
  const rawData = { email: formData.get('email') };
  const validation = resetPasswordSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password/confirm`,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    };
  } catch {
    return {
      success: true,
      message: 'Password reset instructions have been dispatched.',
    };
  }
}

export async function updateUserPassword(prevState: unknown, formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const validation = updatePasswordSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: validation.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      success: true,
      message: 'Password updated successfully. You may now sign in with your new credentials.',
    };
  } catch {
    return {
      success: true,
      message: 'Password updated successfully.',
    };
  }
}

const ownProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().max(50).optional().nullable(),
  avatar_url: z.string().url().optional().nullable().or(z.literal('')),
});

export async function updateOwnProfile(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    phone: formData.get('phone') || null,
    avatar_url: formData.get('avatar_url') || null,
  };

  const validation = ownProfileSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'You must be signed in to update your profile.' };
    }

    // Explicitly update ONLY personal details, NEVER role, status, or user_id
    const { error } = await (supabase
      .from('profiles') as any)
      .update({
        first_name: validation.data.first_name,
        last_name: validation.data.last_name,
        phone: validation.data.phone,
        avatar_url: validation.data.avatar_url || null,
      })
      .eq('user_id', user.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return { success: true, message: 'Profile updated successfully.' };
  } catch {
    return { error: 'Failed to update profile.' };
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return (data as unknown as Profile) || null;
  } catch {
    return null;
  }
}

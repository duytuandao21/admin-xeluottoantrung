'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button, FormField, Input } from '@/components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--muted)]">
    <form className="w-full max-w-md space-y-6 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 shadow-lg" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setError('');
      const form = new FormData(event.currentTarget);
      try { await login(String(form.get('email')), String(form.get('password'))); router.replace('/'); }
      catch (failure) { setError(failure instanceof Error ? failure.message : 'Không thể đăng nhập.'); }
      finally { setBusy(false); }
    }}>
      <div><h1 className="text-2xl font-bold">Quản trị Toàn Trung</h1><p className="mt-1 text-sm text-[var(--muted-fg)]">Đăng nhập bằng tài khoản quản trị</p></div>
      <FormField label="Email" required><Input type="email" name="email" autoComplete="email" required /></FormField>
      <FormField label="Mật khẩu" required><Input type="password" name="password" autoComplete="current-password" required /></FormField>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={busy} className="w-full justify-center">{busy ? 'Đang đăng nhập...' : 'Đăng nhập'}</Button>
    </form>
  </div>;
}

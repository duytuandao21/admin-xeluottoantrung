'use client';
import { PageHeader, Button, FormField, Input } from '@/components/ui';
import { Save, Shield, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { api, authClient, json } from '@/lib/api/client';

export default function AdminInfoPage() {
  const [showChangePass, setShowChangePass] = useState(false);
  const { identity, refresh } = useAuth();
  const profile = identity?.profile;
  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { await api('/admin/me', json('PATCH', { fullName: String(form.get('name') || '').trim(), phone: String(form.get('phone') || '').trim() })); await refresh(); toast.success('Đã cập nhật thông tin.'); }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không thể cập nhật thông tin.'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Thông tin Admin" subtitle="Quản lý tài khoản quản trị viên" />

      {/* Admin Profile Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="h-32 gradient-primary relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-[var(--card-bg)] shadow-xl">
              {profile?.fullName?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <h2 className="text-xl font-bold">{profile?.fullName || ''}</h2>
          <p className="text-sm text-[var(--muted-fg)]">{profile?.email || ''} • {identity?.roles.join(', ') || ''}</p>
        </div>
      </div>

      {/* Info Form */}
      <form onSubmit={saveProfile} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Thông tin cá nhân</h3>
            <p className="text-xs text-[var(--muted-fg)]">Cập nhật thông tin tài khoản admin</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Tên hiển thị"><Input key={profile?.fullName} name="name" defaultValue={profile?.fullName || ''} required /></FormField>
          <FormField label="Email"><Input type="email" value={profile?.email || ''} readOnly /></FormField>
          <FormField label="Số điện thoại"><Input key={profile?.phone || ''} name="phone" defaultValue={profile?.phone || ''} /></FormField>
          <FormField label="Vai trò"><Input value={identity?.roles.join(', ') || ''} disabled /></FormField>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit"><Save className="w-4 h-4" /> Lưu thay đổi</Button>
        </div>
      </form>

      {/* Change Password */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold">Đổi mật khẩu</h3>
              <p className="text-xs text-[var(--muted-fg)]">Cập nhật mật khẩu bảo mật</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowChangePass(!showChangePass)}>
            {showChangePass ? 'Ẩn' : 'Đổi mật khẩu'}
          </Button>
        </div>
        {showChangePass && (
          <form className="space-y-4 animate-fadeIn" onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get('password') || ''); if (password !== form.get('confirm')) { toast.error('Mật khẩu xác nhận không khớp.'); return; } const { error } = await authClient().auth.updateUser({ password }); if (error) toast.error(error.message); else { toast.success('Đã đổi mật khẩu.'); setShowChangePass(false); } }}>
            <FormField label="Mật khẩu mới"><Input name="password" type="password" minLength={8} autoComplete="new-password" required /></FormField>
            <FormField label="Xác nhận mật khẩu"><Input name="confirm" type="password" minLength={8} autoComplete="new-password" required /></FormField>
            <Button type="submit">Cập nhật mật khẩu</Button>
          </form>
        )}
      </div>
    </div>
  );
}

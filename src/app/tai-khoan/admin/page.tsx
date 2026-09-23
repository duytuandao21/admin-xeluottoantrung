'use client';
import { PageHeader, Button, FormField, Input } from '@/components/ui';
import { Save, Shield, Key } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLocalStore } from '@/lib/local-store';

export default function AdminInfoPage() {
  const [showChangePass, setShowChangePass] = useState(false);
  const [profile, setProfile] = useLocalStore('/tai-khoan/admin', { name: 'Administrator', email: 'admin@xeluottoantrung.com', phone: '0901234567' });
  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProfile({ name: String(form.get('name') || '').trim(), email: String(form.get('email') || '').trim(), phone: String(form.get('phone') || '').trim() });
    toast.success('Đã lưu thông tin trên trình duyệt này.');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Thông tin Admin" subtitle="Quản lý tài khoản quản trị viên" />

      {/* Admin Profile Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        <div className="h-32 gradient-primary relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-[var(--card-bg)] shadow-xl">
              A
            </div>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-sm text-[var(--muted-fg)]">{profile.email} • Super Admin</p>
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
          <FormField label="Tên hiển thị"><Input name="name" defaultValue={profile.name} required /></FormField>
          <FormField label="Email"><Input name="email" type="email" defaultValue={profile.email} required /></FormField>
          <FormField label="Số điện thoại"><Input name="phone" defaultValue={profile.phone} /></FormField>
          <FormField label="Vai trò"><Input defaultValue="Super Admin" disabled /></FormField>
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
          <div className="space-y-4 animate-fadeIn">
            <p className="text-sm text-[var(--muted-fg)]">Chức năng đổi mật khẩu cần kết nối hệ thống xác thực của website. Chưa có máy chủ xác thực trong project hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
}

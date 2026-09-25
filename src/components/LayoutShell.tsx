'use client';
import { useTheme } from '@/lib/theme-context';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LayoutShellClient({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useTheme();
  const { identity, loading, error, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => { if (!loading && !identity && !error && pathname !== '/dang-nhap') router.replace('/dang-nhap'); }, [identity, loading, error, pathname, router]);
  if (pathname === '/dang-nhap') return <>{children}</>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-[var(--muted-fg)]"><p role="alert">{error}</p><button className="text-red-600 underline" onClick={() => void refresh().catch(() => undefined)}>Thử lại</button></div>;
  if (loading || !identity) return <div className="min-h-screen flex items-center justify-center text-[var(--muted-fg)]">Đang kiểm tra phiên đăng nhập...</div>;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className={`min-w-0 max-w-full transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-[68px]'}`}>
        <Header />
        <main className="min-w-0 max-w-full overflow-x-hidden p-4 lg:p-6 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}

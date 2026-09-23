'use client';
import { useTheme } from '@/lib/theme-context';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function LayoutShellClient({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useTheme();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-[68px]'}`}>
        <Header />
        <main className="p-4 lg:p-6 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}

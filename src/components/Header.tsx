'use client';
import { useTheme } from '@/lib/theme-context';
import { Bell, Sun, Moon, Menu, LogOut, Key, Trash2, ExternalLink, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const notifications = [
    { label: 'Thư bán xe', count: 1895, href: '/thu/ban-xe' },
    { label: 'Thư lên đời xe', count: 68, href: '/thu/len-doi-xe' },
    { label: 'Yêu cầu gọi lại', count: 476, href: '/thu/yeu-cau-goi-lai' },
    { label: 'Đăng ký nhận tin', count: 522, href: '/thu/dang-ky-nhan-tin' },
  ];

  return (
    <>
      <header className="h-16 bg-[var(--card-bg)] border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 transition-theme sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <Menu className="w-5 h-5 text-[var(--muted-fg)]" />
          </button>
          <span className="hidden sm:block text-sm text-[var(--muted-fg)]">
            Xin chào, <span className="font-semibold text-[var(--foreground)]">Admin</span>!
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-sm text-[var(--muted-fg)] hover:bg-[var(--muted)] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm...</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border-color)] font-mono">Ctrl+K</kbd>
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5 text-[var(--muted-fg)]" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotif(!showNotif); setShowSettings(false); }}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[var(--muted-fg)]" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                !
              </span>
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl animate-scaleIn origin-top-right overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-color)]">
                  <p className="font-semibold text-sm">Thông báo</p>
                </div>
                {notifications.map((n, i) => (
                  <a key={i} href={n.href} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.label}</p>
                      <p className="text-xs text-[var(--muted-fg)]">{n.count.toLocaleString()} mới</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Settings dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => { setShowSettings(!showSettings); setShowNotif(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                A
              </div>
            </button>
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl animate-scaleIn origin-top-right overflow-hidden">
                <a href="/tai-khoan/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors text-sm">
                  <ExternalLink className="w-4 h-4 text-[var(--muted-fg)]" />
                  <span>Thông tin admin</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors text-sm">
                  <Key className="w-4 h-4 text-[var(--muted-fg)]" />
                  <span>Đổi mật khẩu</span>
                </a>
                <div className="border-t border-[var(--border-color)]" />
                <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors text-sm">
                  <Trash2 className="w-4 h-4 text-[var(--muted-fg)]" />
                  <span>Xóa bộ nhớ tạm</span>
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border-color)] animate-scaleIn overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
              <Search className="w-5 h-5 text-[var(--muted-fg)]" />
              <input
                autoFocus
                type="text"
                placeholder="Tìm kiếm trang, chức năng..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border-color)] font-mono">ESC</kbd>
            </div>
            <div className="p-2 max-h-[50vh] overflow-y-auto">
              <p className="px-3 py-2 text-xs font-semibold text-[var(--muted-fg)] uppercase">Trang phổ biến</p>
              {[
                { label: 'Tổng quan', href: '/' },
                { label: 'Danh sách xe', href: '/san-pham' },
                { label: 'Thư bán xe', href: '/thu/ban-xe' },
                { label: 'Thiết lập thông tin', href: '/thiet-lap/thong-tin' },
                { label: 'Thống kê', href: '/thong-ke' },
              ].map((item, i) => (
                <a key={i} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-sm" onClick={() => setSearchOpen(false)}>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

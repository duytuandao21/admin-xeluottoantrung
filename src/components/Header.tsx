'use client';
import { useTheme } from '@/lib/theme-context';
import { Bell, Sun, Moon, Menu, Key, ExternalLink, Search, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api, type PageResult } from '@/lib/api/client';
import { menuItems } from '@/components/Sidebar';

export default function Header() {
  const { theme, toggleTheme, sidebarOpen, setSidebarOpen } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { identity, logout } = useAuth();
  const profile = { name: identity?.profile.fullName || 'Quản trị viên' };
  const [counts, setCounts] = useState({ sell: 0, trade_in: 0, callback: 0 });
  useEffect(() => {
    let live = true;
    const loadCounts = () => { void Promise.all((['sell', 'trade_in', 'callback'] as const).map(type => api<PageResult<unknown>>(`/admin/leads?type=${type}&status=unread&limit=1`)))
      .then(([sell, trade, callback]) => { if (live) setCounts({ sell: sell.meta.total, trade_in: trade.meta.total, callback: callback.meta.total }); })
      .catch(() => { if (live) setCounts({ sell: 0, trade_in: 0, callback: 0 }); }); };
    loadCounts();
    window.addEventListener('admin-leads-change', loadCounts);
    return () => { live = false; window.removeEventListener('admin-leads-change', loadCounts); };
  }, []);
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
    { label: 'Thư bán xe', count: counts.sell, href: '/thu/ban-xe' },
    { label: 'Thư lên đời xe', count: counts.trade_in, href: '/thu/len-doi-xe' },
    { label: 'Yêu cầu gọi lại', count: counts.callback, href: '/thu/yeu-cau-goi-lai' },
    { label: 'Đăng ký nhận tin', count: 0, href: '/thu/dang-ky-nhan-tin' },
  ];
  const unreadCount = notifications.reduce((sum, notification) => sum + notification.count, 0);
  const searchPages = menuItems.flatMap(item => item.href ? [{ label: item.label, href: item.href }] : (item.children || []).flatMap(child => child.href ? [{ label: child.label, href: child.href }] : []));
  const searchResults = searchPages.filter(page => page.label.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi')));

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
            Xin chào, <span className="font-semibold text-[var(--foreground)]">{profile.name}</span>!
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
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl animate-scaleIn origin-top-right overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-color)]">
                  <p className="font-semibold text-sm">Thông báo</p>
                </div>
                {notifications.map((n, i) => (
                  <Link key={i} href={n.href} onClick={() => setShowNotif(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.label}</p>
                      <p className="text-xs text-[var(--muted-fg)]">{n.count.toLocaleString()} mới</p>
                    </div>
                  </Link>
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
                {profile.name.charAt(0).toUpperCase() || 'A'}
              </div>
            </button>
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl animate-scaleIn origin-top-right overflow-hidden">
                <Link href="/tai-khoan/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors text-sm">
                  <ExternalLink className="w-4 h-4 text-[var(--muted-fg)]" />
                  <span>Thông tin admin</span>
                </Link>
                <Link href="/tai-khoan/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)] transition-colors text-sm">
                  <Key className="w-4 h-4 text-[var(--muted-fg)]" />
                  <span>Đổi mật khẩu</span>
                </Link>
                <button type="button" onClick={async () => { await logout(); router.replace('/dang-nhap'); }} className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-[var(--muted)]"><LogOut className="w-4 h-4 text-[var(--muted-fg)]" /><span>Đăng xuất</span></button>
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
                value={search}
                onChange={event => setSearch(event.target.value)}
                onKeyDown={event => { if (event.key === 'Enter' && searchResults[0]) { router.push(searchResults[0].href); setSearchOpen(false); setSearch(''); } }}
                placeholder="Tìm kiếm trang, chức năng..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--muted)] border border-[var(--border-color)] font-mono">ESC</kbd>
            </div>
            <div className="p-2 max-h-[50vh] overflow-y-auto">
              <p className="px-3 py-2 text-xs font-semibold text-[var(--muted-fg)] uppercase">{search ? 'Kết quả tìm kiếm' : 'Trang phổ biến'}</p>
              {searchResults.map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-sm" onClick={() => { setSearchOpen(false); setSearch(''); }}>
                  <span>{item.label}</span>
                </Link>
              ))}
              {searchResults.length === 0 && <p className="px-3 py-2 text-sm text-[var(--muted-fg)]">Không tìm thấy trang phù hợp.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

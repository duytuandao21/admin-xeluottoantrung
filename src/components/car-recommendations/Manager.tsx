'use client';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { PageHeader, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { needsBase, type Settings } from '@/lib/car-recommendations';
import { useNeedsData, LoadState, Panel } from './shared';
import Overview from './Overview';
import History from './History';
import ConfigForm from './ConfigForm';
import Profiles from './Profiles';
import './needs-admin.css';
const tabs = [['overview', 'Tổng quan'], ['history', 'Lịch sử khảo sát'], ['settings', 'Cấu hình câu hỏi & thuật toán'], ['profiles', 'Đặc tính tư vấn xe']] as const;
export default function NeedsManager() {
  const { setSidebarOpen } = useTheme();
  useEffect(() => {
    const small = matchMedia('(max-width:767px)'), collapse = () => { if (small.matches) setSidebarOpen(false); };
    collapse(); small.addEventListener('change', collapse); return () => small.removeEventListener('change', collapse);
  }, [setSidebarOpen]);
  const { identity } = useAuth(), can = (key: string) => identity?.permissions.includes(`car_recommendation.${key}`) ?? false;
  const [tab, setTab] = useState('overview'), [revision, setRevision] = useState(0);
  const settings = useNeedsData<Settings>(can('sessions.read') ? `${needsBase}/settings` : null, revision), reload = () => setRevision(n => n + 1);
  if (!can('sessions.read')) return <Panel><p>Bạn không có quyền quản lý Mua xe theo nhu cầu.</p></Panel>;
  return <div className="tt-needs-admin space-y-5">
    <PageHeader title="Mua xe theo nhu cầu" subtitle="Theo dõi nhu cầu khách hàng và quản lý cách gợi ý xe trong kho." actions={<Button variant="secondary" onClick={reload}>Làm mới</Button>} />
    <nav className="tt-needs-admin-tabs" aria-label="Quản lý Mua xe theo nhu cầu">{tabs.map(([key, label]) => <button key={key} type="button" aria-current={tab === key ? 'page' : undefined} onClick={() => setTab(key)}>{label}</button>)}</nav>
    <LoadState {...settings} retry={reload} />
    {settings.data && <>{tab === 'overview' && <Overview revision={revision} />}{tab === 'history' && <History settings={settings.data} revision={revision} />}
      {tab === 'settings' && <ConfigForm key={settings.data.updatedAt} settings={settings.data} writable={can('settings.update')} saved={reload} />}
      {tab === 'profiles' && <Profiles settings={settings.data} writable={can('profiles.update')} revision={revision} />}</>}
  </div>;
}

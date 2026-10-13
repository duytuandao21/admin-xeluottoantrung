'use client';
import { useEffect, useState } from 'react';
import { BarChart3, ClipboardList, Gauge, RefreshCw, Settings2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { PageHeader, Button } from '@/components/ui';
import { ownershipBase, type Settings } from '@/lib/ownership';
import { LoadState, Panel, useOwnershipData } from './shared';
import SettingsForm from './SettingsForm';
import Profiles from './Profiles';
import Surveys from './Surveys';
import './ownership-admin.css';
export default function OwnershipManager() {
  const { identity } = useAuth(), can = (code: string) => identity?.permissions.includes(`ownership.${code}`) ?? false;
  const { setSidebarOpen } = useTheme();
  useEffect(() => { const small = matchMedia('(max-width:767px)'), collapse = () => { if (small.matches) setSidebarOpen(false); }; collapse(); small.addEventListener('change', collapse); return () => small.removeEventListener('change', collapse); }, [setSidebarOpen]);
  const [tab, setTab] = useState('overview'), [revision, setRevision] = useState(0), [dirty, setDirty] = useState(false), [vehicleFilter, setVehicleFilter] = useState('');
  const settings = useOwnershipData<Settings>(can('read') ? `${ownershipBase}/settings` : null, revision);
  const discard = () => !dirty || confirm('Bạn có thay đổi chưa lưu. Bỏ thay đổi để tiếp tục?');
  const reload = () => { if (discard()) setRevision(n => n + 1); };
  const saved = () => { setDirty(false); setRevision(n => n + 1); };
  const switchTab = (next: string) => { if (next === tab || !discard()) return; setDirty(false); setTab(next); };
  if (!can('read')) return <Panel><p>Bạn không có quyền xem Chi phí sử dụng xe.</p></Panel>;
  return <div className="tt-ownership-admin"><PageHeader title="Chi phí sử dụng xe" subtitle="Theo dõi nhu cầu sử dụng và quản lý các chi phí dự toán cho khách hàng." actions={<Button variant="secondary" onClick={reload}><RefreshCw size={18} aria-hidden="true" />Làm mới</Button>} />
    <nav className="tt-ownership-tabs" aria-label="Quản lý chi phí sử dụng">{[{ key: 'overview', name: 'Tổng quan', icon: BarChart3 }, { key: 'surveys', name: 'Lịch sử khảo sát', icon: ClipboardList }, { key: 'settings', name: 'Cấu hình chi phí', icon: Settings2 }, { key: 'profiles', name: 'Định mức theo xe', icon: Gauge }].map(({ key, name, icon: Icon }) => <button type="button" key={key} aria-current={tab === key ? 'page' : undefined} onClick={() => switchTab(key)}><Icon size={20} aria-hidden="true" />{name}</button>)}</nav>
    <LoadState {...settings} />{settings.data && <div className="tt-ownership-content">{(tab === 'overview' || tab === 'surveys') && <Surveys key={`${tab}-${vehicleFilter}`} view={tab === 'overview' ? 'overview' : 'history'} initialVehicleId={vehicleFilter} settings={settings.data.config} revision={revision} onVehicle={id => { setVehicleFilter(id); setTab('surveys'); }} />}{tab === 'settings' && <SettingsForm key={`${settings.data.updatedAt}-${revision}`} settings={settings.data} writable={can('settings.update')} saved={saved} onDirtyChange={setDirty} />}{tab === 'profiles' && <Profiles key={revision} policy={settings.data.config.policy} writable={can('profiles.update')} revision={revision} onDirtyChange={setDirty} />}</div>}
  </div>;
}

import { useEffect, useState } from 'react';
import { MonitorSmartphone, KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth.store';
import { sessionApi } from '@/api/session.api';
import { apiKeyApi } from '@/api/apiKey.api';

interface StatCard { label: string; value: string | number; icon: React.ReactNode; sub?: string; warn?: boolean }

const StatCard = ({ label, value, icon, sub, warn }: StatCard) => (
  <div className={`bg-slate-800 border rounded-xl p-5 flex items-start gap-4 ${warn ? 'border-yellow-500/40' : 'border-slate-700'}`}>
    <div className={`p-2.5 rounded-lg ${warn ? 'bg-yellow-500/10 text-yellow-400' : 'bg-brand-600/15 text-brand-400'}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-100 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [keyCount, setKeyCount] = useState<number | null>(null);

  useEffect(() => {
    sessionApi.getSessions().then((r) => setSessionCount(r.data.data.length)).catch(() => setSessionCount(0));
    apiKeyApi.listKeys().then((r) => setKeyCount(r.data.data.filter((k) => k.isActive).length)).catch(() => setKeyCount(0));
  }, []);

  return (
    <AppLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Here's a summary of your account activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Active sessions"
          value={sessionCount ?? '—'}
          icon={<MonitorSmartphone size={20} />}
          sub="Devices with open sessions"
        />
        <StatCard
          label="Active API keys"
          value={keyCount ?? '—'}
          icon={<KeyRound size={20} />}
          sub="Currently active keys"
        />
        <StatCard
          label="Email verification"
          value={user?.isEmailVerified ? 'Verified' : 'Unverified'}
          icon={user?.isEmailVerified ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          sub={user?.isEmailVerified ? 'Your email is confirmed' : 'Check your inbox'}
          warn={!user?.isEmailVerified}
        />
      </div>

      <Card header={<span className="text-sm font-semibold text-slate-200">Account details</span>}>
        <dl className="divide-y divide-slate-700/50">
          {[
            { label: 'Email', value: user?.email },
            { label: 'Name', value: user?.name ?? '—' },
            { label: 'Role', value: user?.role },
            { label: 'Account status', value: user?.isActive ? 'Active' : 'Locked' },
            { label: 'Last login', value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—' },
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex py-3 gap-4">
              <dt className="w-36 text-sm text-slate-400 shrink-0">{label}</dt>
              <dd className="text-sm text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </AppLayout>
  );
};

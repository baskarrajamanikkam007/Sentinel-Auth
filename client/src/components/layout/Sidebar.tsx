import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { toast } from '@/hooks/useToast';
import {
  ShieldCheck, LayoutDashboard, User, MonitorSmartphone,
  KeyRound, LogOut, Users, FileText, ChevronDown,
} from 'lucide-react';
import { Badge, roleBadge } from '@/components/ui/Badge';
import { useState } from 'react';

interface NavItem { to: string; icon: React.ReactNode; label: string }

const userNav: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/dashboard/profile', icon: <User size={16} />, label: 'Profile' },
  { to: '/dashboard/sessions', icon: <MonitorSmartphone size={16} />, label: 'Sessions' },
  { to: '/dashboard/api-keys', icon: <KeyRound size={16} />, label: 'API Keys' },
];

const adminNav: NavItem[] = [
  { to: '/admin/users', icon: <Users size={16} />, label: 'Users' },
  { to: '/admin/audit-logs', icon: <FileText size={16} />, label: 'Audit Logs' },
];

const NavItem = ({ item }: { item: NavItem }) => (
  <NavLink
    to={item.to}
    end={item.to === '/dashboard'}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
        isActive
          ? 'bg-brand-600/20 text-brand-300 font-medium'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
      )
    }
  >
    {item.icon}
    {item.label}
  </NavLink>
);

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { /* ignore */ }
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <aside className="w-60 shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700/50">
        <ShieldCheck size={22} className="text-brand-500" />
        <span className="font-bold text-slate-100 tracking-tight">SentinelAuth</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {userNav.map((item) => <NavItem key={item.to} item={item} />)}

        {user?.role === 'ADMIN' && (
          <div className="pt-4">
            <button
              onClick={() => setAdminOpen((o) => !o)}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
            >
              <span>Admin</span>
              <ChevronDown size={14} className={cn('transition-transform', adminOpen && 'rotate-180')} />
            </button>
            {adminOpen && (
              <div className="mt-0.5 space-y-0.5">
                {adminNav.map((item) => <NavItem key={item.to} item={item} />)}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-slate-700/50 pt-4">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          {user && <Badge variant={roleBadge(user.role)}>{user.role}</Badge>}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

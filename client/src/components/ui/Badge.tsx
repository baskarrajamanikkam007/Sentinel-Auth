import { cn } from '@/utils/cn';

type BadgeVariant = 'indigo' | 'green' | 'red' | 'yellow' | 'slate' | 'blue' | 'purple';

interface BadgeProps { children: React.ReactNode; variant?: BadgeVariant; className?: string }

const variants: Record<BadgeVariant, string> = {
  indigo: 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30',
  green: 'bg-green-500/15 text-green-300 ring-1 ring-green-500/30',
  red: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30',
  slate: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
  blue: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30',
};

export const Badge = ({ children, variant = 'slate', className }: BadgeProps) => (
  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
    {children}
  </span>
);

export const roleBadge = (role: string) => {
  const map: Record<string, BadgeVariant> = { ADMIN: 'indigo', MODERATOR: 'purple', USER: 'slate' };
  return map[role] ?? 'slate';
};

export const actionBadge = (action: string): BadgeVariant => {
  if (action.includes('LOGIN')) return 'green';
  if (action.includes('LOGOUT')) return 'slate';
  if (action.includes('LOCK') || action.includes('BREACH')) return 'red';
  if (action.includes('PASSWORD')) return 'yellow';
  if (action.includes('API_KEY')) return 'blue';
  return 'slate';
};

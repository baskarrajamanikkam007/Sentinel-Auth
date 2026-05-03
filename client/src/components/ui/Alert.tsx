import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps { type?: AlertType; children: ReactNode; className?: string }

const config: Record<AlertType, { icon: ReactNode; cls: string }> = {
  error: { icon: <XCircle size={16} />, cls: 'bg-red-500/10 border-red-500/30 text-red-300' },
  success: { icon: <CheckCircle2 size={16} />, cls: 'bg-green-500/10 border-green-500/30 text-green-300' },
  warning: { icon: <AlertCircle size={16} />, cls: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' },
  info: { icon: <Info size={16} />, cls: 'bg-blue-500/10 border-blue-500/30 text-blue-300' },
};

export const Alert = ({ type = 'info', children, className }: AlertProps) => {
  const { icon, cls } = config[type];
  return (
    <div className={cn('flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm', cls, className)}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
};

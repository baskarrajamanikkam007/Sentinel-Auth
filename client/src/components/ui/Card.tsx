import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  padding?: boolean;
}

export const Card = ({ children, className, header, footer, padding = true }: CardProps) => (
  <div className={cn('bg-slate-800 border border-slate-700 rounded-xl overflow-hidden', className)}>
    {header && (
      <div className="px-5 py-4 border-b border-slate-700">{header}</div>
    )}
    <div className={cn(padding && 'p-5')}>{children}</div>
    {footer && (
      <div className="px-5 py-4 border-t border-slate-700 bg-slate-800/50">{footer}</div>
    )}
  </div>
);

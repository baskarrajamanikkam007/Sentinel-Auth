import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

const variants = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white border-transparent',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600',
  danger: 'bg-red-600 hover:bg-red-500 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-slate-700 text-slate-300 border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export const Button = ({
  variant = 'primary', size = 'md', isLoading, icon, children, className, disabled, ...props
}: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || isLoading}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors cursor-pointer',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variants[variant], sizes[size], className,
    )}
  >
    {isLoading ? <Spinner size="sm" /> : icon}
    {children}
  </button>
);

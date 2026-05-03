import type { ReactNode } from 'react';

interface EmptyStateProps { icon: ReactNode; title: string; description?: string; action?: ReactNode }

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-slate-600 mb-4">{icon}</div>
    <h3 className="text-slate-300 font-medium mb-1">{title}</h3>
    {description && <p className="text-slate-500 text-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

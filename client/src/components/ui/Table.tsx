import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface TableProps { children: ReactNode; className?: string }

export const Table = ({ children, className }: TableProps) => (
  <div className={cn('overflow-x-auto rounded-xl border border-slate-700', className)}>
    <table className="w-full text-sm text-left">{children}</table>
  </div>
);

export const Thead = ({ children }: { children: ReactNode }) => (
  <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase tracking-wider">
    {children}
  </thead>
);

export const Tbody = ({ children }: { children: ReactNode }) => (
  <tbody className="divide-y divide-slate-700/50">{children}</tbody>
);

export const Th = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <th className={cn('px-4 py-3 font-medium', className)}>{children}</th>
);

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3 text-slate-300', className)}>{children}</td>
);

export const Tr = ({ children, className }: { children: ReactNode; className?: string }) => (
  <tr className={cn('bg-slate-900/40 hover:bg-slate-800/60 transition-colors', className)}>
    {children}
  </tr>
);

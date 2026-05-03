import { ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center gap-2.5 mb-2">
        <ShieldCheck size={32} className="text-brand-500" />
        <span className="text-2xl font-bold text-slate-100 tracking-tight">SentinelAuth</span>
      </div>
      <p className="text-sm text-slate-500">Secure authentication platform</p>
    </div>
    <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
      {children}
    </div>
    <p className="mt-6 text-xs text-slate-600">
      Protected by SentinelAuth · All rights reserved
    </p>
  </div>
);

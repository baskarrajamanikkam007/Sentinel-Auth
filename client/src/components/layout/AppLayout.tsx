import { Sidebar } from './Sidebar';
import type { ReactNode } from 'react';

interface AppLayoutProps { children: ReactNode; title?: string }

export const AppLayout = ({ children, title }: AppLayoutProps) => (
  <div className="flex min-h-screen bg-slate-950">
    <Sidebar />
    <main className="flex-1 flex flex-col min-w-0">
      {title && (
        <header className="px-8 py-5 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        </header>
      )}
      <div className="flex-1 px-8 py-6">{children}</div>
    </main>
  </div>
);

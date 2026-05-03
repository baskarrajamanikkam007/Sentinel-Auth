import { CheckCircle2, Info, XCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToast, type Toast, type ToastType } from '@/hooks/useToast';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

const styles: Record<ToastType, string> = {
  success: 'bg-green-900/90 border-green-700 text-green-100',
  error: 'bg-red-900/90 border-red-700 text-red-100',
  warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
  info: 'bg-slate-800/90 border-slate-600 text-slate-100',
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => (
  <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-sm min-w-72 max-w-sm', styles[toast.type])}>
    <span className="shrink-0">{icons[toast.type]}</span>
    <p className="text-sm flex-1">{toast.message}</p>
    <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
      <X size={14} />
    </button>
  </div>
);

export const Toaster = () => {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
    </div>
  );
};

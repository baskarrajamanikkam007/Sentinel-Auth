import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let externalAdd: ((message: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (msg: string) => externalAdd?.(msg, 'success'),
  error: (msg: string) => externalAdd?.(msg, 'error'),
  warning: (msg: string) => externalAdd?.(msg, 'warning'),
  info: (msg: string) => externalAdd?.(msg, 'info'),
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  externalAdd = add;

  return { toasts, add, remove };
};

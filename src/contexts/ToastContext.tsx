import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface AppToast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const STYLES: Record<ToastType, { card: string; icon: string; Icon: React.ElementType }> = {
  success: { card: 'border-[#C4B5FD] bg-[#EDE8F5]',  icon: 'text-[#7C3AED]', Icon: CheckCircle  },
  error:   { card: 'border-red-200 bg-red-50',         icon: 'text-red-500',   Icon: AlertCircle  },
  warning: { card: 'border-amber-200 bg-amber-50',     icon: 'text-amber-500', Icon: AlertTriangle },
  info:    { card: 'border-[#E5E0EB] bg-white',        icon: 'text-[#9CA3AF]', Icon: Info         },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 120000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      // mantém no máximo 3 toasts visíveis
      setToasts(prev => [...prev.slice(-2), { id, message, type }]);
      setTimeout(() => remove(id), duration);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-label="Alertas do sistema"
          className="pointer-events-none fixed right-4 top-5 z-[60] flex flex-col gap-2"
        >
          {toasts.map(t => {
            const { card, icon, Icon } = STYLES[t.type];
            return (
              <div
                key={t.id}
                role="alert"
                className={`pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border ${card} p-4 shadow-xl animate-in slide-in-from-top-4`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
                <p className="flex-1 text-[13px] font-light text-[#0f0f14]">{t.message}</p>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Fechar alerta"
                  className="shrink-0 text-[#9CA3AF] transition hover:text-[#6B7280]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

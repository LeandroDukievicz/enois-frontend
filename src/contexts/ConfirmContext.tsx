import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' usa vermelho; 'primary' usa roxo. Default: 'danger' */
  variant?: 'danger' | 'primary';
  onConfirm: () => Promise<void> | void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<ConfirmOptions | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    setPending(options);
  }, []);

  const handleConfirm = async () => {
    if (!pending || loading) return;
    setLoading(true);
    try {
      await pending.onConfirm();
    } finally {
      setLoading(false);
      setPending(null);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setPending(null);
  };

  const isDanger = !pending?.variant || pending.variant === 'danger';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {pending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[#E5E0EB] bg-white p-6 shadow-2xl">
            {/* Ícone + fechar */}
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isDanger ? 'bg-red-50' : 'bg-[#EDE8F5]'
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${isDanger ? 'text-red-500' : 'text-[#7C3AED]'}`}
                />
              </div>
              <button
                onClick={handleCancel}
                disabled={loading}
                aria-label="Fechar"
                className="rounded-full p-1 text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280] disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conteúdo */}
            <h2
              id="confirm-modal-title"
              className="mt-4 text-[15px] font-light text-[#0f0f14]"
            >
              {pending.title}
            </h2>
            <p className="mt-1 text-[13px] font-light text-[#6B7280]">{pending.message}</p>

            {/* Ações */}
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="rounded-full border border-[#E5E0EB] px-5 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] disabled:opacity-40"
              >
                {pending.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`flex min-w-[90px] items-center justify-center gap-2 rounded-full px-5 py-2 text-[13px] font-light text-white transition disabled:opacity-60 ${
                  isDanger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                {loading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  pending.confirmLabel ?? 'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

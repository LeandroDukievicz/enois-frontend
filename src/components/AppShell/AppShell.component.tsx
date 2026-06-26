import { type ReactNode, useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home, Users, Compass, MessageCircle, Bookmark,
  Briefcase, GraduationCap, Calendar, Search, Bell, LogOut,
  X, Heart, UserPlus, Building2, Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications, type AppNotification } from '../../contexts/NotificationsContext';

const nav = [
  { to: '/inicio', label: 'Início', icon: Home },
  { to: '/rede', label: 'Rede', icon: Users },
  { to: '/comunidades', label: 'Comunidades', icon: Compass },
  { to: '/mensagens', label: 'Mensagens', icon: MessageCircle },
  { to: '/salvos', label: 'Salvos', icon: Bookmark },
  { to: '/vagas', label: 'Vagas', icon: Briefcase },
  { to: '/mentoria', label: 'Mentoria', icon: GraduationCap },
  { to: '/eventos', label: 'Eventos', icon: Calendar },
];

const NOTIF_ICON: Record<AppNotification['type'], React.ElementType> = {
  post: Heart,
  connect: UserPlus,
  community: Building2,
  event: Calendar,
  system: Zap,
};

function Avatar({ src, name, size = 'md' }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-10 w-10 text-sm' : size === 'xl' ? 'h-16 w-16 text-xl' : 'h-9 w-9 text-xs';
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover shrink-0`} />;
  return (
    <div
      className={`${sizeClass} rounded-full bg-[#EDE8F5] dark:bg-[#2d1f4e] shrink-0`}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span className="text-[#7C3AED] font-medium leading-none select-none">{initials}</span>
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/* ── Push Toast ──────────────────────────────── */
function PushToast({ notif, onClose }: { notif: AppNotification; onClose: () => void }) {
  const Icon = NOTIF_ICON[notif.type];
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-4 z-50 flex w-80 items-start gap-3 rounded-2xl border border-[#E5E0EB] bg-white p-4 shadow-xl animate-in slide-in-from-bottom-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE8F5] dark:bg-[#2d1f4e]">
        <Icon className="h-4 w-4 text-[#7C3AED]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{notif.message}</p>
        <p className="text-[11px] text-[#9CA3AF]">agora</p>
      </div>
      <button onClick={onClose} className="shrink-0 text-[#9CA3AF] hover:text-[#6B7280]">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Notificações dropdown ───────────────────── */
function NotifDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, unread, markAllRead, markRead } = useNotifications();
  const [tab, setTab] = useState<'novas' | 'historico'>('novas');

  const displayed = tab === 'novas'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read);

  return (
    <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white shadow-xl dark:border-[#2a2a3d] dark:bg-[#13131f]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E0EB] px-4 py-3 dark:border-[#2a2a3d]">
        <span className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Notificações</span>
        <div className="flex items-center gap-2">
          {unread > 0 && tab === 'novas' && (
            <button onClick={markAllRead} className="text-[11px] text-[#7C3AED] hover:underline">
              Marcar tudo como lido
            </button>
          )}
          <button onClick={onClose} className="rounded-full p-1 text-[#9CA3AF] hover:text-[#6B7280]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E0EB] dark:border-[#2a2a3d]">
        <button
          onClick={() => setTab('novas')}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-light transition ${tab === 'novas' ? 'border-b-2 border-[#7C3AED] text-[#7C3AED]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}
        >
          Novas
          {unread > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[9px] text-white">
              {unread}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('historico')}
          className={`flex-1 py-2.5 text-[12px] font-light transition ${tab === 'historico' ? 'border-b-2 border-[#7C3AED] text-[#7C3AED]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}
        >
          Histórico
        </button>
      </div>

      {/* Lista */}
      <div className="max-h-80 overflow-y-auto">
        {displayed.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto h-6 w-6 text-[#9CA3AF]" />
            <p className="mt-2 text-[13px] font-light text-[#9CA3AF]">
              {tab === 'novas' ? 'Nenhuma notificação nova.' : 'Nenhum histórico ainda.'}
            </p>
          </div>
        ) : (
          displayed.map(n => {
            const Icon = NOTIF_ICON[n.type];
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[#F5F3FF] dark:hover:bg-[#1e1e2e] ${!n.read ? 'bg-[#faf8ff] dark:bg-[#1a1729]' : ''}`}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE8F5] dark:bg-[#2d1f4e]">
                  <Icon className="h-4 w-4 text-[#7C3AED]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{n.message}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#7C3AED]" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { notifications, unread } = useNotifications();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const prevLen = useRef(0);

  /* Push toast ao receber nova notificação */
  useEffect(() => {
    if (notifications.length > prevLen.current) {
      setToast(notifications[0]);
    }
    prevLen.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F9F8FF] dark:bg-[#0d0d18]">
      {/* Push toast */}
      {toast && <PushToast notif={toast} onClose={() => setToast(null)} />}

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[#E5E0EB] bg-white/90 backdrop-blur-md dark:border-[#2a2a3d] dark:bg-[#13131f]/90">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <NavLink to="/inicio" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)' }}>
              ✦
            </span>
            <span className="text-[17px] font-light tracking-tight text-[#0f0f14] dark:text-[#e8e6ff]">Conexão</span>
          </NavLink>

          <div className="relative mx-2 hidden max-w-md flex-1 items-center md:flex">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#9CA3AF]" />
            <input
              type="search"
              placeholder="Buscar pessoas, comunidades, vagas..."
              className="h-9 w-full rounded-full border border-[#E5E0EB] bg-[#F9F8FF] pl-9 pr-4 text-[14px] text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1c1c2e] dark:text-[#e8e6ff]"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setBellOpen(p => !p)}
                className="relative grid h-9 w-9 place-items-center rounded-full text-[#6B7280] transition hover:bg-[#EDE8F5] hover:text-[#7C3AED] dark:hover:bg-[#2d1f4e] dark:text-[#9CA3AF]"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#7C3AED] text-[8px] font-medium text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {bellOpen && <NotifDropdown onClose={() => setBellOpen(false)} />}
            </div>

            {user && (
              <Link
                to="/perfil"
                className="hidden items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-light text-[#6B7280] transition hover:bg-[#EDE8F5] hover:text-[#7C3AED] dark:text-[#9CA3AF] dark:hover:bg-[#2d1f4e] md:flex"
              >
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <span>Perfil</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-5 pb-24 sm:px-6 lg:pb-6">
        {/* Sidebar */}
        <aside className="sticky top-20 hidden h-fit w-56 shrink-0 lg:block">
          <nav className="flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border-l-2 py-3 pl-3 pr-3 text-[14px] font-light transition ${
                    isActive
                      ? 'border-[#7C3AED] bg-[#EDE8F5] text-[#7C3AED] dark:bg-[#2d1f4e] dark:text-[#A78BFA]'
                      : 'border-transparent text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#0f0f14] dark:text-[#9CA3AF] dark:hover:bg-[#1e1e2e] dark:hover:text-[#e8e6ff]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#7C3AED] dark:text-[#A78BFA]' : ''}`} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}

            <div className="my-1 h-px bg-[#E5E0EB] dark:bg-[#2a2a3d]" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl border-l-2 border-transparent py-3 pl-3 pr-3 text-[14px] font-light text-[#6B7280] transition hover:bg-red-50 hover:text-red-500 dark:text-[#9CA3AF] dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E0EB] bg-white/95 backdrop-blur dark:border-[#2a2a3d] dark:bg-[#13131f]/95 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center overflow-x-auto px-1 scrollbar-none">
          {nav.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-[60px] shrink-0 flex-col items-center gap-0.5 px-2 py-2.5 text-[10px] font-light transition ${
                  isActive ? 'text-[#7C3AED]' : 'text-[#9CA3AF]'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export { Avatar };

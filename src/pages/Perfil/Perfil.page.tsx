import { useState, useRef } from 'react';
import { Settings, Clock, Camera, Plus, Save, X, Sun, Moon, Bell, Mail } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/* ── Toggle ─────────────────────────────────────── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-10 rounded-full transition-colors ${checked ? 'bg-[#7C3AED]' : 'bg-[#D1D5DB]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
      {label && <span className="text-[13px] font-light text-[#0f0f14]">{label}</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-3 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED]';
const labelCls = 'mb-1.5 block text-[13px] font-light text-[#0f0f14]';
type EditTab = 'Informações' | 'Experiências' | 'Educação' | 'Certificações' | 'Preferências';
const EDIT_TABS: EditTab[] = ['Informações', 'Experiências', 'Educação', 'Certificações', 'Preferências'];

/* ── PrefRow ─────────────────────────────────────── */
function PrefRow({ icon: Icon, label, description, checked, onChange }: {
  icon: React.ElementType; label: string; description: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E0EB] p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5]">
          <Icon className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <div>
          <p className="text-[14px] font-light text-[#0f0f14]">{label}</p>
          <p className="text-[12px] text-[#9CA3AF]">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ── EditModal ───────────────────────────────────── */
function EditModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [tab, setTab] = useState<EditTab>('Informações');

  /* Campos do AuthUser — lidos do contexto */
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [headline, setHeadline] = useState(user?.headline ?? '');

  /* Campos extras — persistidos em localStorage */
  const [bio, setBio] = useState(() => localStorage.getItem('profile_bio') ?? '');
  const [empresa, setEmpresa] = useState(() => localStorage.getItem('profile_empresa') ?? '');
  const [localizacao, setLocalizacao] = useState(() => localStorage.getItem('profile_localizacao') ?? '');
  const [disponibilidade, setDisponibilidade] = useState(() => localStorage.getItem('profile_disponibilidade') ?? '');
  const [portfolio, setPortfolio] = useState(() => localStorage.getItem('profile_portfolio') ?? '');
  const [links, setLinks] = useState(() => localStorage.getItem('profile_links') ?? '');
  const [habilidades, setHabilidades] = useState(() => localStorage.getItem('profile_habilidades') ?? '');
  const [objetivos, setObjetivos] = useState(() => localStorage.getItem('profile_objetivos') ?? '');
  const [aberto, setAberto] = useState(() => localStorage.getItem('profile_aberto') === 'true');
  const [mentor, setMentor] = useState(() => localStorage.getItem('profile_mentor') === 'true');

  /* Preferências de notificação */
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem('pref_email') === 'true');
  const [pushNotif, setPushNotif] = useState(() => localStorage.getItem('pref_push') !== 'false');
  const [connectionNotif, setConnectionNotif] = useState(() => localStorage.getItem('pref_connection') !== 'false');

  const handleSave = () => {
    /* Persiste dados do perfil no AuthContext (grava em current_user no localStorage) */
    updateUser({ name: name.trim() || user?.name, username: username.trim() || user?.username, headline: headline.trim() || user?.headline });

    /* Persiste campos extras */
    localStorage.setItem('profile_bio', bio);
    localStorage.setItem('profile_empresa', empresa);
    localStorage.setItem('profile_localizacao', localizacao);
    localStorage.setItem('profile_disponibilidade', disponibilidade);
    localStorage.setItem('profile_portfolio', portfolio);
    localStorage.setItem('profile_links', links);
    localStorage.setItem('profile_habilidades', habilidades);
    localStorage.setItem('profile_objetivos', objetivos);
    localStorage.setItem('profile_aberto', String(aberto));
    localStorage.setItem('profile_mentor', String(mentor));

    /* Persiste preferências */
    localStorage.setItem('pref_email', String(emailNotif));
    localStorage.setItem('pref_push', String(pushNotif));
    localStorage.setItem('pref_connection', String(connectionNotif));

    onClose();
  };

  const emptySection = (entity: string) => (
    <div className="flex flex-col items-center py-12">
      <p className="text-[14px] font-light text-[#9CA3AF]">Nenhuma {entity} adicionada</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white shadow-2xl" style={{ maxHeight: '90vh' }}>
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E0EB] px-6 py-4">
          <h2 className="text-[18px] font-light text-[#0f0f14]">Editar perfil</h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-full border border-[#E5E0EB] px-4 py-1.5 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-full bg-[#7C3AED] px-4 py-1.5 text-[13px] font-light text-white transition hover:bg-[#6D28D9]">
              <Save className="h-3.5 w-3.5" /> Salvar
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-[#E5E0EB] px-6">
          <div className="flex gap-0.5 overflow-x-auto py-2 scrollbar-none">
            {EDIT_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-light transition ${
                  tab === t
                    ? 'bg-[#EDE8F5] text-[#7C3AED]'
                    : 'text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#0f0f14] dark:text-[#9CA3AF] dark:hover:bg-[#1e1e2e] dark:hover:text-[#e8e6ff]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'Informações' && (
            <div className="space-y-4">
              <div><label className={labelCls}>Nome</label><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Username (URL do perfil)</label><input value={username} onChange={e => setUsername(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Headline</label><input value={headline} onChange={e => setHeadline(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Empresa</label><input value={empresa} onChange={e => setEmpresa(e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Localização</label><input value={localizacao} onChange={e => setLocalizacao(e.target.value)} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Disponibilidade</label><input value={disponibilidade} onChange={e => setDisponibilidade(e.target.value)} placeholder="Ex: Disponível para freelas" className={inputCls} /></div>
              <div><label className={labelCls}>Portfólio</label><input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." className={inputCls} /></div>
              <div><label className={labelCls}>Links externos (um por linha)</label><textarea value={links} onChange={e => setLinks(e.target.value)} rows={3} className={`${inputCls} resize-none`} /></div>
              <div><label className={labelCls}>Habilidades (separadas por vírgula)</label><input value={habilidades} onChange={e => setHabilidades(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Objetivos (separados por vírgula)</label><input value={objetivos} onChange={e => setObjetivos(e.target.value)} className={inputCls} /></div>
              <div className="flex flex-wrap gap-6 pt-2">
                <Toggle checked={aberto} onChange={() => setAberto(p => !p)} label="Aberto a oportunidades" />
                <Toggle checked={mentor} onChange={() => setMentor(p => !p)} label="Mentor disponível" />
              </div>
            </div>
          )}
          {tab === 'Experiências' && emptySection('experiência')}
          {tab === 'Educação' && emptySection('educação')}
          {tab === 'Certificações' && emptySection('certificação')}

          {tab === 'Preferências' && (
            <div className="space-y-6">
              {/* Aparência */}
              <div>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Aparência</p>
                <div className="flex items-center justify-between rounded-xl border border-[#E5E0EB] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5]">
                      {isDark ? <Moon className="h-4 w-4 text-[#7C3AED]" /> : <Sun className="h-4 w-4 text-[#7C3AED]" />}
                    </div>
                    <div>
                      <p className="text-[14px] font-light text-[#0f0f14]">Modo escuro</p>
                      <p className="text-[12px] text-[#9CA3AF]">Alterna entre tema claro e escuro em toda a aplicação</p>
                    </div>
                  </div>
                  <Toggle checked={isDark} onChange={toggleTheme} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { key: 'light', label: 'Claro', bg: 'bg-[#F9F8FF]', border: 'border-[#E5E0EB]' },
                    { key: 'dark', label: 'Escuro', bg: 'bg-[#0d0d18]', border: 'border-[#2a2a3d]' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { if ((opt.key === 'dark') !== isDark) toggleTheme(); }}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${
                        (opt.key === 'dark') === isDark ? 'border-[#7C3AED]' : 'border-[#E5E0EB] hover:border-[#C4B5FD]'
                      }`}
                    >
                      <div className={`h-10 w-full rounded-lg border ${opt.bg} ${opt.border}`} />
                      <span className="text-[12px] font-light text-[#6B7280]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notificações */}
              <div>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Notificações</p>
                <div className="space-y-3">
                  <PrefRow
                    icon={Mail}
                    label="Notificações por e-mail"
                    description="Receba um resumo das principais atividades por e-mail"
                    checked={emailNotif}
                    onChange={() => setEmailNotif(p => !p)}
                  />
                  <PrefRow
                    icon={Bell}
                    label="Notificações push"
                    description="Alertas em tempo real sobre interações na rede"
                    checked={pushNotif}
                    onChange={() => setPushNotif(p => !p)}
                  />
                  <PrefRow
                    icon={Bell}
                    label="Solicitações de conexão"
                    description="Quando alguém pede para se conectar com você"
                    checked={connectionNotif}
                    onChange={() => setConnectionNotif(p => !p)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {tab !== 'Informações' && tab !== 'Preferências' && (
          <div className="shrink-0 border-t border-[#E5E0EB] px-6 py-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E0EB] py-3 text-[14px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
              <Plus className="h-4 w-4" /> Adicionar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── PerfilPage ──────────────────────────────────── */
export function PerfilPage() {
  const { user, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    () => localStorage.getItem('cover_image')
  );
  /* Relê campos extras do localStorage sempre que o modal fecha */
  const [disponibilidade, setDisponibilidade] = useState(() => localStorage.getItem('profile_disponibilidade') ?? '');
  const [bio, setBio] = useState(() => localStorage.getItem('profile_bio') ?? '');
  const [habilidades, setHabilidades] = useState(() => localStorage.getItem('profile_habilidades') ?? '');

  const handleEditClose = () => {
    setEditOpen(false);
    setDisponibilidade(localStorage.getItem('profile_disponibilidade') ?? '');
    setBio(localStorage.getItem('profile_bio') ?? '');
    setHabilidades(localStorage.getItem('profile_habilidades') ?? '');
  };

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target!.result as string);
      reader.readAsDataURL(file);
    });

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    setCoverUrl(dataUrl);
    localStorage.setItem('cover_image', dataUrl);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    updateUser({ avatar: dataUrl });
  };

  return (
    <AppShell>
      {editOpen && <EditModal onClose={handleEditClose} />}

      <div className="space-y-4">
        {/* Card principal */}
        <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white">
          {/* Capa — clicável para upload */}
          <div
            className="group relative h-44 w-full cursor-pointer"
            onClick={() => coverInputRef.current?.click()}
            style={
              coverUrl
                ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : { background: 'linear-gradient(135deg, #3B1E7A 0%, #7C3AED 60%, #A78BFA 100%)' }
            }
          >
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 text-transparent transition-all group-hover:bg-black/30 group-hover:text-white">
              <Camera className="h-5 w-5" />
              <span className="text-[13px] font-light">Alterar capa</span>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>

          {/* Área branca com avatar, botão e info */}
          <div className="relative px-6 pb-6">
            {/* Avatar — clicável para upload */}
            <div
              className="group relative -mt-12 mb-3 w-fit cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE8F5] text-2xl font-medium text-[#7C3AED]">
                  {(user?.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-all group-hover:bg-black/40 group-hover:text-white">
                <Camera className="h-5 w-5" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Botão Editar perfil — canto superior direito da área branca */}
            <button
              onClick={() => setEditOpen(true)}
              className="absolute right-6 top-5 flex items-center gap-2 rounded-full border border-[#E5E0EB] bg-white px-4 py-2 text-[13px] font-light text-[#0f0f14] transition hover:border-[#7C3AED] hover:text-[#7C3AED]"
            >
              <Settings className="h-3.5 w-3.5" />
              Editar perfil
            </button>

            {/* Info */}
            <h1 className="text-[22px] font-light text-[#0f0f14]">{user?.name ?? user?.username}</h1>
            <p className="text-[14px] font-light text-[#7C3AED]">
              {user?.headline ? user.headline : 'Profissional · Conexão'}
            </p>
            {bio && <p className="mt-2 text-[13px] font-light text-[#6B7280]">{bio}</p>}
            {habilidades && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {habilidades.split(',').map(h => h.trim()).filter(Boolean).map(h => (
                  <span key={h} className="rounded-full bg-[#EDE8F5] px-2.5 py-0.5 text-[11px] text-[#7C3AED]">{h}</span>
                ))}
              </div>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-[#6B7280]">· 0 conexões</span>
            </div>
          </div>
        </div>

        {/* Grid de conteúdo */}
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          {/* Publicações recentes */}
          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5">
            <h2 className="text-[16px] font-light text-[#0f0f14]">Publicações recentes</h2>
            <div className="mt-4 rounded-xl border border-[#E5E0EB] px-5 py-12 text-center">
              <p className="text-[13px] font-light text-[#9CA3AF]">Nenhuma publicação ainda.</p>
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[15px] font-light text-[#0f0f14]">Disponibilidade</h2>
            </div>
            <p className="mt-2 text-[13px] font-light text-[#9CA3AF]">
              {disponibilidade || 'Não informada'}
            </p>
            <button onClick={() => setEditOpen(true)} className="mt-3 text-[12px] font-light text-[#7C3AED] transition hover:underline">
              Atualizar →
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

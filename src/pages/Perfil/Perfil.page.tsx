import { useState, useRef } from 'react';
import {
  Settings, Clock, Camera, Plus, Save, X, Sun, Moon, Bell, Mail,
  Bookmark, Calendar, MessageCircle, Users, Heart, Briefcase, GraduationCap,
  Award, Trash2,
} from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/* ── Types ───────────────────────────────────────── */
export interface Experiencia {
  id: string; cargo: string; empresa: string; periodo: string; descricao?: string;
}
export interface Educacao {
  id: string; curso: string; instituicao: string; periodo: string;
}
export interface Certificacao {
  id: string; nome: string; emissor: string; ano: string; url?: string;
}

function loadList<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}
function persistList<T>(key: string, list: T[]) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
}

/* ── Atividade recente ───────────────────────────── */
type ActivityType = 'save' | 'event' | 'connect' | 'comment' | 'post';
interface ActivityItem { id: string; type: ActivityType; description: string; detail?: string; createdAt: string; }

const ACTIVITY_ICON: Record<ActivityType, React.ElementType> = {
  save: Bookmark, event: Calendar, connect: Users, comment: MessageCircle, post: Heart,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'event', description: 'Confirmou presença em Meetup React Brasil — Julho 2026', createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
  { id: 'a2', type: 'connect', description: 'Conectou-se com Diego de Souza F.', createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
  { id: 'a3', type: 'comment', description: 'Comentou em uma publicação de Iraê C. Brandão', detail: 'Concordo! Os Server Actions mudaram muito a forma de trabalhar com formulários.', createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 'a4', type: 'post', description: 'Compartilhou uma publicação no feed', detail: 'Dica rápida: use o hook `use()` do React 19 para unwrap Promises diretamente no render.', createdAt: new Date(Date.now() - 18 * 3600000).toISOString() },
];

function readActivityItems(): ActivityItem[] {
  const real: ActivityItem[] = [];
  try {
    const feed: ActivityItem[] = JSON.parse(localStorage.getItem('user_activity_feed') ?? '[]');
    real.push(...feed);
  } catch {}
  try {
    const saved: Array<{ id: string; authorName: string; content: string; createdAt: string }> =
      JSON.parse(localStorage.getItem('saved_posts_data') ?? '[]');
    saved.forEach(p => {
      const id = `save-${p.id}`;
      if (!real.some(r => r.id === id)) {
        real.push({
          id, type: 'save',
          description: `Salvou uma publicação de ${p.authorName}`,
          detail: (p.content ?? '').replace(/<[^>]*>/g, '').slice(0, 100),
          createdAt: p.createdAt ?? new Date().toISOString(),
        });
      }
    });
  } catch {}
  const seen = new Set(real.map(r => r.id));
  const all = [...real, ...MOCK_ACTIVITY.filter(m => !seen.has(m.id))];
  return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

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
      {label && <span className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{label}</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-3 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1a1a2e] dark:text-[#e8e6ff]';
const labelCls = 'mb-1.5 block text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]';
const smInputCls = 'w-full rounded-lg border border-[#E5E0EB] bg-[#F9F8FF] px-3 py-2 text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1a1a2e] dark:text-[#e8e6ff]';

type EditTab = 'Informações' | 'Experiências' | 'Educação' | 'Certificações' | 'Preferências';
const EDIT_TABS: EditTab[] = ['Informações', 'Experiências', 'Educação', 'Certificações', 'Preferências'];

/* ── PrefRow ─────────────────────────────────────── */
function PrefRow({ icon: Icon, label, description, checked, onChange }: {
  icon: React.ElementType; label: string; description: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E0EB] p-4 dark:border-[#2a2a3d]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] dark:bg-[#2a1a4e]">
          <Icon className="h-4 w-4 text-[#7C3AED]" />
        </div>
        <div>
          <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{label}</p>
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

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [headline, setHeadline] = useState(user?.headline ?? '');
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
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem('pref_email') === 'true');
  const [pushNotif, setPushNotif] = useState(() => localStorage.getItem('pref_push') !== 'false');
  const [connectionNotif, setConnectionNotif] = useState(() => localStorage.getItem('pref_connection') !== 'false');

  /* Experiências */
  const [experiencias, setExperiencias] = useState<Experiencia[]>(() => loadList('profile_experiencias'));
  const [addingExp, setAddingExp] = useState(false);
  const [newExp, setNewExp] = useState({ cargo: '', empresa: '', periodo: '', descricao: '' });

  /* Educação */
  const [educacoes, setEducacoes] = useState<Educacao[]>(() => loadList('profile_educacoes'));
  const [addingEdu, setAddingEdu] = useState(false);
  const [newEdu, setNewEdu] = useState({ curso: '', instituicao: '', periodo: '' });

  /* Certificações */
  const [certificacoes, setCertificacoes] = useState<Certificacao[]>(() => loadList('profile_certificacoes'));
  const [addingCert, setAddingCert] = useState(false);
  const [newCert, setNewCert] = useState({ nome: '', emissor: '', ano: '', url: '' });

  const handleSave = () => {
    updateUser({ name: name.trim() || user?.name, username: username.trim() || user?.username, headline: headline.trim() || user?.headline });
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
    localStorage.setItem('pref_email', String(emailNotif));
    localStorage.setItem('pref_push', String(pushNotif));
    localStorage.setItem('pref_connection', String(connectionNotif));
    persistList('profile_experiencias', experiencias);
    persistList('profile_educacoes', educacoes);
    persistList('profile_certificacoes', certificacoes);
    onClose();
  };

  const addExp = () => {
    if (!newExp.cargo.trim() || !newExp.empresa.trim()) return;
    setExperiencias(prev => [...prev, { ...newExp, id: String(Date.now()) }]);
    setNewExp({ cargo: '', empresa: '', periodo: '', descricao: '' });
    setAddingExp(false);
  };

  const addEdu = () => {
    if (!newEdu.curso.trim() || !newEdu.instituicao.trim()) return;
    setEducacoes(prev => [...prev, { ...newEdu, id: String(Date.now()) }]);
    setNewEdu({ curso: '', instituicao: '', periodo: '' });
    setAddingEdu(false);
  };

  const addCert = () => {
    if (!newCert.nome.trim() || !newCert.emissor.trim()) return;
    setCertificacoes(prev => [...prev, { ...newCert, id: String(Date.now()) }]);
    setNewCert({ nome: '', emissor: '', ano: '', url: '' });
    setAddingCert(false);
  };

  const handleAdd = () => {
    if (tab === 'Experiências') setAddingExp(true);
    if (tab === 'Educação') setAddingEdu(true);
    if (tab === 'Certificações') setAddingCert(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white shadow-2xl dark:border-[#2a2a3d] dark:bg-[#1c1c2e]" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#E5E0EB] px-6 py-4 dark:border-[#2a2a3d]">
          <h2 className="text-[18px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Editar perfil</h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-full border border-[#E5E0EB] px-4 py-1.5 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
              Cancelar
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-full bg-[#7C3AED] px-4 py-1.5 text-[13px] font-light text-white transition hover:bg-[#6D28D9]">
              <Save className="h-3.5 w-3.5" /> Salvar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 border-b border-[#E5E0EB] px-6 dark:border-[#2a2a3d]">
          <div className="flex gap-0.5 overflow-x-auto py-2 scrollbar-none">
            {EDIT_TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-light transition ${
                  tab === t
                    ? 'bg-[#EDE8F5] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]'
                    : 'text-[#6B7280] hover:bg-[#F5F3FF] hover:text-[#0f0f14] dark:text-[#9CA3AF] dark:hover:bg-[#1e1e2e] dark:hover:text-[#e8e6ff]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Informações ── */}
          {tab === 'Informações' && (
            <div className="space-y-4">
              <div><label className={labelCls}>Nome</label><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Username</label><input value={username} onChange={e => setUsername(e.target.value)} className={inputCls} /></div>
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

          {/* ── Experiências ── */}
          {tab === 'Experiências' && (
            <div className="space-y-3">
              {experiencias.length === 0 && !addingExp && (
                <p className="py-8 text-center text-[14px] font-light text-[#9CA3AF]">Nenhuma experiência adicionada</p>
              )}
              {experiencias.map(exp => (
                <div key={exp.id} className="rounded-xl border border-[#E5E0EB] p-4 dark:border-[#2a2a3d]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{exp.cargo}</p>
                      <p className="text-[13px] text-[#7C3AED] dark:text-[#a78bfa]">{exp.empresa}</p>
                      {exp.periodo && <p className="text-[12px] text-[#9CA3AF]">{exp.periodo}</p>}
                      {exp.descricao && <p className="mt-1 text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">{exp.descricao}</p>}
                    </div>
                    <button
                      onClick={() => setExperiencias(prev => prev.filter(e => e.id !== exp.id))}
                      className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {addingExp && (
                <div className="rounded-xl border border-[#7C3AED]/40 bg-[#F9F8FF] p-4 dark:bg-[#13131f] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Cargo *</label>
                      <input value={newExp.cargo} onChange={e => setNewExp(p => ({ ...p, cargo: e.target.value }))} placeholder="Ex: Desenvolvedor Frontend" className={smInputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Empresa *</label>
                      <input value={newExp.empresa} onChange={e => setNewExp(p => ({ ...p, empresa: e.target.value }))} placeholder="Ex: Nubank" className={smInputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Período</label>
                    <input value={newExp.periodo} onChange={e => setNewExp(p => ({ ...p, periodo: e.target.value }))} placeholder="Ex: Jan 2023 – Presente" className={smInputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Descrição</label>
                    <textarea value={newExp.descricao} onChange={e => setNewExp(p => ({ ...p, descricao: e.target.value }))} rows={2} placeholder="Responsabilidades e conquistas..." className={`${smInputCls} resize-none`} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingExp(false)} className="rounded-full border border-[#E5E0EB] px-4 py-1.5 text-[12px] text-[#6B7280] transition hover:border-[#7C3AED] dark:border-[#2a2a3d]">Cancelar</button>
                    <button onClick={addExp} disabled={!newExp.cargo.trim() || !newExp.empresa.trim()} className="rounded-full bg-[#7C3AED] px-4 py-1.5 text-[12px] text-white transition hover:bg-[#6D28D9] disabled:opacity-40">Adicionar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Educação ── */}
          {tab === 'Educação' && (
            <div className="space-y-3">
              {educacoes.length === 0 && !addingEdu && (
                <p className="py-8 text-center text-[14px] font-light text-[#9CA3AF]">Nenhuma educação adicionada</p>
              )}
              {educacoes.map(edu => (
                <div key={edu.id} className="rounded-xl border border-[#E5E0EB] p-4 dark:border-[#2a2a3d]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{edu.curso}</p>
                      <p className="text-[13px] text-[#7C3AED] dark:text-[#a78bfa]">{edu.instituicao}</p>
                      {edu.periodo && <p className="text-[12px] text-[#9CA3AF]">{edu.periodo}</p>}
                    </div>
                    <button
                      onClick={() => setEducacoes(prev => prev.filter(e => e.id !== edu.id))}
                      className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {addingEdu && (
                <div className="rounded-xl border border-[#7C3AED]/40 bg-[#F9F8FF] p-4 dark:bg-[#13131f] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Curso / Formação *</label>
                      <input value={newEdu.curso} onChange={e => setNewEdu(p => ({ ...p, curso: e.target.value }))} placeholder="Ex: Ciência da Computação" className={smInputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Instituição *</label>
                      <input value={newEdu.instituicao} onChange={e => setNewEdu(p => ({ ...p, instituicao: e.target.value }))} placeholder="Ex: USP" className={smInputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Período</label>
                    <input value={newEdu.periodo} onChange={e => setNewEdu(p => ({ ...p, periodo: e.target.value }))} placeholder="Ex: 2019 – 2023" className={smInputCls} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingEdu(false)} className="rounded-full border border-[#E5E0EB] px-4 py-1.5 text-[12px] text-[#6B7280] transition hover:border-[#7C3AED] dark:border-[#2a2a3d]">Cancelar</button>
                    <button onClick={addEdu} disabled={!newEdu.curso.trim() || !newEdu.instituicao.trim()} className="rounded-full bg-[#7C3AED] px-4 py-1.5 text-[12px] text-white transition hover:bg-[#6D28D9] disabled:opacity-40">Adicionar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Certificações ── */}
          {tab === 'Certificações' && (
            <div className="space-y-3">
              {certificacoes.length === 0 && !addingCert && (
                <p className="py-8 text-center text-[14px] font-light text-[#9CA3AF]">Nenhuma certificação adicionada</p>
              )}
              {certificacoes.map(cert => (
                <div key={cert.id} className="rounded-xl border border-[#E5E0EB] p-4 dark:border-[#2a2a3d]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{cert.nome}</p>
                      <p className="text-[13px] text-[#7C3AED] dark:text-[#a78bfa]">{cert.emissor}</p>
                      {cert.ano && <p className="text-[12px] text-[#9CA3AF]">{cert.ano}</p>}
                      {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#7C3AED] hover:underline">Ver credencial →</a>}
                    </div>
                    <button
                      onClick={() => setCertificacoes(prev => prev.filter(c => c.id !== cert.id))}
                      className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {addingCert && (
                <div className="rounded-xl border border-[#7C3AED]/40 bg-[#F9F8FF] p-4 dark:bg-[#13131f] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Nome da certificação *</label>
                      <input value={newCert.nome} onChange={e => setNewCert(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: AWS Solutions Architect" className={smInputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Emissor *</label>
                      <input value={newCert.emissor} onChange={e => setNewCert(p => ({ ...p, emissor: e.target.value }))} placeholder="Ex: Amazon Web Services" className={smInputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Ano</label>
                      <input value={newCert.ano} onChange={e => setNewCert(p => ({ ...p, ano: e.target.value }))} placeholder="Ex: 2024" className={smInputCls} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">URL da credencial</label>
                      <input value={newCert.url} onChange={e => setNewCert(p => ({ ...p, url: e.target.value }))} placeholder="https://..." className={smInputCls} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAddingCert(false)} className="rounded-full border border-[#E5E0EB] px-4 py-1.5 text-[12px] text-[#6B7280] transition hover:border-[#7C3AED] dark:border-[#2a2a3d]">Cancelar</button>
                    <button onClick={addCert} disabled={!newCert.nome.trim() || !newCert.emissor.trim()} className="rounded-full bg-[#7C3AED] px-4 py-1.5 text-[12px] text-white transition hover:bg-[#6D28D9] disabled:opacity-40">Adicionar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Preferências ── */}
          {tab === 'Preferências' && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Aparência</p>
                <div className="flex items-center justify-between rounded-xl border border-[#E5E0EB] p-4 dark:border-[#2a2a3d]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] dark:bg-[#2a1a4e]">
                      {isDark ? <Moon className="h-4 w-4 text-[#7C3AED]" /> : <Sun className="h-4 w-4 text-[#7C3AED]" />}
                    </div>
                    <div>
                      <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Modo escuro</p>
                      <p className="text-[12px] text-[#9CA3AF]">Alterna entre tema claro e escuro</p>
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
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition ${(opt.key === 'dark') === isDark ? 'border-[#7C3AED]' : 'border-[#E5E0EB] hover:border-[#C4B5FD] dark:border-[#2a2a3d]'}`}
                    >
                      <div className={`h-10 w-full rounded-lg border ${opt.bg} ${opt.border}`} />
                      <span className="text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Notificações</p>
                <div className="space-y-3">
                  <PrefRow icon={Mail} label="Notificações por e-mail" description="Receba um resumo das principais atividades por e-mail" checked={emailNotif} onChange={() => setEmailNotif(p => !p)} />
                  <PrefRow icon={Bell} label="Notificações push" description="Alertas em tempo real sobre interações na rede" checked={pushNotif} onChange={() => setPushNotif(p => !p)} />
                  <PrefRow icon={Bell} label="Solicitações de conexão" description="Quando alguém pede para se conectar com você" checked={connectionNotif} onChange={() => setConnectionNotif(p => !p)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer add button for list tabs */}
        {(tab === 'Experiências' || tab === 'Educação' || tab === 'Certificações') && (
          <div className="shrink-0 border-t border-[#E5E0EB] px-6 py-4 dark:border-[#2a2a3d]">
            <button
              onClick={handleAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E0EB] py-3 text-[14px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]"
            >
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
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(readActivityItems);
  const [coverUrl, setCoverUrl] = useState<string | null>(() => localStorage.getItem('cover_image'));

  const [disponibilidade, setDisponibilidade] = useState(() => localStorage.getItem('profile_disponibilidade') ?? '');
  const [bio, setBio] = useState(() => localStorage.getItem('profile_bio') ?? '');
  const [habilidades, setHabilidades] = useState(() => localStorage.getItem('profile_habilidades') ?? '');
  const [experiencias, setExperiencias] = useState<Experiencia[]>(() => loadList('profile_experiencias'));
  const [educacoes, setEducacoes] = useState<Educacao[]>(() => loadList('profile_educacoes'));
  const [certificacoes, setCertificacoes] = useState<Certificacao[]>(() => loadList('profile_certificacoes'));

  const handleEditClose = () => {
    setEditOpen(false);
    setDisponibilidade(localStorage.getItem('profile_disponibilidade') ?? '');
    setBio(localStorage.getItem('profile_bio') ?? '');
    setHabilidades(localStorage.getItem('profile_habilidades') ?? '');
    setExperiencias(loadList('profile_experiencias'));
    setEducacoes(loadList('profile_educacoes'));
    setCertificacoes(loadList('profile_certificacoes'));
    setActivityItems(readActivityItems());
  };

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve(ev.target!.result as string);
      reader.readAsDataURL(file);
    });

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readAsDataUrl(file);
    setCoverUrl(url);
    localStorage.setItem('cover_image', url);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    updateUser({ avatar: await readAsDataUrl(file) });
  };

  return (
    <AppShell>
      {editOpen && <EditModal onClose={handleEditClose} />}

      <div className="space-y-4">
        {/* Card principal */}
        <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white dark:border-[#2a2a3d] dark:bg-[#13131f]">
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

          <div className="relative px-6 pb-6 dark:bg-[#13131f]">
            <div className="group relative -mt-12 mb-3 w-fit cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDE8F5] text-2xl font-medium text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">
                  {(user?.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-all group-hover:bg-black/40 group-hover:text-white">
                <Camera className="h-5 w-5" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <button
              onClick={() => setEditOpen(true)}
              className="absolute right-6 top-5 flex items-center gap-2 rounded-full border border-[#E5E0EB] bg-white px-4 py-2 text-[13px] font-light text-[#0f0f14] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1c1c2e] dark:text-[#e8e6ff]"
            >
              <Settings className="h-3.5 w-3.5" />
              Editar perfil
            </button>

            <h1 className="text-[22px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{user?.name ?? user?.username}</h1>
            <p className="text-[14px] font-light text-[#7C3AED] dark:text-[#a78bfa]">
              {user?.headline ?? 'Profissional · Conexão'}
            </p>
            {bio && <p className="mt-2 text-[13px] font-light text-[#6B7280] dark:text-[#9CA3AF]">{bio}</p>}
            {habilidades && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {habilidades.split(',').map(h => h.trim()).filter(Boolean).map(h => (
                  <span key={h} className="rounded-full bg-[#EDE8F5] px-2.5 py-0.5 text-[11px] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">{h}</span>
                ))}
              </div>
            )}
            <div className="mt-2">
              <span className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">0 conexões</span>
            </div>
          </div>
        </div>

        {/* Grid: atividade + disponibilidade */}
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <h2 className="text-[16px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Atividade recente</h2>
            <div className="mt-4 space-y-4">
              {activityItems.map(item => {
                const Icon = ACTIVITY_ICON[item.type];
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE8F5] dark:bg-[#2a1a4e]">
                      <Icon className="h-4 w-4 text-[#7C3AED]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{item.description}</p>
                      {item.detail && <p className="mt-0.5 line-clamp-2 text-[12px] font-light text-[#9CA3AF]">{item.detail}</p>}
                      <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Disponibilidade</h2>
            </div>
            <p className="mt-2 text-[13px] font-light text-[#9CA3AF]">{disponibilidade || 'Não informada'}</p>
            <button onClick={() => setEditOpen(true)} className="mt-3 text-[12px] font-light text-[#7C3AED] transition hover:underline dark:text-[#a78bfa]">
              Atualizar →
            </button>
          </div>
        </div>

        {/* Experiências */}
        <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[16px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Experiências</h2>
            </div>
            <button onClick={() => setEditOpen(true)} className="text-[12px] font-light text-[#7C3AED] hover:underline dark:text-[#a78bfa]">
              + Adicionar
            </button>
          </div>
          {experiencias.length === 0 ? (
            <p className="mt-3 text-[13px] font-light text-[#9CA3AF]">Nenhuma experiência adicionada ainda.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {experiencias.map((exp, i) => (
                <div key={exp.id} className={`flex gap-3 ${i > 0 ? 'border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]' : ''}`}>
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] dark:bg-[#2a1a4e]">
                    <Briefcase className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{exp.cargo}</p>
                    <p className="text-[13px] text-[#7C3AED] dark:text-[#a78bfa]">{exp.empresa}</p>
                    {exp.periodo && <p className="text-[12px] text-[#9CA3AF]">{exp.periodo}</p>}
                    {exp.descricao && <p className="mt-1 text-[13px] font-light text-[#6B7280] dark:text-[#9CA3AF]">{exp.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educação */}
        <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[16px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Educação</h2>
            </div>
            <button onClick={() => setEditOpen(true)} className="text-[12px] font-light text-[#7C3AED] hover:underline dark:text-[#a78bfa]">
              + Adicionar
            </button>
          </div>
          {educacoes.length === 0 ? (
            <p className="mt-3 text-[13px] font-light text-[#9CA3AF]">Nenhuma formação adicionada ainda.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {educacoes.map((edu, i) => (
                <div key={edu.id} className={`flex gap-3 ${i > 0 ? 'border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]' : ''}`}>
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] dark:bg-[#2a1a4e]">
                    <GraduationCap className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{edu.curso}</p>
                    <p className="text-[13px] text-[#7C3AED] dark:text-[#a78bfa]">{edu.instituicao}</p>
                    {edu.periodo && <p className="text-[12px] text-[#9CA3AF]">{edu.periodo}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificações */}
        <div className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#7C3AED]" />
              <h2 className="text-[16px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Certificações</h2>
            </div>
            <button onClick={() => setEditOpen(true)} className="text-[12px] font-light text-[#7C3AED] hover:underline dark:text-[#a78bfa]">
              + Adicionar
            </button>
          </div>
          {certificacoes.length === 0 ? (
            <p className="mt-3 text-[13px] font-light text-[#9CA3AF]">Nenhuma certificação adicionada ainda.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {certificacoes.map((cert, i) => (
                <div key={cert.id} className={`flex gap-3 ${i > 0 ? 'border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]' : ''}`}>
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] dark:bg-[#2a1a4e]">
                    <Award className="h-4 w-4 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{cert.nome}</p>
                    <p className="text-[13px] text-[#7C3AED] dark:text-[#a78bfa]">{cert.emissor}</p>
                    {cert.ano && <p className="text-[12px] text-[#9CA3AF]">{cert.ano}</p>}
                    {cert.url && <a href={cert.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#7C3AED] hover:underline dark:text-[#a78bfa]">Ver credencial →</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

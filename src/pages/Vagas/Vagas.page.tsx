import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, Search, BookmarkPlus, BookmarkCheck,
  Check, X, Plus, Send, Mail, MessageCircle,
} from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

type Level = 'Junior' | 'Mid' | 'Senior' | 'Lead';
type Local = 'Remoto' | 'Híbrido' | 'Presencial';
type Tipo = 'CLT' | 'PJ' | 'Freelance' | 'Estágio';
export type SavedJobStatus = 'quero_aplicar' | 'aplicado' | 'em_processo' | 'encerrado';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  level: Level;
  local: Local;
  tipo: Tipo;
  skills: string[];
  salary: string;
  postedAt: string;
}

export interface SavedJobEntry {
  job: Job;
  status: SavedJobStatus;
  savedAt: string;
}

interface JobApplication {
  jobId: string;
  jobTitle: string;
  company: string;
  message?: string;
  appliedAt: string;
}

export const SAVED_JOBS_KEY = 'saved_jobs';
const APPLICATIONS_KEY = 'job_applications';

export function loadSavedJobs(): SavedJobEntry[] {
  try { return JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) ?? '[]'); } catch { return []; }
}

export function persistSavedJobs(list: SavedJobEntry[]) {
  try { localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(list)); } catch {}
}

function loadApplications(): JobApplication[] {
  try { return JSON.parse(localStorage.getItem(APPLICATIONS_KEY) ?? '[]'); } catch { return []; }
}

function persistApplications(list: JobApplication[]) {
  try { localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list)); } catch {}
}

/* ── Mock data ─────────────────────────────────────── */
const MOCK_JOBS_INITIAL: Job[] = [
  { id: '1', title: 'Desenvolvedor Frontend Sênior', company: 'Nubank', location: 'São Paulo, SP', level: 'Senior', local: 'Remoto', tipo: 'CLT', skills: ['React', 'TypeScript', 'CSS', 'GraphQL'], salary: 'R$ 12.000 – 18.000', postedAt: '2026-06-24' },
  { id: '2', title: 'Engenheiro de Backend', company: 'iFood', location: 'Osasco, SP', level: 'Mid', local: 'Híbrido', tipo: 'PJ', skills: ['Java', 'Spring Boot', 'Kafka', 'AWS'], salary: 'R$ 9.000 – 13.000', postedAt: '2026-06-22' },
  { id: '3', title: 'Desenvolvedor Full Stack', company: 'Mercado Livre', location: 'São Paulo, SP', level: 'Mid', local: 'Remoto', tipo: 'CLT', skills: ['Node.js', 'React', 'Go', 'PostgreSQL'], salary: 'R$ 10.000 – 15.000', postedAt: '2026-06-21' },
  { id: '4', title: 'Cientista de Dados', company: 'BTG Pactual', location: 'São Paulo, SP', level: 'Senior', local: 'Presencial', tipo: 'CLT', skills: ['Python', 'SQL', 'Machine Learning', 'Spark'], salary: 'R$ 15.000 – 22.000', postedAt: '2026-06-20' },
  { id: '5', title: 'Engenheiro DevOps', company: 'Stone', location: 'Rio de Janeiro, RJ', level: 'Senior', local: 'Remoto', tipo: 'CLT', skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD'], salary: 'R$ 13.000 – 19.000', postedAt: '2026-06-19' },
  { id: '6', title: 'UX Designer', company: 'Itaú', location: 'São Paulo, SP', level: 'Mid', local: 'Híbrido', tipo: 'PJ', skills: ['Figma', 'Pesquisa', 'Design System', 'Prototipação'], salary: 'R$ 7.000 – 11.000', postedAt: '2026-06-18' },
  { id: '7', title: 'Desenvolvedor Mobile — React Native', company: 'PicPay', location: 'São Paulo, SP', level: 'Mid', local: 'Remoto', tipo: 'CLT', skills: ['React Native', 'TypeScript', 'Redux'], salary: 'R$ 9.000 – 14.000', postedAt: '2026-06-17' },
  { id: '8', title: 'Analista de QA', company: 'Totvs', location: 'São Paulo, SP', level: 'Junior', local: 'Híbrido', tipo: 'CLT', skills: ['Cypress', 'Selenium', 'Postman'], salary: 'R$ 4.000 – 6.000', postedAt: '2026-06-16' },
  { id: '9', title: 'Tech Lead Frontend', company: 'Creditas', location: 'São Paulo, SP', level: 'Lead', local: 'Remoto', tipo: 'CLT', skills: ['React', 'Architecture', 'TypeScript', 'Micro-frontend'], salary: 'R$ 20.000 – 28.000', postedAt: '2026-06-15' },
  { id: '10', title: 'Desenvolvedor Backend', company: 'Startup Anônima', location: 'Remoto', level: 'Mid', local: 'Remoto', tipo: 'Freelance', skills: ['Node.js', 'MongoDB', 'REST APIs'], salary: 'R$ 80/h', postedAt: '2026-06-14' },
  { id: '11', title: 'Estágio em Engenharia de Software', company: 'Vivo', location: 'São Paulo, SP', level: 'Junior', local: 'Híbrido', tipo: 'Estágio', skills: ['Python', 'Git', 'Linux'], salary: 'R$ 2.200', postedAt: '2026-06-13' },
  { id: '12', title: 'Arquiteto de Soluções Cloud', company: 'Stefanini', location: 'São Paulo, SP', level: 'Lead', local: 'Remoto', tipo: 'PJ', skills: ['AWS', 'Azure', 'GCP', 'Terraform'], salary: 'R$ 25.000 – 35.000', postedAt: '2026-06-12' },
];

const LEVELS: Level[] = ['Junior', 'Mid', 'Senior', 'Lead'];
const LOCALS: Local[] = ['Remoto', 'Híbrido', 'Presencial'];
const TIPOS: Tipo[] = ['CLT', 'PJ', 'Freelance', 'Estágio'];

function postedAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Hoje';
  if (d === 1) return 'Ontem';
  return `${d} dias atrás`;
}

function CompanyLogo({ company }: { company: string }) {
  const initials = company.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] text-[13px] font-medium text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">
      {initials}
    </div>
  );
}

function ChipBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[12px] font-light transition ${
        active
          ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
          : 'border-[#E5E0EB] bg-white text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:bg-transparent dark:text-[#9CA3AF]'
      }`}
    >
      {label}
    </button>
  );
}

/* ── Modal publicar vaga ──────────────────────────── */
function PublicarVagaModal({ onClose, onPublish }: { onClose: () => void; onPublish: (job: Job) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', company: user?.name ?? '', location: '', level: 'Mid' as Level,
    local: 'Remoto' as Local, tipo: 'CLT' as Tipo, salary: '', skills: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim() || !form.company.trim()) return;
    const job: Job = {
      id: String(Date.now()),
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || 'Remoto',
      level: form.level,
      local: form.local,
      tipo: form.tipo,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      salary: form.salary.trim() || 'A combinar',
      postedAt: new Date().toISOString().slice(0, 10),
    };
    onPublish(job);
    onClose();
  };

  const inputCls = 'w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-2.5 text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED] transition dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]';
  const labelCls = 'mb-1 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]';
  const selectCls = 'w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-2.5 text-[13px] font-light text-[#0f0f14] outline-none focus:border-[#7C3AED] transition dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#E5E0EB] bg-white shadow-2xl dark:border-[#2a2a3d] dark:bg-[#1c1c2e]">
        <div className="flex items-center justify-between border-b border-[#F5F3FF] px-6 pt-6 pb-4 dark:border-[#2a2a3d]">
          <h2 className="text-[17px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Publicar vaga</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-[#9CA3AF] hover:bg-[#F5F3FF] dark:hover:bg-[#2a2a3d]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label className={labelCls}>Título da vaga *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex: Desenvolvedor Frontend Sênior" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Empresa *</label>
            <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nome da empresa" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Localização</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ex: São Paulo, SP" className={inputCls} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Nível</label>
              <select value={form.level} onChange={e => set('level', e.target.value)} className={selectCls}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Modalidade</label>
              <select value={form.local} onChange={e => set('local', e.target.value)} className={selectCls}>
                {LOCALS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} className={selectCls}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Faixa salarial</label>
            <input value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="Ex: R$ 8.000 – 12.000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Habilidades (separadas por vírgula)</label>
            <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="React, TypeScript, Node.js" className={inputCls} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#F5F3FF] px-6 py-4 dark:border-[#2a2a3d]">
          <button onClick={onClose} className="rounded-full border border-[#E5E0EB] px-5 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.company.trim()}
            className="rounded-full bg-[#7C3AED] px-5 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de candidatura (3 modos) ──────────────── */
type CandidaturaMode = 'simplificada' | 'email' | 'chat';

function buildEmailBody(user: { name?: string | null; headline?: string | null } | null, job: Job): string {
  const bio = localStorage.getItem('profile_bio') ?? '';
  const habilidades = localStorage.getItem('profile_habilidades') ?? '';
  const exps: Array<{ cargo: string; empresa: string; periodo?: string; descricao?: string }> =
    JSON.parse(localStorage.getItem('profile_experiencias') ?? '[]');
  const edus: Array<{ curso: string; instituicao: string; periodo?: string }> =
    JSON.parse(localStorage.getItem('profile_educacoes') ?? '[]');
  const certs: Array<{ nome: string; emissor: string; ano?: string }> =
    JSON.parse(localStorage.getItem('profile_certificacoes') ?? '[]');

  const lines: string[] = [
    `Olá,`,
    ``,
    `Meu nome é ${user?.name ?? 'candidato'} e tenho interesse na vaga de ${job.title} na ${job.company}.`,
  ];
  if (bio) { lines.push(``, `Sobre mim:`, bio); }
  if (habilidades) { lines.push(``, `Habilidades: ${habilidades}`); }
  if (exps.length > 0) {
    lines.push(``, `Experiências:`);
    exps.forEach(e => {
      lines.push(`• ${e.cargo} — ${e.empresa}${e.periodo ? ` (${e.periodo})` : ''}`);
      if (e.descricao) lines.push(`  ${e.descricao}`);
    });
  }
  if (edus.length > 0) {
    lines.push(``, `Educação:`);
    edus.forEach(e => lines.push(`• ${e.curso} — ${e.instituicao}${e.periodo ? ` (${e.periodo})` : ''}`));
  }
  if (certs.length > 0) {
    lines.push(``, `Certificações:`);
    certs.forEach(c => lines.push(`• ${c.nome} — ${c.emissor}${c.ano ? ` (${c.ano})` : ''}`));
  }
  lines.push(``, `Atenciosamente,`, user?.name ?? '');
  return lines.join('\n');
}

function CandidaturaModal({ job, onClose, onSubmit }: {
  job: Job;
  onClose: () => void;
  onSubmit: (message?: string, mode?: CandidaturaMode) => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<CandidaturaMode>('simplificada');
  const [message, setMessage] = useState('');
  const [chatSent, setChatSent] = useState(false);

  const bio = localStorage.getItem('profile_bio') ?? '';
  const habilidades = localStorage.getItem('profile_habilidades') ?? '';
  const habilidadesList = habilidades.split(',').map(s => s.trim()).filter(Boolean).slice(0, 6);
  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const emailBody = buildEmailBody(user, job);
  const emailSubject = `Candidatura — ${job.title} | ${user?.name ?? ''}`;
  const mailtoHref = `mailto:recrutador@${job.company.toLowerCase().replace(/\s+/g, '')}.com.br?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const defaultChatMsg = `Olá! Me chamo ${user?.name ?? ''} e tenho interesse na vaga de ${job.title}. Podemos conversar?`;
  const [chatMsg, setChatMsg] = useState(defaultChatMsg);

  const handleSendChat = () => {
    const conv = {
      id: `job-${job.id}-${Date.now()}`,
      company: job.company,
      jobTitle: job.title,
      message: chatMsg,
      sentAt: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem('job_chat_messages') ?? '[]');
      localStorage.setItem('job_chat_messages', JSON.stringify([conv, ...prev]));
    } catch {}
    setChatSent(true);
    onSubmit(chatMsg, 'chat');
  };

  const MODES: { key: CandidaturaMode; icon: React.ElementType; label: string }[] = [
    { key: 'simplificada', icon: Send, label: 'Simplificada' },
    { key: 'email', icon: Mail, label: 'Via E-mail' },
    { key: 'chat', icon: MessageCircle, label: 'Via Chat' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E0EB] bg-white shadow-2xl dark:border-[#2a2a3d] dark:bg-[#1c1c2e]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5F3FF] px-6 pt-5 pb-4 dark:border-[#2a2a3d]">
          <div>
            <p className="text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Candidatar-se</p>
            <p className="mt-0.5 text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">{job.title} · {job.company}</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-[#9CA3AF] hover:bg-[#F5F3FF] dark:hover:bg-[#2a2a3d]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1 border-b border-[#F5F3FF] px-6 py-3 dark:border-[#2a2a3d]">
          {MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-light transition ${
                  mode === m.key
                    ? 'bg-[#EDE8F5] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]'
                    : 'text-[#6B7280] hover:bg-[#F9F8FF] dark:text-[#9CA3AF] dark:hover:bg-[#13131f]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4 px-6 py-5">

          {/* ── Modo Simplificada ── */}
          {mode === 'simplificada' && (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDE8F5] text-[13px] font-medium text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{user?.name}</p>
                  <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">{user?.headline ?? 'Profissional · Conexão'}</p>
                  {bio && <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">{bio}</p>}
                  {habilidadesList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {habilidadesList.map(h => (
                        <span key={h} className="rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">{h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">
                  Mensagem para o recrutador <span className="text-[#9CA3AF]">(opcional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Conte por que você é a pessoa certa para essa vaga..."
                  className="w-full resize-none rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-3 text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]"
                />
                <p className="mt-1 text-right text-[11px] text-[#9CA3AF]">{message.length}/300</p>
              </div>
            </>
          )}

          {/* ── Modo E-mail ── */}
          {mode === 'email' && (
            <>
              <p className="text-[13px] font-light text-[#6B7280] dark:text-[#9CA3AF]">
                Seu cliente de e-mail será aberto com os dados do seu perfil pré-preenchidos.
              </p>
              <div className="rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <p className="mb-1 text-[11px] font-light text-[#9CA3AF]">Assunto</p>
                <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{emailSubject}</p>
                <div className="my-3 border-t border-[#E5E0EB] dark:border-[#2a2a3d]" />
                <p className="mb-1 text-[11px] font-light text-[#9CA3AF]">Prévia do corpo</p>
                <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[12px] font-light leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">
                  {emailBody}
                </pre>
              </div>
            </>
          )}

          {/* ── Modo Chat ── */}
          {mode === 'chat' && !chatSent && (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] p-3 dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#7C3AED]" />
                <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">
                  Sua mensagem será entregue ao recrutador de <span className="font-medium text-[#0f0f14] dark:text-[#e8e6ff]">{job.company}</span> via chat interno.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Mensagem</label>
                <textarea
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value.slice(0, 500))}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-3 text-[13px] font-light text-[#0f0f14] outline-none transition focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#e8e6ff]"
                />
                <p className="mt-1 text-right text-[11px] text-[#9CA3AF]">{chatMsg.length}/500</p>
              </div>
            </>
          )}

          {mode === 'chat' && chatSent && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D1FAE5]">
                <Check className="h-6 w-6 text-[#059669]" />
              </div>
              <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Mensagem enviada!</p>
              <p className="text-[12px] text-[#9CA3AF]">O recrutador de {job.company} receberá sua mensagem em breve.</p>
              <button
                onClick={() => navigate('/mensagens')}
                className="mt-1 text-[13px] text-[#7C3AED] hover:underline dark:text-[#a78bfa]"
              >
                Ver em Mensagens →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!(mode === 'chat' && chatSent) && (
          <div className="flex justify-end gap-3 border-t border-[#F5F3FF] px-6 py-4 dark:border-[#2a2a3d]">
            <button onClick={onClose} className="rounded-full border border-[#E5E0EB] px-5 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
              Cancelar
            </button>

            {mode === 'simplificada' && (
              <button
                onClick={() => onSubmit(message.trim() || undefined, 'simplificada')}
                className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-5 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9]"
              >
                <Send className="h-3.5 w-3.5" />
                Enviar candidatura
              </button>
            )}

            {mode === 'email' && (
              <a
                href={mailtoHref}
                onClick={() => onSubmit(undefined, 'email')}
                className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-5 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9]"
              >
                <Mail className="h-3.5 w-3.5" />
                Abrir e-mail
              </a>
            )}

            {mode === 'chat' && !chatSent && (
              <button
                onClick={handleSendChat}
                disabled={!chatMsg.trim()}
                className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-5 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Enviar mensagem
              </button>
            )}
          </div>
        )}

        {mode === 'chat' && chatSent && (
          <div className="border-t border-[#F5F3FF] px-6 py-4 dark:border-[#2a2a3d]">
            <button onClick={onClose} className="w-full rounded-full border border-[#E5E0EB] py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────── */
export function VagasPage() {
  const { add: addNotification } = useNotifications();

  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS_INITIAL);
  const [levels, setLevels] = useState<Set<Level>>(new Set());
  const [locals, setLocals] = useState<Set<Local>>(new Set());
  const [tipos, setTipos] = useState<Set<Tipo>>(new Set());
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);
  const [candidaturaJob, setCandidaturaJob] = useState<Job | null>(null);

  const [savedEntries, setSavedEntries] = useState<SavedJobEntry[]>(loadSavedJobs);
  const [applications, setApplications] = useState<JobApplication[]>(loadApplications);

  const savedIds = new Set(savedEntries.map(e => e.job.id));
  const appliedIds = new Set(applications.map(a => a.jobId));

  function toggleSave(job: Job) {
    setSavedEntries(prev => {
      const exists = prev.find(e => e.job.id === job.id);
      const next = exists
        ? prev.filter(e => e.job.id !== job.id)
        : [...prev, { job, status: 'quero_aplicar' as SavedJobStatus, savedAt: new Date().toISOString() }];
      persistSavedJobs(next);
      return next;
    });
  }

  function handleApply(message?: string, mode: CandidaturaMode = 'simplificada') {
    if (!candidaturaJob) return;
    const job = candidaturaJob;

    const application: JobApplication = {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      message,
      appliedAt: new Date().toISOString(),
    };

    setApplications(prev => {
      const next = [application, ...prev];
      persistApplications(next);
      return next;
    });

    setSavedEntries(prev => {
      const exists = prev.find(e => e.job.id === job.id);
      const next = exists
        ? prev.map(e => e.job.id === job.id ? { ...e, status: 'aplicado' as SavedJobStatus } : e)
        : [...prev, { job, status: 'aplicado' as SavedJobStatus, savedAt: new Date().toISOString() }];
      persistSavedJobs(next);
      return next;
    });

    const modeLabel = mode === 'email' ? 'por e-mail' : mode === 'chat' ? 'via chat' : '';
    addNotification(`Candidatura enviada${modeLabel ? ` ${modeLabel}` : ''} para ${job.title} na ${job.company}`, 'post');

    if (mode !== 'chat') setCandidaturaJob(null);
  }

  function toggle<T>(set: Set<T>, val: T, setter: (s: Set<T>) => void) {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  }

  const filtered = useMemo(() => {
    const skillList = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return jobs.filter(j => {
      if (levels.size > 0 && !levels.has(j.level)) return false;
      if (locals.size > 0 && !locals.has(j.local)) return false;
      if (tipos.size > 0 && !tipos.has(j.tipo)) return false;
      if (query && !j.title.toLowerCase().includes(query.toLowerCase()) && !j.company.toLowerCase().includes(query.toLowerCase())) return false;
      if (skillList.length > 0 && !skillList.every(s => j.skills.some(sk => sk.toLowerCase().includes(s)))) return false;
      return true;
    });
  }, [jobs, levels, locals, tipos, query, skills]);

  return (
    <AppShell>
      {publishOpen && (
        <PublicarVagaModal
          onClose={() => setPublishOpen(false)}
          onPublish={job => setJobs(prev => [job, ...prev])}
        />
      )}
      {candidaturaJob && (
        <CandidaturaModal
          job={candidaturaJob}
          onClose={() => setCandidaturaJob(null)}
          onSubmit={handleApply}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Oportunidades</h1>
            <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">Vagas filtradas por nível, localização, tipo e habilidades.</p>
          </div>
          <button
            onClick={() => setPublishOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9]"
          >
            <Plus className="h-3.5 w-3.5" />
            Publicar vaga
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-[#E5E0EB] bg-white p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-[12px] font-light text-[#9CA3AF]">Nível:</span>
            {LEVELS.map(l => <ChipBtn key={l} label={l} active={levels.has(l)} onClick={() => toggle(levels, l, setLevels)} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-[12px] font-light text-[#9CA3AF]">Local:</span>
            {LOCALS.map(l => <ChipBtn key={l} label={l} active={locals.has(l)} onClick={() => toggle(locals, l, setLocals)} />)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-12 shrink-0 text-[12px] font-light text-[#9CA3AF]">Tipo:</span>
            {TIPOS.map(t => <ChipBtn key={t} label={t} active={tipos.has(t)} onClick={() => toggle(tipos, t, setTipos)} />)}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título ou empresa..." className="h-9 w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] pl-8 pr-3 text-[13px] text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1c1c2e] dark:text-[#e8e6ff]" />
            </div>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="Habilidades (ex: Java, Spring)" className="h-9 w-full rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] pl-8 pr-3 text-[13px] text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1c1c2e] dark:text-[#e8e6ff]" />
            </div>
          </div>
        </div>

        <p className="text-[12px] text-[#9CA3AF]">
          {filtered.length} {filtered.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-10 text-center dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <Briefcase className="mx-auto h-8 w-8 text-[#9CA3AF]" />
            <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma vaga encontrada com os filtros selecionados.</p>
            <button
              onClick={() => { setLevels(new Set()); setLocals(new Set()); setTipos(new Set()); setQuery(''); setSkills(''); }}
              className="mt-3 text-[13px] text-[#7C3AED] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(job => (
              <div key={job.id} className="flex items-start gap-4 rounded-2xl border border-[#E5E0EB] bg-white p-4 transition hover:border-[#D4CAED] dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <CompanyLogo company={job.company} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{job.title}</p>
                      <p className="text-[13px] text-[#6B7280] dark:text-[#9CA3AF]">{job.company}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => toggleSave(job)}
                        title={savedIds.has(job.id) ? 'Remover dos salvos' : 'Salvar vaga'}
                        className={`grid h-8 w-8 place-items-center rounded-full transition ${
                          savedIds.has(job.id)
                            ? 'text-[#7C3AED] dark:text-[#a78bfa]'
                            : 'text-[#9CA3AF] hover:bg-[#EDE8F5] hover:text-[#7C3AED] dark:hover:bg-[#2a1a4e]'
                        }`}
                      >
                        {savedIds.has(job.id) ? <BookmarkCheck className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => !appliedIds.has(job.id) && setCandidaturaJob(job)}
                        disabled={appliedIds.has(job.id)}
                        className={`rounded-full px-4 py-1.5 text-[12px] font-light transition ${
                          appliedIds.has(job.id)
                            ? 'cursor-default bg-[#EDE8F5] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]'
                            : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                        }`}
                      >
                        {appliedIds.has(job.id)
                          ? <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Candidatado</span>
                          : 'Candidatar'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#9CA3AF]">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{postedAgo(job.postedAt)}</span>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">{job.salary}</span>
                    <span className="rounded-full bg-[#EDE8F5] px-2 py-0.5 text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">{job.local}</span>
                    <span className="rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[#7C3AED] dark:bg-[#1a1030] dark:text-[#a78bfa]">{job.tipo}</span>
                    <span className="rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">{job.level}</span>
                  </div>
                  {job.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.skills.map(s => (
                        <span key={s} className="rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

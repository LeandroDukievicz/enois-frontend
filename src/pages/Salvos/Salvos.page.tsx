import { useState, useEffect } from 'react';
import { Bookmark, Heart, MessageCircle, Trash2, Briefcase, MapPin, Clock, Check, ChevronDown, X } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { type SavedJobEntry, type SavedJobStatus, loadSavedJobs, persistSavedJobs } from '../Vagas/Vagas.page';

/* ── Posts ──────────────────────────────────────── */
interface SavedPost {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  type: string;
  content: string;
  createdAt: string;
  reactions: number;
  comments: number;
  saves: number;
  communityName?: string;
}

const POST_TYPE_LABEL: Record<string, string> = {
  INSIGHT: 'Insight', ARTICLE: 'Artigo', QUESTION: 'Pergunta',
  PROJECT: 'Projeto', MEDIA: 'Mídia',
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

function postedAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Hoje';
  if (d === 1) return 'Ontem';
  return `${d} dias atrás`;
}

function readSavedPosts(): SavedPost[] {
  try { return JSON.parse(localStorage.getItem('saved_posts_data') ?? '[]'); } catch { return []; }
}

/* ── Vagas ──────────────────────────────────────── */
const STATUS_LABELS: Record<SavedJobStatus, string> = {
  quero_aplicar: 'Quero aplicar',
  aplicado: 'Aplicado',
  em_processo: 'Em processo',
  encerrado: 'Encerrado',
};

const STATUS_COLORS: Record<SavedJobStatus, string> = {
  quero_aplicar: 'bg-[#EDE8F5] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]',
  aplicado: 'bg-[#D1FAE5] text-[#059669] dark:bg-[#052e16] dark:text-[#34d399]',
  em_processo: 'bg-[#FEF3C7] text-[#D97706] dark:bg-[#2d1a00] dark:text-[#fbbf24]',
  encerrado: 'bg-[#F3F4F6] text-[#6B7280] dark:bg-[#1f1f2e] dark:text-[#9CA3AF]',
};

const STATUS_ORDER: SavedJobStatus[] = ['quero_aplicar', 'aplicado', 'em_processo', 'encerrado'];

function CompanyLogo({ company }: { company: string }) {
  const initials = company.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE8F5] text-[12px] font-medium text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">
      {initials}
    </div>
  );
}

function SavedJobCard({ entry, onRemove, onStatusChange }: {
  entry: SavedJobEntry;
  onRemove: () => void;
  onStatusChange: (s: SavedJobStatus) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const { job } = entry;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#E5E0EB] bg-white p-4 transition hover:border-[#D4CAED] dark:border-[#2a2a3d] dark:bg-[#13131f]">
      <CompanyLogo company={job.company} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{job.title}</p>
            <p className="text-[12px] text-[#6B7280] dark:text-[#9CA3AF]">{job.company}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-light transition ${STATUS_COLORS[entry.status]}`}
              >
                {STATUS_LABELS[entry.status]}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-[#E5E0EB] bg-white shadow-lg dark:border-[#2a2a3d] dark:bg-[#1c1c2e]">
                  {STATUS_ORDER.map(s => (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(s); setShowMenu(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-[12px] font-light transition hover:bg-[#F9F8FF] dark:hover:bg-[#2a2a3d] ${entry.status === s ? 'text-[#7C3AED] dark:text-[#a78bfa]' : 'text-[#374151] dark:text-[#e8e6ff]'}`}
                    >
                      {entry.status === s
                        ? <Check className="h-3 w-3 shrink-0" />
                        : <span className="h-3 w-3 shrink-0" />}
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onRemove}
              className="grid h-7 w-7 place-items-center rounded-full text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
              title="Remover dos salvos"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9CA3AF]">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{postedAgo(job.postedAt)}</span>
          <span className="text-[#6B7280] dark:text-[#9CA3AF]">{job.salary}</span>
          <span className="rounded-full bg-[#EDE8F5] px-2 py-0.5 text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">{job.local}</span>
          <span className="rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">{job.level}</span>
        </div>
        {job.skills.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map(s => (
              <span key={s} className="rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[10px] text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">{s}</span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[10px] text-[#9CA3AF] dark:border-[#2a2a3d]">+{job.skills.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────── */
export function SalvosPage() {
  const [activeTab, setActiveTab] = useState<'posts' | 'vagas'>('posts');
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [jobEntries, setJobEntries] = useState<SavedJobEntry[]>(loadSavedJobs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPosts(readSavedPosts());
    setLoading(false);
  }, []);

  const handleUnsavePost = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('saved_posts_data', JSON.stringify(updated));
  };

  const handleRemoveJob = (jobId: string) => {
    setJobEntries(prev => {
      const next = prev.filter(e => e.job.id !== jobId);
      persistSavedJobs(next);
      return next;
    });
  };

  const handleStatusChange = (jobId: string, status: SavedJobStatus) => {
    setJobEntries(prev => {
      const next = prev.map(e => e.job.id === jobId ? { ...e, status } : e);
      persistSavedJobs(next);
      return next;
    });
  };

  const jobGroups = STATUS_ORDER
    .map(status => ({ status, entries: jobEntries.filter(e => e.status === status) }))
    .filter(g => g.entries.length > 0);

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-[24px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Salvos</h1>
          <p className="text-[14px] text-[#6B7280] dark:text-[#9CA3AF]">Publicações e vagas que você guardou.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] p-1 dark:border-[#2a2a3d] dark:bg-[#13131f]">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-light transition ${
              activeTab === 'posts'
                ? 'bg-white text-[#0f0f14] shadow-sm dark:bg-[#1c1c2e] dark:text-[#e8e6ff]'
                : 'text-[#6B7280] hover:text-[#7C3AED] dark:text-[#9CA3AF]'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Posts
            {posts.length > 0 && (
              <span className="rounded-full bg-[#EDE8F5] px-1.5 py-0.5 text-[11px] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">
                {posts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('vagas')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-[13px] font-light transition ${
              activeTab === 'vagas'
                ? 'bg-white text-[#0f0f14] shadow-sm dark:bg-[#1c1c2e] dark:text-[#e8e6ff]'
                : 'text-[#6B7280] hover:text-[#7C3AED] dark:text-[#9CA3AF]'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            Vagas
            {jobEntries.length > 0 && (
              <span className="rounded-full bg-[#EDE8F5] px-1.5 py-0.5 text-[11px] text-[#7C3AED] dark:bg-[#2a1a4e] dark:text-[#a78bfa]">
                {jobEntries.length}
              </span>
            )}
          </button>
        </div>

        {/* Posts tab */}
        {activeTab === 'posts' && (
          loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-[#E5E0EB] bg-white dark:border-[#2a2a3d] dark:bg-[#13131f]" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E0EB] bg-white p-10 text-center dark:border-[#2a2a3d] dark:bg-[#13131f]">
              <Bookmark className="mx-auto h-8 w-8 text-[#9CA3AF]" />
              <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma publicação salva ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <article key={post.id} className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
                  <div className="flex items-start gap-3">
                    <Avatar src={post.authorAvatar} name={post.authorName} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{post.authorName}</span>
                        <span className="text-[12px] text-[#9CA3AF]">· {timeAgo(post.createdAt)}</span>
                        <span className="inline-flex rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280] dark:border-[#2a2a3d]">
                          {POST_TYPE_LABEL[post.type] ?? post.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnsavePost(post.id)}
                      aria-label="Remover dos salvos"
                      className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-[15px] font-light leading-relaxed text-[#0f0f14] dark:text-[#e8e6ff]">
                    {post.content}
                  </p>
                  <div className="mt-4 flex items-center gap-5 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF] dark:border-[#1e1e2e]">
                    <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{post.reactions}</span>
                    <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{post.comments}</span>
                    <span className="flex items-center gap-1.5 text-[#7C3AED] dark:text-[#a78bfa]">
                      <Bookmark className="h-4 w-4 fill-current" />Salvo
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        {/* Vagas tab */}
        {activeTab === 'vagas' && (
          jobEntries.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E0EB] bg-white p-10 text-center dark:border-[#2a2a3d] dark:bg-[#13131f]">
              <Briefcase className="mx-auto h-8 w-8 text-[#9CA3AF]" />
              <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma vaga salva ainda.</p>
              <p className="mt-1 text-[12px] text-[#9CA3AF]">Use o ícone de marcador na aba Vagas para salvar oportunidades aqui.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobGroups.map(group => (
                <div key={group.status}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[12px] font-light ${STATUS_COLORS[group.status]}`}>
                      {STATUS_LABELS[group.status]}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF]">
                      {group.entries.length} {group.entries.length === 1 ? 'vaga' : 'vagas'}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {group.entries.map(entry => (
                      <SavedJobCard
                        key={entry.job.id}
                        entry={entry}
                        onRemove={() => handleRemoveJob(entry.job.id)}
                        onStatusChange={s => handleStatusChange(entry.job.id, s)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </AppShell>
  );
}

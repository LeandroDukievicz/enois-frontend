import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Image, FileText, BarChart3, Calendar, Video,
  Send, Heart, MessageCircle, Bookmark, Share2, Flag, Trash2,
  TrendingUp, UserPlus, Link2, Repeat2, Users, Camera, Play,
  Bold, Italic, Paperclip,
} from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

const POST_TYPES = [
  { key: 'INSIGHT',  label: 'Insight',  icon: Image    },
  { key: 'ARTICLE',  label: 'Artigo',   icon: FileText },
  { key: 'QUESTION', label: 'Pergunta', icon: BarChart3 },
  { key: 'PROJECT',  label: 'Projeto',  icon: Calendar },
  { key: 'MEDIA',    label: 'Mídia',    icon: Video    },
] as const;

const FILTER_CHIPS = [
  { key: null,        label: 'Todos'    },
  { key: 'INSIGHT',  label: 'Insight'  },
  { key: 'ARTICLE',  label: 'Artigo'   },
  { key: 'QUESTION', label: 'Pergunta' },
  { key: 'PROJECT',  label: 'Projeto'  },
  { key: 'MEDIA',    label: 'Mídia'    },
] as const;

const MOCK_SUGGESTIONS = [
  { id: '1', name: 'Diego de Souza F.', headline: 'Gestão de Projetos de...', avatar: null },
  { id: '2', name: 'Guilherme L.',       headline: 'UX Designer · Nubank',      avatar: null },
  { id: '3', name: 'Vitor Hugo Pasch.', headline: 'Engenheiro de Software',    avatar: null },
  { id: '4', name: 'André Kalil Rosen.', headline: 'Marketing Digital',         avatar: null },
];

const now = Date.now();

type PostType = typeof POST_TYPES[number]['key'];

interface Comment { id: string; author: string; avatar: string | null; text: string; }

interface LocalPost {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string | null;
  type: PostType;
  content: string;
  createdAt: string;
  reactions: number;
  comments: number;
  saves: number;
  communityName?: string;
  hasVideo?: boolean;
}

const MOCK_COMMUNITY_POSTS: LocalPost[] = [
  {
    id: 'c1', authorName: 'Iraê C. Brandão', authorUsername: 'irae', authorAvatar: null,
    type: 'INSIGHT', communityName: 'Mundinho React',
    content: 'Alguém mais animado com o React 19 Server Actions? Testei ontem e sinceramente, mudou a forma como penso em formulários. Menos useEffect, mais intenção.',
    createdAt: new Date(now - 25 * 60000).toISOString(), reactions: 14, comments: 5, saves: 3,
  },
  {
    id: 'c2', authorName: 'Beatriz Alves', authorUsername: 'bealves', authorAvatar: null,
    type: 'QUESTION', communityName: 'Mundinho React',
    content: 'Vocês usam Zustand ou Context API para estado global em projetos médios? Tenho sentido o Context pesado demais em re-renders mas não quero adicionar dependências desnecessárias.',
    createdAt: new Date(now - 2 * 3600000).toISOString(), reactions: 8, comments: 12, saves: 1,
  },
  {
    id: 'c3', authorName: 'Victor Penachio', authorUsername: 'victorp', authorAvatar: null,
    type: 'ARTICLE', communityName: 'Editais, Inovação & Parcerias',
    content: 'Edital aberto: FINEP está com chamada pública para startups de impacto social na área de clima. Prazo até 30/07/2026. Vale muito a pena olhar — subsídio de até R$ 500 mil sem contrapartida financeira. 👀',
    createdAt: new Date(now - 4 * 3600000).toISOString(), reactions: 23, comments: 7, saves: 9,
  },
  {
    id: 'c6', authorName: 'Lucas Ferreira', authorUsername: 'lucasf', authorAvatar: null,
    type: 'MEDIA', communityName: 'Mundinho React', hasVideo: true,
    content: 'Gravei um vídeo rápido mostrando como configurar Vite + React + TypeScript em menos de 2 minutos. Confira!',
    createdAt: new Date(now - 5 * 3600000).toISOString(), reactions: 7, comments: 2, saves: 3,
  },
  {
    id: 'c4', authorName: 'Camila Torres', authorUsername: 'camilat', authorAvatar: null,
    type: 'INSIGHT', communityName: 'Editais, Inovação & Parcerias',
    content: 'Parceria firmada entre o Hub Figital e a USP para desenvolvimento de projetos de inovação aberta. Oportunidades abertas para makers, devs e designers até agosto. Link no perfil.',
    createdAt: new Date(now - 6 * 3600000).toISOString(), reactions: 11, comments: 3, saves: 4,
  },
  {
    id: 'c5', authorName: 'Rafael Monteiro', authorUsername: 'rafaelm', authorAvatar: null,
    type: 'INSIGHT', communityName: 'Mundinho React',
    content: 'Dica rápida: use o hook `use()` do React 19 para unwrap Promises diretamente no render. Reduz consideravelmente o boilerplate de loading state.',
    createdAt: new Date(now - 10 * 3600000).toISOString(), reactions: 19, comments: 4, saves: 6,
  },
];

const MOCK_EVENTS = [
  { id: '1', title: 'Lançamento - Hub Figital de Inovação',     date: '2026-06-30', format: 'HYBRID', attendees: 2  },
  { id: '2', title: 'Workshop de Comunicações Via Satélite',     date: '2026-07-10', format: 'HYBRID', attendees: 1  },
  { id: '3', title: 'Meetup React Brasil',                       date: '2026-07-05', format: 'ONLINE', attendees: 48 },
];

const TYPE_LABEL: Record<string, string> = {
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

/* Renderiza **negrito** e *itálico* inline sem dangerouslySetInnerHTML */
function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*'))
          return <em key={i}>{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function ConfirmDeleteModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E0EB] bg-white p-6 shadow-xl dark:border-[#2a2a3d] dark:bg-[#13131f]">
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <p className="mt-3 text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{message}</p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">Essa ação não pode ser desfeita.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-[#E5E0EB] px-5 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d]">Cancelar</button>
          <button onClick={onConfirm} className="rounded-full bg-red-500 px-5 py-2 text-[13px] font-light text-white transition hover:bg-red-600">Apagar</button>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, isOwn, onDelete }: {
  post: LocalPost; isOwn: boolean; onDelete: () => void;
}) {
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reply, setReply] = useState('');
  const [pendingDelete, setPendingDelete] = useState<null | 'post' | string>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen]);

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(`https://conexao.app/post/${post.id}`); } catch {}
    setLinkCopied(true);
    addNotif('Link da publicação copiado para a área de transferência.', 'post');
    setTimeout(() => { setLinkCopied(false); setShareOpen(false); }, 1800);
  };

  const handleRepost = () => {
    setShareOpen(false);
    addNotif('Publicação repostada no seu feed.', 'post');
  };

  const submitReply = (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setComments(prev => [...prev, { id: String(Date.now()), author: user?.name ?? 'Você', avatar: user?.avatar ?? null, text: reply.trim() }]);
    setReply('');
  };

  const handleConfirm = () => {
    if (pendingDelete === 'post') onDelete();
    else if (pendingDelete) setComments(prev => prev.filter(c => c.id !== pendingDelete));
    setPendingDelete(null);
  };

  const confirmMessage = pendingDelete === 'post' ? 'Tem certeza que deseja apagar essa publicação?' : 'Tem certeza que deseja apagar esse comentário?';

  return (
    <>
      {pendingDelete && <ConfirmDeleteModal message={confirmMessage} onConfirm={handleConfirm} onCancel={() => setPendingDelete(null)} />}
      <article className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
        <div className="flex items-start gap-3">
          <Avatar src={post.authorAvatar} name={post.authorName} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{post.authorName}</span>
              <span className="text-[12px] text-[#9CA3AF]">· {timeAgo(post.createdAt)}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280] dark:border-[#2a2a3d] dark:text-[#9CA3AF]">
                {TYPE_LABEL[post.type] ?? post.type}
              </span>
              {post.communityName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE8F5] px-2 py-0.5 text-[11px] text-[#7C3AED] dark:bg-[#2d1f4e]">
                  <Users className="h-2.5 w-2.5" />
                  {post.communityName}
                </span>
              )}
            </div>
          </div>
          {isOwn && (
            <button onClick={() => setPendingDelete('post')} className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <RichText
          text={post.content}
          className="mt-3 text-[15px] font-light leading-relaxed text-[#0f0f14] whitespace-pre-wrap dark:text-[#e8e6ff]"
        />

        {/* Player simulado — posts MEDIA com vídeo */}
        {(post.type === 'MEDIA' || post.hasVideo) && (
          <div className="mt-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-[#0f0f14]">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20">
                <Play className="ml-0.5 h-6 w-6 fill-white/80 text-white/80" />
              </div>
              <p className="text-[11px] font-light text-white/40">Vídeo curto · simulado</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF] dark:border-[#1e1e2e]">
          <button aria-label="Curtir" onClick={() => setLiked(p => !p)} className={`flex items-center gap-1.5 transition ${liked ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'}`}>
            <Heart className={`h-4 w-4 ${liked ? 'fill-[#7C3AED]' : ''}`} />
            {post.reactions + (liked ? 1 : 0)}
          </button>
          <button onClick={() => setShowComments(p => !p)} className={`flex items-center gap-1.5 transition ${showComments ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'}`}>
            <MessageCircle className="h-4 w-4" />
            {post.comments + comments.length}
          </button>
          <button onClick={() => setSaved(p => !p)} className={`flex items-center gap-1.5 transition ${saved ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'}`}>
            <Bookmark className={`h-4 w-4 ${saved ? 'fill-[#7C3AED]' : ''}`} />
            {post.saves + (saved ? 1 : 0)}
          </button>
          <div ref={shareRef} className="relative">
            <button onClick={() => setShareOpen(p => !p)} className={`flex items-center gap-1.5 transition ${shareOpen ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'}`}>
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
            {shareOpen && (
              <div className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-[#E5E0EB] bg-white shadow-xl dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <button onClick={handleCopyLink} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-[13px] font-light text-[#0f0f14] transition hover:bg-[#F5F3FF] dark:text-[#e8e6ff] dark:hover:bg-[#1e1e2e]">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
                  {linkCopied ? '✓ Link copiado!' : 'Copiar link da publicação'}
                </button>
                <button onClick={handleRepost} className="flex w-full items-center gap-2.5 border-t border-[#F5F3FF] px-4 py-3 text-left text-[13px] font-light text-[#0f0f14] transition hover:bg-[#F5F3FF] dark:border-[#1e1e2e] dark:text-[#e8e6ff] dark:hover:bg-[#1e1e2e]">
                  <Repeat2 className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
                  Repostar no feed
                </button>
              </div>
            )}
          </div>
          {/* Flag — marca publicação para revisão */}
          <button
            onClick={() => setFlagged(p => !p)}
            aria-label="Marcar publicação"
            className={`ml-auto flex items-center gap-1.5 transition ${flagged ? 'text-amber-500' : 'hover:text-amber-500'}`}
          >
            <Flag className={`h-4 w-4 ${flagged ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-[#F5F3FF] pt-4 dark:border-[#1e1e2e]">
            {comments.length === 0 && <p className="text-[13px] font-light text-[#9CA3AF]">Nenhum comentário ainda. Seja o primeiro!</p>}
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar src={c.avatar} name={c.author} size="sm" />
                <div className="min-w-0 flex-1 rounded-xl bg-[#F9F8FF] px-3 py-2 dark:bg-[#1e1e2e]">
                  <p className="text-[12px] font-medium text-[#0f0f14] dark:text-[#e8e6ff]">{c.author}</p>
                  <p className="mt-0.5 text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{c.text}</p>
                </div>
                {c.author === (user?.name ?? 'Você') && (
                  <button onClick={() => setPendingDelete(c.id)} className="mt-1 shrink-0 rounded-lg p-1 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <form onSubmit={submitReply} className="flex items-center gap-2.5">
              <Avatar src={user?.avatar ?? null} name={user?.name ?? 'Você'} size="sm" />
              <div className="flex flex-1 items-center gap-2 rounded-full border border-[#E5E0EB] bg-[#F9F8FF] pl-4 pr-1.5 py-1.5 dark:border-[#2a2a3d] dark:bg-[#1e1e2e]">
                <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Escreva um comentário..." className="flex-1 bg-transparent text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none dark:text-[#e8e6ff]" />
                <button aria-label="Enviar comentário" type="submit" disabled={!reply.trim()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9] disabled:opacity-40">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </article>
    </>
  );
}

export function InicioPage() {
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();
  const [typeFilter, setTypeFilter] = useState<PostType | null>(null);
  const [posts, setPosts] = useState<LocalPost[]>(MOCK_COMMUNITY_POSTS);
  const [draft, setDraft] = useState('');
  const [postType, setPostType] = useState<PostType>('INSIGHT');
  const [publishing, setPublishing] = useState(false);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  /* Banner do mini-card sincronizado com Perfil via localStorage */
  const [coverUrl, setCoverUrl] = useState<string | null>(() => localStorage.getItem('cover_image'));
  const coverInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target!.result as string;
      setCoverUrl(url);
      localStorage.setItem('cover_image', url);
    };
    reader.readAsDataURL(file);
  };

  /* Formata texto selecionado na textarea com marcadores markdown */
  const wrapSelection = (prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const selected = value.slice(s, e) || 'texto';
    const next = value.slice(0, s) + prefix + selected + suffix + value.slice(e);
    setDraft(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(s + prefix.length, s + prefix.length + selected.length);
    }, 0);
  };

  const handlePublish = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || publishing) return;
    setPublishing(true);
    const newPost: LocalPost = {
      id: String(Date.now()),
      authorName: user?.name ?? 'Você',
      authorUsername: user?.username ?? 'voce',
      authorAvatar: user?.avatar ?? null,
      type: postType,
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      reactions: 0, comments: 0, saves: 0,
      hasVideo: videoFile != null,
    };
    setPosts(prev => [newPost, ...prev]);
    setDraft('');
    setVideoFile(null);
    setPublishing(false);
    addNotif('Sua publicação foi compartilhada com a rede.', 'post');
  };

  const handleDelete = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));

  const visiblePosts = typeFilter ? posts.filter(p => p.type === typeFilter) : posts;

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* Composer */}
          <form onSubmit={handlePublish} className="rounded-2xl border border-[#E5E0EB] bg-white p-5 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div className="flex items-start gap-3">
              <Avatar src={user?.avatar} name={user?.name ?? 'Você'} />
              <textarea
                ref={textareaRef}
                value={draft} onChange={e => setDraft(e.target.value)}
                placeholder="Compartilhe algo que aprendeu hoje..."
                rows={2} maxLength={600}
                className="flex-1 resize-none rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-3 py-2.5 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1c1c2e] dark:text-[#e8e6ff]"
              />
            </div>

            {/* Stub de vídeo quando seleccionado */}
            {postType === 'MEDIA' && (
              <div className="mt-3 overflow-hidden rounded-xl border-2 border-dashed border-[#E5E0EB] bg-[#F9F8FF] px-6 py-5 text-center dark:border-[#2a2a3d] dark:bg-[#1c1c2e]">
                <Video className="mx-auto h-7 w-7 text-[#C4B5FD]" />
                <p className="mt-1.5 text-[13px] font-light text-[#9CA3AF]">Adicionar vídeo curto</p>
                <p className="text-[11px] text-[#C4B5FD]">até 3 minutos · MP4, MOV</p>
                <button type="button" onClick={() => videoInputRef.current?.click()} className="mt-3 rounded-full border border-[#C4B5FD] px-4 py-1.5 text-[12px] font-light text-[#7C3AED] transition hover:bg-[#EDE8F5]">
                  Escolher arquivo
                </button>
              </div>
            )}
            {videoFile && postType !== 'MEDIA' && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-[#F9F8FF] px-3 py-1.5 dark:bg-[#1e1e2e]">
                <Video className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
                <span className="flex-1 truncate text-[12px] text-[#6B7280]">{videoFile.name}</span>
                <button type="button" onClick={() => setVideoFile(null)} className="text-[#9CA3AF] hover:text-red-400">×</button>
              </div>
            )}

            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setVideoFile(f); }} />

            <div className="mt-3 border-t border-[#F5F3FF] pt-3 dark:border-[#1e1e2e]">
              {/* Linha 1: seletores de tipo */}
              <div className="flex flex-wrap gap-1">
                {POST_TYPES.map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setPostType(key)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition ${postType === key ? 'bg-[#EDE8F5] text-[#7C3AED] dark:bg-[#2d1f4e]' : 'text-[#9CA3AF] hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]'}`}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>

              {/* Linha 2: ferramentas de formatação + publicar */}
              <div className="mt-3 flex items-center gap-1">
                {/* Formatação */}
                <button type="button" aria-label="Negrito" onClick={() => wrapSelection('**', '**')}
                  className="grid h-7 w-7 place-items-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]">
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button type="button" aria-label="Itálico" onClick={() => wrapSelection('*', '*')}
                  className="grid h-7 w-7 place-items-center rounded-lg text-[#9CA3AF] transition hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]">
                  <Italic className="h-3.5 w-3.5" />
                </button>
                {/* Upload de vídeo discreto */}
                <button type="button" aria-label="Adicionar vídeo" onClick={() => videoInputRef.current?.click()}
                  className={`grid h-7 w-7 place-items-center rounded-lg transition ${videoFile ? 'text-[#7C3AED]' : 'text-[#9CA3AF] hover:bg-[#F5F3FF] hover:text-[#6B7280] dark:hover:bg-[#1e1e2e]'}`}>
                  <Paperclip className="h-3.5 w-3.5" />
                </button>

                {/* Publicar — alinhado à esquerda */}
                <button type="submit" disabled={!draft.trim() || publishing}
                  className="ml-0 flex items-center gap-2 rounded-full bg-[#7C3AED] px-5 py-2 text-[13px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40">
                  <Send className="h-3.5 w-3.5" /> Publicar
                </button>
              </div>
            </div>
          </form>

          {/* Filtros de tópico */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_CHIPS.map(({ key, label }) => (
              <button
                key={label}
                aria-label={key ? `Filtrar por ${label}` : 'Mostrar todos os tópicos'}
                onClick={() => setTypeFilter(key as PostType | null)}
                className={`rounded-full px-3 py-1 text-[12px] font-light transition ${
                  typeFilter === key
                    ? 'bg-[#7C3AED] text-white'
                    : 'border border-[#E5E0EB] bg-white text-[#9CA3AF] hover:border-[#C4B5FD] hover:text-[#6B7280] dark:border-[#2a2a3d] dark:bg-[#13131f] dark:text-[#6B7280]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {visiblePosts.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-14 text-center dark:border-[#2a2a3d] dark:bg-[#13131f]">
                <p className="text-[15px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">
                  {typeFilter ? `Nenhuma publicação do tipo "${TYPE_LABEL[typeFilter]}"` : 'Sem publicações ainda'}
                </p>
              </div>
            ) : (
              visiblePosts.map(p => (
                <PostCard key={p.id} post={p} isOwn={p.authorName === user?.name} onDelete={() => handleDelete(p.id)} />
              ))
            )}
          </div>
        </div>

        {/* Rail direita */}
        <aside className="hidden space-y-4 lg:block">
          <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white dark:border-[#2a2a3d] dark:bg-[#13131f]">
            {/* Banner clicável — sincronizado com Perfil */}
            <div
              className="group relative h-14 w-full cursor-pointer"
              style={
                coverUrl
                  ? { backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(135deg, #3B1E7A 0%, #7C3AED 55%, #A78BFA 100%)' }
              }
              onClick={() => coverInputRef.current?.click()}
            >
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 text-[11px] text-transparent transition-all group-hover:bg-black/30 group-hover:text-white">
                <Camera className="h-3.5 w-3.5" />
                Alterar capa
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            </div>

            <div className="-mt-7 px-4 pb-4 text-center">
              <div className="relative z-10 inline-block">
                <Avatar src={user?.avatar ?? null} name={user?.name ?? 'Você'} size="lg" />
              </div>
              <p className="mt-2 text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{user?.name}</p>
              <p className="text-[12px] text-[#9CA3AF]">{user?.headline ?? 'Conexão'}</p>
              <div className="mt-3 grid grid-cols-2 gap-1 border-t border-[#F5F3FF] pt-3 text-center text-[12px] dark:border-[#1e1e2e]">
                <div><p className="font-light text-[#0f0f14] dark:text-[#e8e6ff]">0</p><p className="text-[#9CA3AF]">Conexões</p></div>
                <div><p className="font-light text-[#0f0f14] dark:text-[#e8e6ff]">0</p><p className="text-[#9CA3AF]">Seguidores</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#7C3AED]" />
                <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Sugestões para você</p>
              </div>
              <p className="mt-0.5 text-[12px] text-[#9CA3AF]">Com base em interesses e objetivos em comum.</p>
            </div>
            <ul className="space-y-4">
              {suggestions.map(u => (
                <li key={u.id} className="flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{u.name}</p>
                    <p className="truncate text-[11px] text-[#9CA3AF]">{u.headline}</p>
                  </div>
                  <button
                    onClick={() => { setSuggestions(prev => prev.filter(s => s.id !== u.id)); addNotif(`Você se conectou com ${u.name}.`, 'connect'); }}
                    className="shrink-0 rounded-full border border-[#E5E0EB] px-3 py-1 text-[12px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED] dark:border-[#2a2a3d] dark:text-[#9CA3AF]"
                  >
                    Conectar
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-4 dark:border-[#2a2a3d] dark:bg-[#13131f]">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#7C3AED]" />
              <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Acontecendo agora</p>
            </div>
            <ul className="space-y-4">
              {MOCK_EVENTS.map(e => (
                <li key={e.id}>
                  <p className="text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{e.title}</p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    {e.date} · {e.format === 'ONLINE' ? 'Online' : e.format === 'IN_PERSON' ? 'Presencial' : 'Híbrido'} · {e.attendees} confirmados
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

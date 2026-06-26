import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import {
  Image, FileText, BarChart3, Calendar, Video,
  Send, Heart, MessageCircle, Bookmark, Share2, Flag, Trash2,
  TrendingUp, UserPlus, Link2, Repeat2, Users,
} from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

const POST_TYPES = [
  { key: 'INSIGHT', label: 'Insight', icon: Image },
  { key: 'ARTICLE', label: 'Artigo', icon: FileText },
  { key: 'QUESTION', label: 'Pergunta', icon: BarChart3 },
  { key: 'PROJECT', label: 'Projeto', icon: Calendar },
  { key: 'MEDIA', label: 'Mídia', icon: Video },
] as const;

const FEED_TABS = [
  { key: 'FOR_YOU', label: 'Pra você', description: 'Recomendado para você' },
  { key: 'ALL', label: 'Tudo', description: 'Feed global' },
  { key: 'FOLLOWING', label: 'Seguindo', description: 'Pessoas que você segue' },
  { key: 'DISCUSSIONS', label: 'Discussões', description: 'Posts onde você comentou' },
  { key: 'PROJECTS', label: 'Projetos', description: 'Posts marcados como Projeto' },
];

const MOCK_SUGGESTIONS = [
  { id: '1', name: 'Diego de Souza F.', headline: 'Gestão de Projetos de...', avatar: null },
  { id: '2', name: 'Guilherme L.', headline: 'UX Designer · Nubank', avatar: null },
  { id: '3', name: 'Vitor Hugo Pasch.', headline: 'Engenheiro de Software', avatar: null },
  { id: '4', name: 'André Kalil Rosen.', headline: 'Marketing Digital', avatar: null },
];

/* Posts simulados das comunidades inscritas (Mundinho React + Editais, Inovação & Parcerias) */
const now = Date.now();
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
  { id: '1', title: 'Lançamento - Hub Figital de Inovação', date: '2026-06-30', format: 'HYBRID', attendees: 2 },
  { id: '2', title: 'Workshop de Comunicações Via Satélite', date: '2026-07-10', format: 'HYBRID', attendees: 1 },
  { id: '3', title: 'Meetup React Brasil', date: '2026-07-05', format: 'ONLINE', attendees: 48 },
];

type PostType = typeof POST_TYPES[number]['key'];

interface Comment {
  id: string;
  author: string;
  avatar: string | null;
  text: string;
}

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
}

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

function ConfirmDeleteModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E0EB] bg-white p-6 shadow-xl">
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-500" />
        </div>
        <p className="mt-3 text-[15px] font-light text-[#0f0f14]">{message}</p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">Essa ação não pode ser desfeita.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-full border border-[#E5E0EB] px-5 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">Cancelar</button>
          <button onClick={onConfirm} className="rounded-full bg-red-500 px-5 py-2 text-[13px] font-light text-white transition hover:bg-red-600">Apagar</button>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, isOwn, onDelete, onUserCommented }: {
  post: LocalPost; isOwn: boolean; onDelete: () => void; onUserCommented: () => void;
}) {
  const { user } = useAuth();
  const { add: addNotif } = useNotifications();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
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
    onUserCommented();
  };

  const confirmMessage = pendingDelete === 'post' ? 'Tem certeza que deseja apagar essa publicação?' : 'Tem certeza que deseja apagar esse comentário?';

  const handleConfirm = () => {
    if (pendingDelete === 'post') onDelete();
    else if (pendingDelete) setComments(prev => prev.filter(c => c.id !== pendingDelete));
    setPendingDelete(null);
  };

  return (
    <>
      {pendingDelete && <ConfirmDeleteModal message={confirmMessage} onConfirm={handleConfirm} onCancel={() => setPendingDelete(null)} />}
      <article className="rounded-2xl border border-[#E5E0EB] bg-white p-5">
        <div className="flex items-start gap-3">
          <Avatar src={post.authorAvatar} name={post.authorName} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[14px] font-light text-[#0f0f14]">{post.authorName}</span>
              <span className="text-[12px] text-[#9CA3AF]">· {timeAgo(post.createdAt)}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280]">
                {TYPE_LABEL[post.type] ?? post.type}
              </span>
              {post.communityName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE8F5] px-2 py-0.5 text-[11px] text-[#7C3AED]">
                  <Users className="h-2.5 w-2.5" />
                  {post.communityName}
                </span>
              )}
            </div>
          </div>
          {isOwn && (
            <button onClick={() => setPendingDelete('post')} className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-3 text-[15px] font-light leading-relaxed text-[#0f0f14] whitespace-pre-wrap">{post.content}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF]">
          <button onClick={() => setLiked(p => !p)} className={`flex items-center gap-1.5 transition ${liked ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'}`}>
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
              <div className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-[#E5E0EB] bg-white shadow-xl">
                <button onClick={handleCopyLink} className="flex w-full items-center gap-2.5 bg-white px-4 py-3 text-left text-[13px] font-light text-[#0f0f14] transition hover:bg-[#F5F3FF]">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
                  {linkCopied ? '✓ Link copiado!' : 'Copiar link da publicação'}
                </button>
                <button onClick={handleRepost} className="flex w-full items-center gap-2.5 border-t border-[#F5F3FF] bg-white px-4 py-3 text-left text-[13px] font-light text-[#0f0f14] transition hover:bg-[#F5F3FF]">
                  <Repeat2 className="h-3.5 w-3.5 shrink-0 text-[#7C3AED]" />
                  Repostar no feed
                </button>
              </div>
            )}
          </div>
          <button className="ml-auto flex items-center gap-1.5 transition hover:text-red-400">
            <Flag className="h-4 w-4" />
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-[#F5F3FF] pt-4">
            {comments.length === 0 && <p className="text-[13px] font-light text-[#9CA3AF]">Nenhum comentário ainda. Seja o primeiro!</p>}
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar src={c.avatar} name={c.author} size="sm" />
                <div className="min-w-0 flex-1 rounded-xl bg-[#F9F8FF] px-3 py-2">
                  <p className="text-[12px] font-medium text-[#0f0f14]">{c.author}</p>
                  <p className="mt-0.5 text-[13px] font-light text-[#0f0f14]">{c.text}</p>
                </div>
                {c.author === (user?.name ?? 'Você') && (
                  <button onClick={() => setPendingDelete(c.id)} className="mt-1 shrink-0 rounded-lg p-1 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            <form onSubmit={submitReply} className="flex items-center gap-2.5">
              <Avatar src={user?.avatar ?? null} name={user?.name ?? 'Você'} size="sm" />
              <div className="flex flex-1 items-center gap-2 rounded-full border border-[#E5E0EB] bg-[#F9F8FF] pl-4 pr-1.5 py-1.5">
                <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Escreva um comentário..." className="flex-1 bg-transparent text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none" />
                <button type="submit" disabled={!reply.trim()} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9] disabled:opacity-40">
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
  const [tab, setTab] = useState('FOR_YOU');
  const [posts, setPosts] = useState<LocalPost[]>(MOCK_COMMUNITY_POSTS);
  const [draft, setDraft] = useState('');
  const [postType, setPostType] = useState<PostType>('INSIGHT');
  const [publishing, setPublishing] = useState(false);
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const [commentedPostIds, setCommentedPostIds] = useState<Set<string>>(new Set());

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
    };
    setPosts(prev => [newPost, ...prev]);
    setDraft('');
    setPublishing(false);
    addNotif('Sua publicação foi compartilhada com a rede.', 'post');
  };

  const handleDelete = (id: string) => setPosts(prev => prev.filter(p => p.id !== id));

  const visiblePosts = useMemo(() => {
    switch (tab) {
      case 'PROJECTS': return posts.filter(p => p.type === 'PROJECT');
      case 'DISCUSSIONS': return posts.filter(p => commentedPostIds.has(p.id));
      case 'FOLLOWING': return [];
      default: return posts;
    }
  }, [tab, posts, commentedPostIds]);

  const currentTabMeta = FEED_TABS.find(t => t.key === tab);

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {/* Composer */}
          <form onSubmit={handlePublish} className="rounded-2xl border border-[#E5E0EB] bg-white p-5">
            <div className="flex items-start gap-3">
              <Avatar src={user?.avatar} name={user?.name ?? 'Você'} />
              <textarea
                value={draft} onChange={e => setDraft(e.target.value)}
                placeholder="Compartilhe algo que aprendeu hoje..."
                rows={2} maxLength={600}
                className="flex-1 resize-none rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-3 py-2.5 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED]"
              />
            </div>

            {/* Tipo de post */}
            <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#F5F3FF] pt-3">
              {POST_TYPES.map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setPostType(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition ${postType === key ? 'bg-[#EDE8F5] text-[#7C3AED]' : 'text-[#9CA3AF] hover:bg-[#F5F3FF] hover:text-[#6B7280]'}`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
              <button type="submit" disabled={!draft.trim() || publishing}
                className="ml-auto flex items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-1.5 text-[13px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40">
                <Send className="h-3.5 w-3.5" /> Publicar
              </button>
            </div>

          </form>

          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-[#E5E0EB] bg-white p-1">
            {FEED_TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-light transition ${tab === key ? 'bg-[#7C3AED] text-white' : 'text-[#6B7280] hover:text-[#0f0f14]'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {visiblePosts.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-14 text-center">
                <p className="text-[15px] font-light text-[#0f0f14]">
                  {tab === 'FOLLOWING' ? 'Nenhuma publicação de pessoas que você segue' :
                   tab === 'DISCUSSIONS' ? 'Você ainda não comentou em nenhuma publicação' :
                   tab === 'PROJECTS' ? 'Nenhum projeto publicado ainda' :
                   'Sem publicações ainda'}
                </p>
                <p className="mt-1 text-[13px] font-light text-[#9CA3AF]">
                  {tab === 'FOLLOWING' ? 'Conecte-se com pessoas para ver publicações aqui.' :
                   tab === 'DISCUSSIONS' ? 'Interaja com posts para vê-los aqui.' :
                   tab === 'PROJECTS' ? 'Publique algo com o tipo "Projeto".' :
                   'Seja o primeiro a compartilhar algo com a rede.'}
                </p>
                {currentTabMeta && (
                  <p className="mt-2 text-[11px] text-[#C4B5FD]">{currentTabMeta.description}</p>
                )}
              </div>
            ) : (
              visiblePosts.map(p => (
                <PostCard
                  key={p.id} post={p}
                  isOwn={p.authorName === user?.name}
                  onDelete={() => handleDelete(p.id)}
                  onUserCommented={() => setCommentedPostIds(prev => new Set([...prev, p.id]))}
                />
              ))
            )}
          </div>
        </div>

        {/* Rail direita */}
        <aside className="hidden space-y-4 lg:block">
          <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white">
            <div className="h-14" style={{ background: 'linear-gradient(135deg, #3B1E7A 0%, #7C3AED 55%, #A78BFA 100%)' }} />
            <div className="-mt-7 px-4 pb-4 text-center">
              <Avatar src={user?.avatar ?? null} name={user?.name ?? 'Você'} size="lg" />
              <p className="mt-2 text-[14px] font-light text-[#0f0f14]">{user?.name}</p>
              <p className="text-[12px] text-[#9CA3AF]">{user?.headline ?? 'Conexão'}</p>
              <div className="mt-3 grid grid-cols-2 gap-1 border-t border-[#F5F3FF] pt-3 text-center text-[12px]">
                <div><p className="font-light text-[#0f0f14]">0</p><p className="text-[#9CA3AF]">Conexões</p></div>
                <div><p className="font-light text-[#0f0f14]">0</p><p className="text-[#9CA3AF]">Seguidores</p></div>
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
                  <p className="text-[13px] font-light text-[#0f0f14]">{e.title}</p>
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

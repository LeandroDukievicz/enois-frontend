import { useState, useEffect } from 'react';
import { Bookmark, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';

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

function readSavedPosts(): SavedPost[] {
  try {
    return JSON.parse(localStorage.getItem('saved_posts_data') ?? '[]');
  } catch {
    return [];
  }
}

export function SalvosPage() {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPosts(readSavedPosts());
    setLoading(false);
  }, []);

  const handleUnsave = (id: string) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('saved_posts_data', JSON.stringify(updated));
  };

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-[24px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Salvos</h1>
          <p className="text-[14px] text-[#6B7280]">Publicações que você guardou para ver depois.</p>
        </div>

        {loading ? (
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
                        {TYPE_LABEL[post.type] ?? post.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsave(post.id)}
                    aria-label="Remover dos salvos"
                    className="shrink-0 rounded-lg p-1.5 text-[#9CA3AF] transition hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="mt-3 text-[15px] font-light leading-relaxed text-[#0f0f14] whitespace-pre-wrap dark:text-[#e8e6ff]">
                  {post.content}
                </p>

                <div className="mt-4 flex items-center gap-5 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF] dark:border-[#1e1e2e]">
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{post.reactions}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{post.comments}</span>
                  <span className="flex items-center gap-1.5 text-[#7C3AED]">
                    <Bookmark className="h-4 w-4 fill-[#7C3AED]" />Salvo
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

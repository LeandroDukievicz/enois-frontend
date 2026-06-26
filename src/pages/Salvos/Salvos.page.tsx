import { useState, useEffect } from 'react';
import { Bookmark, Heart, MessageCircle } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { feedApi, type PostView } from '../../lib/api/feed';

const TYPE_LABEL: Record<string, string> = {
  INSIGHT: 'Insight', ARTICLE: 'Artigo', QUESTION: 'Pergunta',
  PROJECT: 'Projeto', OPPORTUNITY: 'Oportunidade',
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

export function SalvosPage() {
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedApi.listSaved().then(r => setPosts(r.items)).finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-[24px] font-light text-[#0f0f14]">Salvos</h1>
          <p className="text-[14px] text-[#6B7280]">Publicações que você guardou para ver depois.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl border border-[#E5E0EB] bg-white animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E0EB] bg-white p-10 text-center">
            <Bookmark className="mx-auto h-8 w-8 text-[#9CA3AF]" />
            <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma publicação salva ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <article key={post.id} className="rounded-2xl border border-[#E5E0EB] bg-white p-5">
                <div className="flex items-start gap-3">
                  <Avatar src={post.authorAvatar} name={post.authorName} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-[14px] font-light text-[#0f0f14]">{post.authorName}</span>
                      <span className="text-[12px] text-[#9CA3AF]">· {timeAgo(post.createdAt)}</span>
                    </div>
                    <span className="mt-0.5 inline-block rounded-full border border-[#E5E0EB] px-2 py-0.5 text-[11px] text-[#6B7280]">
                      {TYPE_LABEL[post.type] ?? post.type}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[15px] font-light leading-relaxed text-[#0f0f14] whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="mt-4 flex items-center gap-5 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{post.counters.reactions}</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{post.counters.comments}</span>
                  <span className="flex items-center gap-1.5 text-[#7C3AED]"><Bookmark className="h-4 w-4 fill-[#7C3AED]" />Salvo</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

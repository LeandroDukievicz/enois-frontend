import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Calendar, Users, MapPin, Monitor, ArrowLeft, Send, Heart, MessageCircle, ChevronRight } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { useAuth } from '../../contexts/AuthContext';

type EventFormat = 'ONLINE' | 'IN_PERSON' | 'HYBRID';

interface MockEvent {
  id: string;
  title: string;
  host: string;
  date: string;
  time: string;
  format: EventFormat;
  description: string;
  attendees: number;
  gradient: string;
}

const MOCK_EVENTS: MockEvent[] = [
  {
    id: '1', title: 'Lançamento — Hub Figital de Inovação', host: 'Hub Figital', date: '2026-06-30', time: '19:00',
    format: 'HYBRID', attendees: 2,
    description: 'Apresentação oficial do Hub Figital, espaço de colaboração entre startups, empresas e universidades voltado para inovação aberta.',
    gradient: 'linear-gradient(135deg, #2e1065 0%, #7C3AED 100%)',
  },
  {
    id: '2', title: 'Workshop de Comunicações Via Satélite, LEO, NTN e 5G/6G', host: 'IEEE Brasil', date: '2026-07-10', time: '14:00',
    format: 'HYBRID', attendees: 1,
    description: 'Workshop técnico sobre as tecnologias de comunicação de nova geração: satélites LEO, redes NTN e o roadmap de 5G/6G no Brasil.',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
  },
  {
    id: '3', title: 'Meetup React Brasil — Julho 2026', host: 'React Brasil', date: '2026-07-05', time: '10:00',
    format: 'ONLINE', attendees: 48,
    description: 'Encontro mensal da comunidade React no Brasil. Palestras sobre React 19, Server Components e performance de aplicações frontend.',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
  },
  {
    id: '4', title: 'Design Systems Summit 2026', host: 'UX Brasil', date: '2026-07-18', time: '09:00',
    format: 'IN_PERSON', attendees: 120,
    description: 'Conferência nacional sobre Design Systems, tokens de design e como escalar componentes em grandes times de produto.',
    gradient: 'linear-gradient(135deg, #0f4c5c 0%, #0D9488 100%)',
  },
];

const FORMAT_ICON: Record<EventFormat, React.ElementType> = {
  ONLINE: Monitor, IN_PERSON: MapPin, HYBRID: Users,
};

const FORMAT_LABEL: Record<EventFormat, string> = {
  ONLINE: 'Online', IN_PERSON: 'Presencial', HYBRID: 'Híbrido',
};

/* ── Feed do evento ──────────────────────────── */
interface EventPost { id: string; authorName: string; authorAvatar: string | null; text: string; createdAt: string; likes: number; liked: boolean; }

function EventFeed({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<EventPost[]>([
    { id: 'seed-1', authorName: 'Organização ' + MOCK_EVENTS.find(e => e.id === eventId)?.host, authorAvatar: null, text: 'Bem-vindos ao feed do evento! Compartilhem dúvidas, insights e conexões aqui 🎉', createdAt: new Date(Date.now() - 3600000).toISOString(), likes: 3, liked: false },
  ]);
  const [draft, setDraft] = useState('');

  const timeAgo = (iso: string) => {
    const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 1) return 'agora'; if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosts(prev => [{
      id: String(Date.now()), authorName: user?.name ?? 'Você', authorAvatar: user?.avatar ?? null,
      text: draft.trim(), createdAt: new Date().toISOString(), likes: 0, liked: false,
    }, ...prev]);
    setDraft('');
  };

  const toggleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E5E0EB] bg-white p-4">
        <div className="flex items-start gap-3">
          <Avatar src={user?.avatar ?? null} name={user?.name ?? 'Você'} />
          <textarea
            value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Compartilhe algo sobre o evento..."
            rows={2} maxLength={400}
            className="flex-1 resize-none rounded-xl border border-[#E5E0EB] bg-[#F9F8FF] px-3 py-2.5 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED]"
          />
        </div>
        <div className="mt-3 flex justify-end border-t border-[#F5F3FF] pt-3">
          <button type="submit" disabled={!draft.trim()} className="flex items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-1.5 text-[13px] font-light text-white transition hover:bg-[#6D28D9] disabled:opacity-40">
            <Send className="h-3.5 w-3.5" /> Publicar
          </button>
        </div>
      </form>

      {posts.map(p => (
        <article key={p.id} className="rounded-2xl border border-[#E5E0EB] bg-white p-5">
          <div className="flex items-center gap-3">
            <Avatar src={p.authorAvatar} name={p.authorName} />
            <div>
              <p className="text-[14px] font-light text-[#0f0f14]">{p.authorName}</p>
              <p className="text-[11px] text-[#9CA3AF]">{timeAgo(p.createdAt)}</p>
            </div>
          </div>
          <p className="mt-3 text-[14px] font-light leading-relaxed text-[#0f0f14] whitespace-pre-wrap">{p.text}</p>
          <div className="mt-3 flex items-center gap-4 border-t border-[#F5F3FF] pt-3 text-[13px] text-[#9CA3AF]">
            <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 transition ${p.liked ? 'text-[#7C3AED]' : 'hover:text-[#7C3AED]'}`}>
              <Heart className={`h-4 w-4 ${p.liked ? 'fill-[#7C3AED]' : ''}`} /> {p.likes}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── Chat do grupo do evento ───────────────── */
interface ChatMessage { id: string; from: string; avatar: string | null; text: string; createdAt: Date; mine: boolean; }

function EventChat({ event }: { event: MockEvent }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 's1', from: event.host, avatar: null, text: `Olá! Bem-vindos ao chat oficial do evento "${event.title}". Fiquem à vontade para interagir.`, createdAt: new Date(Date.now() - 7200000), mine: false },
    { id: 's2', from: 'Moderação', avatar: null, text: 'Lembrem-se de manter o respeito e a cordialidade em todas as mensagens. 🙌', createdAt: new Date(Date.now() - 3600000), mine: false },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [{
      id: String(Date.now()), from: user?.name ?? 'Você', avatar: user?.avatar ?? null,
      text: input.trim(), createdAt: new Date(), mine: true,
    }, ...prev.reverse()].reverse());
    setInput('');
  };

  const timeLabel = (d: Date) => {
    const m = Math.floor((Date.now() - d.getTime()) / 60000);
    if (m < 1) return 'agora'; if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60); return h < 24 ? `${h}h` : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="flex h-130 flex-col rounded-2xl border border-[#E5E0EB] bg-white overflow-hidden">
      <div className="border-b border-[#E5E0EB] px-4 py-3">
        <p className="text-[14px] font-light text-[#0f0f14]">Chat do grupo</p>
        <p className="text-[12px] text-[#9CA3AF]">{event.attendees} participantes</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.map(m => (
          <div key={m.id} className={`flex items-end gap-2 ${m.mine ? 'flex-row-reverse' : ''}`}>
            {!m.mine && <Avatar src={m.avatar} name={m.from} size="sm" />}
            <div className={`max-w-[75%] ${m.mine ? '' : ''}`}>
              {!m.mine && <p className="mb-0.5 text-[11px] text-[#9CA3AF]">{m.from}</p>}
              <div className={`rounded-2xl px-3 py-2 ${m.mine ? 'rounded-br-none bg-[#7C3AED] text-white' : 'rounded-bl-none bg-[#F5F3FF] text-[#0f0f14]'}`}>
                <p className="text-[13px] font-light leading-relaxed">{m.text}</p>
              </div>
              <p className={`mt-0.5 text-[10px] text-[#9CA3AF] ${m.mine ? 'text-right' : ''}`}>{timeLabel(m.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-[#E5E0EB] p-3">
        <input
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full border border-[#E5E0EB] bg-[#F9F8FF] px-4 py-2 text-[13px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none focus:border-[#7C3AED]"
        />
        <button onClick={handleSend} className="grid h-9 w-9 place-items-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9]">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Página principal ─────────────────────── */
export function EventosPage() {
  const [selected, setSelected] = useState<MockEvent | null>(null);
  const [tab, setTab] = useState<'feed' | 'chat'>('feed');
  const [attending, setAttending] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<EventFormat | ''>('');

  const shown = filter ? MOCK_EVENTS.filter(e => e.format === filter) : MOCK_EVENTS;

  if (selected) {
    const FormatIcon = FORMAT_ICON[selected.format];
    return (
      <AppShell>
        <div className="space-y-5">
          <button
            onClick={() => { setSelected(null); setTab('feed'); }}
            className="flex items-center gap-2 text-[13px] font-light text-[#6B7280] transition hover:text-[#7C3AED]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para eventos
          </button>

          {/* Event header */}
          <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white">
            <div className="h-32 w-full" style={{ background: selected.gradient }} />
            <div className="p-5">
              <h1 className="text-[20px] font-light text-[#0f0f14]">{selected.title}</h1>
              <p className="mt-1 text-[13px] text-[#6B7280]">Organizado por {selected.host}</p>
              <p className="mt-3 text-[13px] font-light leading-relaxed text-[#6B7280]">{selected.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-[#9CA3AF]">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#7C3AED]" />{new Date(selected.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} · {selected.time}</span>
                <span className="flex items-center gap-1.5"><FormatIcon className="h-4 w-4 text-[#7C3AED]" />{FORMAT_LABEL[selected.format]}</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-[#7C3AED]" />{selected.attendees + (attending.has(selected.id) ? 1 : 0)} confirmados</span>
              </div>
              <button
                onClick={() => setAttending(prev => { const n = new Set(prev); n.has(selected.id) ? n.delete(selected.id) : n.add(selected.id); return n; })}
                className={`mt-4 rounded-full px-6 py-2 text-[13px] font-light transition ${attending.has(selected.id) ? 'bg-[#EDE8F5] text-[#7C3AED]' : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'}`}
              >
                {attending.has(selected.id) ? '✓ Participando' : 'Participar'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-full border border-[#E5E0EB] bg-white p-1">
            {([['feed', 'Feed do evento'], ['chat', 'Chat do grupo']] as const).map(([k, lbl]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex-1 rounded-full py-1.5 text-[13px] font-light transition ${tab === k ? 'bg-[#7C3AED] text-white' : 'text-[#6B7280] hover:text-[#0f0f14]'}`}>
                {lbl}
              </button>
            ))}
          </div>

          {tab === 'feed' ? <EventFeed eventId={selected.id} /> : <EventChat event={selected} />}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-[22px] font-light text-[#0f0f14]">Eventos</h1>
          <p className="text-[13px] text-[#6B7280]">Encontros, workshops e conferências da comunidade.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {([['', 'Todos'], ['ONLINE', 'Online'], ['IN_PERSON', 'Presencial'], ['HYBRID', 'Híbrido']] as const).map(([k, lbl]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-light transition ${filter === k ? 'border-[#7C3AED] bg-[#7C3AED] text-white' : 'border-[#E5E0EB] bg-white text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED]'}`}
            >{lbl}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shown.map(event => {
            const FormatIcon = FORMAT_ICON[event.format];
            return (
              <div key={event.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white transition hover:shadow-sm">
                <div className="h-32 w-full" style={{ background: event.gradient }} />
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[15px] font-light text-[#0f0f14] line-clamp-2">{event.title}</p>
                  <p className="mt-0.5 text-[12px] text-[#9CA3AF]">{event.host}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#9CA3AF]">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} · {event.time}</span>
                    <span className="flex items-center gap-1"><FormatIcon className="h-3.5 w-3.5" />{FORMAT_LABEL[event.format]}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{event.attendees + (attending.has(event.id) ? 1 : 0)} confirmados</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setAttending(prev => { const n = new Set(prev); n.has(event.id) ? n.delete(event.id) : n.add(event.id); return n; })}
                      className={`flex-1 rounded-full py-2 text-[13px] font-light transition ${attending.has(event.id) ? 'bg-[#EDE8F5] text-[#7C3AED]' : 'bg-[#EDE8F5] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white'}`}
                    >
                      {attending.has(event.id) ? '✓ Participando' : 'Participar'}
                    </button>
                    <button onClick={() => setSelected(event)} className="flex items-center gap-1 rounded-full border border-[#E5E0EB] px-3 py-2 text-[13px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">
                      Abrir <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

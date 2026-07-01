import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { messagesApi, type Conversation, type Message } from '../../lib/api/messages';

const MOCK_CONV_KEY = 'mock_conversations';

function loadMockConversations(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(MOCK_CONV_KEY) ?? '[]'); } catch { return []; }
}

function loadMockMessages(convId: string): Message[] {
  try { return JSON.parse(localStorage.getItem(`mock_messages_${convId}`) ?? '[]'); } catch { return []; }
}

function saveMockMessages(convId: string, messages: Message[]) {
  try { localStorage.setItem(`mock_messages_${convId}`, JSON.stringify(messages)); } catch {}
}

function isMockConv(id: string) { return id.startsWith('mentor-'); }

function timeLabel(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function MensagensPage() {
  const [apiConversations, setApiConversations] = useState<Conversation[]>([]);
  const [mockConversations, setMockConversations] = useState<Conversation[]>(loadMockConversations);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = [...mockConversations, ...apiConversations];

  useEffect(() => {
    messagesApi.listConversations()
      .then(r => setApiConversations(r.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Auto-select pending conversation (from Mentoria) */
  useEffect(() => {
    const pendingId = localStorage.getItem('pending_open_conv');
    if (!pendingId) return;
    localStorage.removeItem('pending_open_conv');
    const mock = loadMockConversations();
    const conv = mock.find(c => c.id === pendingId);
    if (conv) {
      setMockConversations(mock);
      setSelected(conv);
    }
  }, []);

  /* Load messages when conversation selected */
  useEffect(() => {
    if (!selected) return;
    if (isMockConv(selected.id)) {
      setMessages(loadMockMessages(selected.id));
    } else {
      messagesApi.listMessages(selected.id)
        .then(r => setMessages(r.items))
        .catch(() => {});
      messagesApi.markAsRead(selected.id).catch(() => {});
    }
  }, [selected]);

  /* Scroll to bottom on new message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selected || !input.trim()) return;
    const text = input.trim();
    setInput('');

    if (isMockConv(selected.id)) {
      const msg: Message = {
        id: `msg-${Date.now()}`,
        from: 'Você',
        text,
        time: new Date().toISOString(),
      };
      const next = [...messages, msg];
      setMessages(next);
      saveMockMessages(selected.id, next);

      setMockConversations(prev => {
        const updated = prev.map(c =>
          c.id === selected.id ? { ...c, lastMessage: text, time: msg.time } : c
        );
        localStorage.setItem(MOCK_CONV_KEY, JSON.stringify(updated));
        return updated;
      });
    } else {
      const msg = await messagesApi.sendMessage(selected.id, text).catch(() => null);
      if (msg) setMessages(prev => [...prev, msg]);
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white dark:border-[#2a2a3d] dark:bg-[#13131f]">
        {/* Conversations list */}
        <div className={`flex w-full flex-col border-r border-[#E5E0EB] dark:border-[#2a2a3d] sm:w-72 ${selected ? 'hidden sm:flex' : ''}`}>
          <div className="border-b border-[#E5E0EB] px-4 py-3 dark:border-[#2a2a3d]">
            <p className="text-[16px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">Mensagens</p>
          </div>
          {loading && mockConversations.length === 0 ? (
            <div className="flex-1 space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F9F8FF] dark:bg-[#1c1c2e]" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <MessageCircle className="h-8 w-8 text-[#9CA3AF]" />
              <p className="text-[13px] font-light text-[#9CA3AF]">Nenhuma conversa ainda.</p>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {conversations.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => setSelected(c)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                      selected?.id === c.id
                        ? 'bg-[#EDE8F5] dark:bg-[#2a1a4e]'
                        : 'hover:bg-[#F9F8FF] dark:hover:bg-[#1c1c2e]'
                    }`}
                  >
                    <Avatar name={c.title ?? 'Conversa'} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="truncate text-[13px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{c.title ?? 'Conversa'}</p>
                        <span className="shrink-0 text-[11px] text-[#9CA3AF]">{timeLabel(c.time)}</span>
                      </div>
                      <p className="truncate text-[12px] text-[#9CA3AF]">{c.lastMessage ?? 'Sem mensagens'}</p>
                    </div>
                    {c.unread > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[10px] text-white">
                        {c.unread}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Message view */}
        {selected ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-[#E5E0EB] px-4 py-3 dark:border-[#2a2a3d]">
              <button onClick={() => setSelected(null)} className="text-[#6B7280] sm:hidden">←</button>
              <Avatar name={selected.title ?? 'Conversa'} size="lg" />
              <p className="text-[14px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{selected.title ?? 'Conversa'}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.from === 'Você' ? 'flex-row-reverse' : ''}`}>
                  {m.from !== 'Você' && <Avatar name={m.from} size="sm" />}
                  <div className={`max-w-xs rounded-2xl px-3 py-2 ${
                    m.from === 'Você'
                      ? 'rounded-tr-none bg-[#7C3AED] text-white'
                      : 'rounded-tl-none bg-[#F5F3FF] dark:bg-[#2a1a4e]'
                  }`}>
                    <p className={`text-[13px] font-light ${m.from === 'Você' ? 'text-white' : 'text-[#0f0f14] dark:text-[#e8e6ff]'}`}>{m.text}</p>
                    <p className={`mt-0.5 text-[10px] ${m.from === 'Você' ? 'text-white/60' : 'text-[#9CA3AF]'}`}>{timeLabel(m.time)}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-[#E5E0EB] p-3 dark:border-[#2a2a3d]">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escreva uma mensagem..."
                className="flex-1 rounded-full border border-[#E5E0EB] bg-white px-4 py-2 text-[14px] font-light outline-none focus:border-[#7C3AED] dark:border-[#2a2a3d] dark:bg-[#1c1c2e] dark:text-[#e8e6ff]"
              />
              <button
                onClick={handleSend}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#7C3AED] text-white transition hover:bg-[#6D28D9]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden flex-1 flex-col items-center justify-center gap-3 text-center sm:flex">
            <MessageCircle className="h-10 w-10 text-[#9CA3AF]" />
            <p className="text-[15px] font-light text-[#6B7280] dark:text-[#9CA3AF]">Selecione uma conversa</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

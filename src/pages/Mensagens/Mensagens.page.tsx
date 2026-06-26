import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { messagesApi, type Conversation, type Message } from '../../lib/api/messages';

function timeLabel(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function MensagensPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesApi.listConversations()
      .then(r => setConversations(r.items))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    messagesApi.listMessages(selected.id).then(r => setMessages(r.items));
    messagesApi.markAsRead(selected.id).catch(() => {});
  }, [selected]);

  const handleSend = async () => {
    if (!selected || !input.trim()) return;
    const msg = await messagesApi.sendMessage(selected.id, input.trim()).catch(() => null);
    if (msg) {
      setMessages(prev => [...prev, msg]);
      setInput('');
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white">
        {/* Conversations list */}
        <div className={`flex w-full flex-col border-r border-[#E5E0EB] sm:w-72 ${selected ? 'hidden sm:flex' : ''}`}>
          <div className="border-b border-[#E5E0EB] px-4 py-3">
            <p className="text-[16px] font-light text-[#0f0f14]">Mensagens</p>
          </div>
          {loading ? (
            <div className="flex-1 space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-[#F9F8FF] animate-pulse" />
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
                      selected?.id === c.id ? 'bg-[#EDE8F5]' : 'hover:bg-[#F9F8FF]'
                    }`}
                  >
                    <Avatar name={c.title ?? 'Conversa'} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="truncate text-[13px] font-light text-[#0f0f14]">{c.title ?? 'Conversa'}</p>
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
            <div className="flex items-center gap-3 border-b border-[#E5E0EB] px-4 py-3">
              <button onClick={() => setSelected(null)} className="sm:hidden text-[#6B7280]">←</button>
              <Avatar name={selected.title ?? 'Conversa'} size="lg" />
              <p className="text-[14px] font-light text-[#0f0f14]">{selected.title ?? 'Conversa'}</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {messages.map(m => (
                <div key={m.id} className="flex gap-2">
                  <Avatar name={m.from} size="sm" />
                  <div className="max-w-xs rounded-2xl rounded-tl-none bg-[#F5F3FF] px-3 py-2">
                    <p className="text-[13px] font-light text-[#0f0f14]">{m.text}</p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{timeLabel(m.time)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-[#E5E0EB] p-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escreva uma mensagem..."
                className="flex-1 rounded-full border border-[#E5E0EB] px-4 py-2 text-[14px] font-light outline-none focus:border-[#7C3AED]"
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
            <p className="text-[15px] font-light text-[#6B7280]">Selecione uma conversa</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

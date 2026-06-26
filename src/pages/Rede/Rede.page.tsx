import { useState } from 'react';
import { UserPlus, UserCheck, Bell, Users } from 'lucide-react';
import { AppShell, Avatar } from '../../components/AppShell';
import { useNotifications } from '../../contexts/NotificationsContext';

type FilterTab = 'conexoes' | 'seguindo' | 'solicitacoes' | 'sugestoes';

type Person = { id: string; name: string; headline: string; avatar: null; mutual: number };

const MOCK_SUGGESTIONS: Person[] = [
  { id: '1', name: 'Diego de Souza Faria', headline: 'Gestão de Projetos de TI', avatar: null, mutual: 3 },
  { id: '2', name: 'Guilherme L.', headline: 'UX Designer · Nubank', avatar: null, mutual: 1 },
  { id: '3', name: 'Vitor Hugo Paschen', headline: 'Engenheiro de Software', avatar: null, mutual: 5 },
  { id: '4', name: 'André Kalil Rosenberg', headline: 'Marketing Digital', avatar: null, mutual: 2 },
  { id: '5', name: 'Camila Souza', headline: 'Product Manager · iFood', avatar: null, mutual: 4 },
  { id: '6', name: 'Rafael Mendes', headline: 'Data Scientist · Itaú', avatar: null, mutual: 0 },
];

const MOCK_REQUESTS: Person[] = [
  { id: 'r1', name: 'João Silva', headline: 'Engenheiro de Software · Google', avatar: null, mutual: 3 },
  { id: 'r2', name: 'Maria Santos', headline: 'Product Designer · Figma', avatar: null, mutual: 1 },
];

/* ── Cartão de estatística/tab ──────────────── */
function StatTab({
  label, count, icon: Icon, active, pending, onClick,
}: {
  label: string; count: number; icon: React.ElementType;
  active: boolean; pending?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col rounded-2xl border p-4 text-left transition ${
        active
          ? 'border-[#7C3AED] bg-[#EDE8F5]'
          : 'border-[#E5E0EB] bg-white hover:border-[#C4B5FD] hover:bg-[#faf8ff]'
      }`}
    >
      {/* Badge de pendentes (solicitações) */}
      {!!pending && (
        <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
          {pending}
        </span>
      )}

      <div className="flex items-end justify-between gap-2">
        <span className={`text-[28px] font-light leading-none ${active ? 'text-[#7C3AED]' : 'text-[#0f0f14]'}`}>
          {count}
        </span>
        <span className={`mb-0.5 flex h-8 w-8 items-center justify-center rounded-full ${active ? 'bg-[#DDD2FF]' : 'bg-[#F5F3FF]'}`}>
          <Icon className={`h-4 w-4 ${active ? 'text-[#7C3AED]' : 'text-[#9CA3AF]'}`} />
        </span>
      </div>
      <span className={`mt-2 text-[13px] font-light ${active ? 'text-[#7C3AED]' : 'text-[#6B7280]'}`}>
        {label}
      </span>
    </button>
  );
}

/* ── Card de pessoa ─────────────────────────── */
function PersonCard({ person, actions }: {
  person: Person;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E5E0EB] bg-white p-4 transition hover:border-[#C4B5FD]">
      <Avatar src={person.avatar} name={person.name} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-light text-[#0f0f14]">{person.name}</p>
        <p className="truncate text-[12px] text-[#9CA3AF]">{person.headline}</p>
        {person.mutual > 0 && (
          <p className="text-[11px] text-[#A78BFA]">{person.mutual} conexão em comum</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1.5">{actions}</div>
    </div>
  );
}

export function RedePage() {
  const { add: addNotif } = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>('sugestoes');
  const [suggestions, setSuggestions] = useState(MOCK_SUGGESTIONS);
  const [connections, setConnections] = useState<Person[]>([]);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [following, setFollowing] = useState<Person[]>([]);

  const handleConnect = (id: string) => {
    const person = suggestions.find(u => u.id === id);
    if (!person) return;
    setConnections(prev => [...prev, person]);
    setSuggestions(prev => prev.filter(u => u.id !== id));
    addNotif(`Você se conectou com ${person.name}.`, 'connect');
  };

  const handleFollow = (id: string) => {
    const person = suggestions.find(u => u.id === id);
    if (!person) return;
    setFollowing(prev => [...prev, person]);
    setSuggestions(prev => prev.filter(u => u.id !== id));
  };

  const handleAccept = (id: string) => {
    const person = requests.find(u => u.id === id);
    if (!person) return;
    setConnections(prev => [...prev, person]);
    setRequests(prev => prev.filter(u => u.id !== id));
    addNotif(`Você aceitou a solicitação de ${person.name}.`, 'connect');
  };

  const handleDecline = (id: string) => setRequests(prev => prev.filter(u => u.id !== id));

  const handleRemove = (id: string) => {
    const person = connections.find(u => u.id === id);
    if (!person) return;
    setSuggestions(prev => [...prev, person]);
    setConnections(prev => prev.filter(u => u.id !== id));
  };

  const btnPrimary = 'rounded-full bg-[#7C3AED] px-3 py-1.5 text-[12px] font-light text-white transition hover:bg-[#6D28D9]';
  const btnDanger = 'rounded-full border border-[#E5E0EB] px-3 py-1.5 text-[12px] font-light text-[#6B7280] transition hover:border-red-300 hover:text-red-500';

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white">
          <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg, #3B1E7A 0%, #7C3AED 55%, #A78BFA 100%)' }} />
          <div className="p-5">
            <h1 className="text-[22px] font-light text-[#0f0f14]">Sua rede</h1>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTab label="Conexões" count={connections.length} icon={Users} active={activeTab === 'conexoes'} onClick={() => setActiveTab('conexoes')} />
              <StatTab label="Seguindo" count={following.length} icon={UserCheck} active={activeTab === 'seguindo'} onClick={() => setActiveTab('seguindo')} />
              <StatTab label="Solicitações" count={requests.length} icon={Bell} active={activeTab === 'solicitacoes'} pending={requests.length || undefined} onClick={() => setActiveTab('solicitacoes')} />
              <StatTab label="Sugestões" count={suggestions.length} icon={UserPlus} active={activeTab === 'sugestoes'} onClick={() => setActiveTab('sugestoes')} />
            </div>
          </div>
        </div>

        {/* ── Sugestões (com solicitações acima se houver) ── */}
        {activeTab === 'sugestoes' && (
          <section className="space-y-5">
            {/* Solicitações pendentes em destaque */}
            {requests.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-500" />
                  <h2 className="text-[16px] font-light text-[#0f0f14]">
                    Solicitações pendentes
                    <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white">{requests.length}</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {requests.map(u => (
                    <PersonCard key={u.id} person={u} actions={
                      <>
                        <button onClick={() => handleDecline(u.id)} className={btnDanger}>Recusar</button>
                        <button onClick={() => handleAccept(u.id)} className={btnPrimary}>Aceitar</button>
                      </>
                    } />
                  ))}
                </div>
              </div>
            )}

            {/* Sugestões */}
            <div className="space-y-3">
              <div>
                <h2 className="text-[16px] font-light text-[#0f0f14]">Pessoas que combinam com você</h2>
                <p className="text-[13px] font-light text-[#6B7280]">Baseado em habilidades, objetivos e comunidades em comum.</p>
              </div>
              {suggestions.length === 0 ? (
                <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-12 text-center">
                  <UserPlus className="mx-auto h-8 w-8 text-[#9CA3AF]" />
                  <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma sugestão no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {suggestions.map(u => (
                    <div key={u.id} className="flex flex-col items-center rounded-2xl border border-[#E5E0EB] bg-white p-4 text-center transition hover:border-[#C4B5FD] hover:shadow-sm">
                      <Avatar src={u.avatar} name={u.name} size="lg" />
                      <p className="mt-2 line-clamp-1 text-[13px] font-light text-[#0f0f14]">{u.name}</p>
                      <p className="min-h-8 line-clamp-2 text-[11px] text-[#9CA3AF]">{u.headline}</p>
                      {u.mutual > 0 && <p className="mt-0.5 text-[10px] text-[#A78BFA]">{u.mutual} em comum</p>}
                      <div className="mt-3 flex w-full gap-1.5">
                        <button onClick={() => handleFollow(u.id)} className="flex-1 rounded-full border border-[#E5E0EB] py-1.5 text-[11px] font-light text-[#6B7280] transition hover:border-[#7C3AED] hover:text-[#7C3AED]">Seguir</button>
                        <button onClick={() => handleConnect(u.id)} className="flex-1 rounded-full bg-[#7C3AED] py-1.5 text-[11px] font-light text-white transition hover:bg-[#6D28D9]">Conectar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Solicitações (aba dedicada) ── */}
        {activeTab === 'solicitacoes' && (
          <section className="space-y-3">
            <h2 className="text-[16px] font-light text-[#0f0f14]">Solicitações de conexão</h2>
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-[#9CA3AF]" />
                <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Nenhuma solicitação pendente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {requests.map(u => (
                  <PersonCard key={u.id} person={u} actions={
                    <>
                      <button onClick={() => handleDecline(u.id)} className={btnDanger}>Recusar</button>
                      <button onClick={() => handleAccept(u.id)} className={btnPrimary}>Aceitar</button>
                    </>
                  } />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Conexões ── */}
        {activeTab === 'conexoes' && (
          <section className="space-y-3">
            <h2 className="text-[16px] font-light text-[#0f0f14]">Suas conexões ({connections.length})</h2>
            {connections.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-12 text-center">
                <Users className="mx-auto h-8 w-8 text-[#9CA3AF]" />
                <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Você ainda não tem conexões.</p>
                <button onClick={() => setActiveTab('sugestoes')} className="mt-2 text-[13px] text-[#7C3AED] hover:underline">Ver sugestões</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {connections.map(u => (
                  <PersonCard key={u.id} person={u} actions={
                    <button onClick={() => handleRemove(u.id)} className={btnDanger}>Remover</button>
                  } />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Seguindo ── */}
        {activeTab === 'seguindo' && (
          <section className="space-y-3">
            <h2 className="text-[16px] font-light text-[#0f0f14]">Quem você segue ({following.length})</h2>
            {following.length === 0 ? (
              <div className="rounded-2xl border border-[#E5E0EB] bg-white px-6 py-12 text-center">
                <UserCheck className="mx-auto h-8 w-8 text-[#9CA3AF]" />
                <p className="mt-3 text-[14px] font-light text-[#9CA3AF]">Você ainda não segue ninguém.</p>
                <button onClick={() => setActiveTab('sugestoes')} className="mt-2 text-[13px] text-[#7C3AED] hover:underline">Descobrir pessoas</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {following.map(u => (
                  <PersonCard key={u.id} person={u} actions={
                    <button onClick={() => setFollowing(prev => prev.filter(f => f.id !== u.id))} className={btnDanger}>
                      Deixar de seguir
                    </button>
                  } />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}

import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useConfirm } from '../../contexts/ConfirmContext';

type Category = 'Todas' | 'Tecnologia' | 'Engenharia' | 'Design' | 'Produto' | 'Liderança' | 'Carreira' | 'Freelance';

const CATEGORIES: Category[] = ['Todas', 'Tecnologia', 'Engenharia', 'Design', 'Produto', 'Liderança', 'Carreira', 'Freelance'];

const CATEGORY_COLOR: Record<string, string> = {
  Tecnologia: 'text-[#7C3AED]',
  Engenharia: 'text-[#2563EB]',
  Design: 'text-[#0D9488]',
  Produto: 'text-[#059669]',
  Liderança: 'text-[#E11D48]',
  Carreira: 'text-[#D97706]',
  Freelance: 'text-[#4F46E5]',
};

const COVER_GRADIENT: Record<string, string> = {
  Tecnologia: 'linear-gradient(135deg, #2e1065 0%, #7C3AED 100%)',
  Engenharia: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
  Design: 'linear-gradient(135deg, #0f4c5c 0%, #0D9488 100%)',
  Produto: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
  Liderança: 'linear-gradient(135deg, #7f1d1d 0%, #E11D48 100%)',
  Carreira: 'linear-gradient(135deg, #78350f 0%, #D97706 100%)',
  Freelance: 'linear-gradient(135deg, #312e81 0%, #4F46E5 100%)',
};

interface Community {
  id: string;
  category: Exclude<Category, 'Todas'>;
  icon: string;
  name: string;
  description: string;
  members: number;
  joined: boolean;
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: '2', category: 'Tecnologia', icon: '📣',
    name: 'Editais, Inovação & Parcerias',
    description: 'Comunidade dedicada ao compartilhamento de oportunidades de inovação e parcerias estratégicas.',
    members: 8, joined: true,
  },
  {
    id: '3', category: 'Tecnologia', icon: '⚛️',
    name: 'Mundinho React',
    description: 'Comunidade sobre React',
    members: 6, joined: true,
  },
  {
    id: '4', category: 'Carreira', icon: '🏛️',
    name: 'Finjo que sei até saber',
    description: 'Comunidade pra aqueles que têm a síndrome do impostor mas seguem em frente mesmo assim.',
    members: 14, joined: false,
  },
  {
    id: '5', category: 'Design', icon: '🎨',
    name: 'Design Digital',
    description: 'Compartilhar ideias, temas, ajudar com dúvidas e aprender juntos sobre design.',
    members: 31, joined: false,
  },
  {
    id: '6', category: 'Tecnologia', icon: '🗄️',
    name: 'Bancos de Dados',
    description: 'Comunidade para bancos de dados em geral — SQL, NoSQL, modelagem e performance.',
    members: 19, joined: false,
  },
  {
    id: '7', category: 'Engenharia', icon: '🔧',
    name: 'Engenharia de Software BR',
    description: 'Discussões sobre arquitetura, boas práticas e carreira em engenharia de software.',
    members: 52, joined: false,
  },
  {
    id: '8', category: 'Produto', icon: '📦',
    name: 'Product Managers Brasil',
    description: 'Tudo sobre gestão de produto — discovery, métricas, roadmap e cultura de produto.',
    members: 27, joined: false,
  },
  {
    id: '9', category: 'Freelance', icon: '💼',
    name: 'Freelancers Tech',
    description: 'Para profissionais autônomos de tecnologia: contratos, precificação e clientes.',
    members: 11, joined: false,
  },
];

const simulateApi = (ms = 600) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function ComunidadesPage() {
  const { add: addNotif } = useNotifications();
  const { confirm } = useConfirm();

  const [activeCategory, setActiveCategory] = useState<Category>('Tecnologia');
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);

  const filtered = activeCategory === 'Todas'
    ? communities
    : communities.filter(c => c.category === activeCategory);

  const handleJoin = (community: Community) => {
    setCommunities(prev =>
      prev.map(c => c.id === community.id ? { ...c, joined: true, members: c.members + 1 } : c),
    );
    simulateApi(400).then(() => {
      addNotif(`Você entrou na comunidade "${community.name}".`, 'community');
    });
  };

  const handleLeave = (community: Community) => {
    confirm({
      title: 'Sair da comunidade',
      message: `Tem certeza que quer cancelar a subscrição de "${community.name}"?`,
      confirmLabel: 'Sair',
      variant: 'danger',
      onConfirm: async () => {
        await simulateApi(600);
        setCommunities(prev =>
          prev.map(c => c.id === community.id ? { ...c, joined: false, members: c.members - 1 } : c),
        );
        addNotif(`Você saiu da comunidade "${community.name}".`, 'community');
      },
    });
  };

  const handleToggle = (id: string) => {
    const community = communities.find(c => c.id === id);
    if (!community) return;
    if (community.joined) {
      handleLeave(community);
    } else {
      handleJoin(community);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-light text-[#0f0f14]">Comunidades</h1>
            <p className="mt-0.5 text-[14px] font-light text-[#6B7280]">
              Encontre grupos profissionais, fóruns temáticos e círculos de mentoria.
            </p>
          </div>
          <button className="flex shrink-0 items-center gap-2 rounded-full bg-[#7C3AED] px-4 py-2 text-[14px] font-light text-white transition hover:bg-[#6D28D9]">
            <Plus className="h-4 w-4" />
            Criar comunidade
          </button>
        </div>

        {/* Filtros de categoria */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-[13px] font-light transition ${
                activeCategory === cat
                  ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                  : 'border-[#E5E0EB] bg-white text-[#6B7280] hover:border-[#7C3AED] hover:text-[#7C3AED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de comunidades */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <div key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E0EB] bg-white transition hover:shadow-sm">
              {/* Capa */}
              <div
                className="flex h-28 w-full items-center justify-center text-4xl"
                style={{ background: COVER_GRADIENT[c.category] }}
              >
                <span role="img" aria-hidden="true">{c.icon}</span>
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold tracking-wider ${CATEGORY_COLOR[c.category]}`}>
                    {c.category.toUpperCase()}
                  </span>
                </div>
                <p className="mt-1 text-[15px] font-medium text-[#0f0f14] line-clamp-1">{c.name}</p>
                <p className="mt-1 text-[12px] font-light text-[#6B7280] line-clamp-2 flex-1">{c.description}</p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[12px] text-[#9CA3AF]">
                    <Users className="h-3.5 w-3.5" />
                    {c.members} membros
                  </span>
                  <button
                    onClick={() => handleToggle(c.id)}
                    className={`rounded-full px-4 py-1.5 text-[12px] font-light transition ${
                      c.joined
                        ? 'bg-[#EDE8F5] text-[#7C3AED] hover:bg-red-50 hover:text-red-500'
                        : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
                    }`}
                  >
                    {c.joined ? 'Participando' : 'Entrar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

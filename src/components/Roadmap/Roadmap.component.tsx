import roadmap1 from '../../assets/imagens/roadmap/roadmap-1.png';
import roadmap2 from '../../assets/imagens/roadmap/roadmap-2.png';
import roadmap3 from '../../assets/imagens/roadmap/roadmap-3.png';

const phases = [
  {
    id: 'ready',
    status: 'Já Pronto',
    imageLeft: true,
    image: roadmap1,
    items: [
      'Perfil por competências',
      'Comunidades temáticas',
      'Feed sem algoritmo de engajamento',
      'Onboarding sem Fricção',
    ],
  },
  {
    id: 'building',
    status: 'Construindo',
    imageLeft: false,
    image: roadmap2,
    items: [
      'Mentoria estruturada',
      'Vagas com salário visível',
      'Sistema de reputação sem likes',
      'App Mobile',
    ],
  },
  {
    id: 'discussing',
    status: 'Em discussão',
    imageLeft: true,
    image: roadmap3,
    items: [
      'Eventos e encontros presenciais',
      'Grupos de estudo colaborativo',
      'API aberta para integrações',
      'Co-criação com a comunidade',
    ],
  },
];

export const RoadmapSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#F5F3FF] dark:bg-linear-to-b dark:from-[#060411] dark:to-[#04030d] px-6 py-24" id="roadmap">
      <div className="mx-auto max-w-300">
        <h2 className="text-center text-[44px] font-light tracking-tight text-[#0f0f14] dark:text-[#e8e6ff] md:text-[52px]">
          Roadmap aberto
        </h2>

        <div className="mt-20 flex flex-col gap-28">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className={`flex flex-col gap-10 md:items-center md:gap-20 ${
                phase.imageLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div className="h-64 w-full shrink-0 overflow-hidden rounded-2xl md:w-[48%]">
                <img
                  src={phase.image}
                  alt={`Ilustração — ${phase.status}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-center gap-1">
                <h3 className="text-[28px] font-light text-[#0f0f14] dark:text-[#e8e6ff]">{phase.status}</h3>
                <ul className="mt-6 space-y-5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-4">
                      <span
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0f0f14] dark:bg-[#e8e6ff]"
                        aria-hidden="true"
                      />
                      <span className="text-[16px] font-light leading-relaxed text-[#1a1a2e] dark:text-[#9CA3AF]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#F9F8FF] dark:opacity-0" />
    </section>
  );
};

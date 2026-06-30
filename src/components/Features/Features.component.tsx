import fizemos1 from '../../assets/imagens/funcionalidades/fizemos-1.png';
import fizemos2 from '../../assets/imagens/funcionalidades/fizemos-2.png';
import fizemos3 from '../../assets/imagens/funcionalidades/fizemos-3.png';
import fizemos4 from '../../assets/imagens/funcionalidades/fizemos-4.png';

const features = [
  {
    id: 'communities',
    title: 'Comunidades e discussões',
    description:
      'Espaços temáticos onde profissionais debatem sem precisar performar. Tópicos, respostas e curadoria humana.',
    image: fizemos1,
  },
  {
    id: 'profile',
    title: 'Perfil por competências',
    description:
      'Mostre o que você sabe fazer, não só onde trabalhou. Habilidades, projetos e trajetória em primeiro plano.',
    image: fizemos2,
  },
  {
    id: 'mentoring',
    title: 'Mentoria',
    description:
      'Conecte-se com profissionais mais experientes de forma estruturada. Sessões agendadas, sem ruído.',
    image: fizemos3,
  },
  {
    id: 'jobs',
    title: 'Vagas com salário transparente',
    description:
      'Apenas vagas que mostram faixa salarial, regime e expectativas reais. Sem jogos de adivinhação.',
    image: fizemos4,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#EEEDF2] dark:bg-linear-to-b dark:from-[#0f0b1c] dark:to-[#0b0817] px-6 py-24" id="features">
      <div className="mx-auto max-w-300">
        <h2 className="text-[42px] font-light leading-tight tracking-tight text-[#0f0f14] dark:text-[#e8e6ff] md:text-[52px]">
          O que já construímos
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.id} className="overflow-hidden rounded-2xl bg-white dark:bg-[#13131f] shadow-sm">
              <div className="h-80 overflow-hidden">
                <img
                  src={feature.image}
                  alt={`Preview de ${feature.title}`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="px-8 pb-8 pt-6 text-center">
                <h3 className="text-[22px] font-light leading-snug text-[#0f0f14] dark:text-[#e8e6ff]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[15px] font-light leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#F9F8FF] dark:opacity-0" />
    </section>
  );
};

const problems = [
  {
    num: '01',
    title: 'Performar sucesso virou obrigação',
    desc: 'Cada post é um palco, conquistas infladas, rotinas perfeitas e vitórias editadas e a sensação constante de estar ficando para trás.',
  },
  {
    num: '02',
    title: 'Conexões que não conectam',
    desc: 'Quinhentas conexões e ninguém para chamar quando você precisa de verdade. Contato não é vínculo e a gente confundiu os dois.',
  },
  {
    num: '03',
    title: 'O algoritmo premia o ruído',
    desc: 'A fórmula rasa viraliza enquanto quem sabe de verdade fala para ninguém. O feed não mede valor, mede barulho.',
  },
];

export const ProblemSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#F9F8FF] dark:bg-linear-to-b dark:from-[#140d25] dark:to-[#0f0b1c] px-6 py-32" id="o-problema">
      <div className="mx-auto max-w-300">
        <div className="mb-20">
          <h2 className="mt-8 max-w-175 text-5xl font-light leading-tight tracking-tight text-gray-900 dark:text-[#e8e6ff] md:text-6xl">
            As redes profissionais
            <br />
            viraram palco
          </h2>
          <p className="mt-8 max-w-150 text-lg font-light leading-relaxed text-gray-500 dark:text-[#9CA3AF] md:text-xl">
            Crescer na carreira não deveria
            <br />
            exigir fingimento.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {problems.map((problem) => (
            <article
              className="rounded-lg border border-purple-100 dark:border-[#2a2a3d] bg-white/70 dark:bg-[#13131f]/70 p-8 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
              key={problem.num}
            >
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-md bg-purple-50 dark:bg-[#1e1e2e] text-xl font-light text-purple-500">
                {problem.num}
              </span>
              <h3 className="mt-6 text-2xl font-light leading-tight text-gray-900 dark:text-[#e8e6ff]">
                {problem.title}
              </h3>
              <p className="mt-4 text-base font-light leading-relaxed text-gray-500 dark:text-[#9CA3AF]">
                {problem.desc}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#EEEDF2] dark:opacity-0" />
    </section>
  );
};

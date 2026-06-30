import { useState } from 'react';

const faqs = [
  {
    id: 'users',
    question: 'Quantas pessoas já estão na Conexão?',
    answer:
      'Estamos em early access com um grupo seleto de profissionais. Cada novo membro é bem-vindo e faz parte da construção da plataforma.',
  },
  {
    id: 'revenue',
    question: 'Como se sustenta sendo grátis?',
    answer:
      'Por enquanto, a Conexão é mantida pela fundadora e por investimento inicial. Futuramente, planos profissionais opcionais sustentarão a plataforma sem comprometer o acesso básico.',
  },
  {
    id: 'data',
    question: 'Meus dados são vendidos?',
    answer:
      'Nunca. Seus dados não são e jamais serão vendidos para terceiros. A Conexão existe para conectar pessoas, não para monetizar informações.',
  },
  {
    id: 'shutdown',
    question: 'E se o projeto acabar?',
    answer:
      'Se encerrarmos as atividades, avisaremos com antecedência e daremos a opção de exportar todos os seus dados. Transparência é um dos nossos valores fundamentais.',
  },
  {
    id: 'invite',
    question: 'Posso convidar pessoas?',
    answer:
      'Sim! Cada membro pode convidar pessoas de confiança. Preferimos crescer por indicação a crescer por volume.',
  },
];

export const FAQSection = () => {
  const [openId, setOpenId] = useState<string | null>('users');

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section className="relative overflow-hidden bg-[#F9F8FF] dark:bg-linear-to-b dark:from-[#04030d] dark:to-[#03020a] px-6 py-24">
      <div className="mx-auto flex max-w-300 flex-col gap-16 md:flex-row">

        <div className="shrink-0 md:w-64">
          <h2 className="text-[36px] font-light leading-tight tracking-tight text-[#0f0f14] dark:text-[#e8e6ff]">
            Perguntas
            <br />
            Frequentes
          </h2>
          <p className="mt-4 text-[15px] font-light leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">
            Tudo que você precisa
            <br />
            saber sobre o Conexão.
          </p>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl bg-[#F2F0F7] dark:bg-[#13131f]">
          {faqs.map((faq, index) => {
            const isOpen = openId === faq.id;

            return (
              <div key={faq.id}>
                {index > 0 && <div className="mx-6 border-t border-[#E5E0EB] dark:border-[#2a2a3d]" />}

                <button
                  className="flex w-full items-center justify-between gap-4 px-8 py-6 text-left outline-none focus:outline-none"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="text-[17px] font-light leading-snug text-[#0f0f14] dark:text-[#e8e6ff]">
                    {faq.question}
                  </span>

                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center text-xl font-light text-[#6B7280] dark:text-[#9CA3AF]"
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <p className="px-8 pb-6 text-[15px] font-light leading-relaxed text-[#4B5563] dark:text-[#9CA3AF]">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>

      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-b from-transparent to-[#E4E0EE] dark:opacity-0" />
    </section>
  );
};

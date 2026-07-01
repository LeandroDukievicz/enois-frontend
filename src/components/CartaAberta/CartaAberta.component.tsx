import carImg from '../../assets/imagens/animacoes/carro.png';

export const OpenLetterSection = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#EEEDF2] to-[#F9F8FF] dark:from-[#0b0817] dark:to-[#080614] py-16" id="carta-aberta">

      {/* Carro absoluto, colado na borda direita */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] md:block">
        <img
          src={carImg}
          alt="Subaru WRX roxo — carro da fundadora da Conexão"
          className="h-full w-full object-contain object-right"
          style={{ transform: 'scale(1.15)', transformOrigin: 'right center' }}
        />
      </div>

      {/* Conteúdo de texto — lado esquerdo */}
      <div className="relative z-10 mx-auto max-w-300 px-10 md:px-20">
        <div className="relative max-w-88 py-10 text-center">

          {/* Aspas abertura — topo esquerdo */}
          <span
            className="select-none absolute top-0 left-0 text-[72px] leading-none text-[#0f0f14] dark:text-[#e8e6ff]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          {/* Texto centrado entre as aspas */}
          <div className="px-8">
            <p className="text-[30px] font-light leading-[1.25] tracking-tight text-[#0f0f14] dark:text-[#e8e6ff] md:text-[36px]">
              Oi, eu sou a Melissa.
            </p>
            <p className="mt-3 text-[18px] font-light leading-[1.6] text-[#3d3550] dark:text-[#c4bbdc]">
              Criei a Conexão porque cansei de redes onde todos fingem
              que estão bem, crescendo e vencendo. Cansei de empacotar minha trajetória em
              otimismo forçado para ser levada a sério.
            </p>
          </div>

          {/* Aspas fechamento — baixo direito */}
          <span
            className="select-none absolute bottom-0 right-0 text-[72px] leading-none text-[#0f0f14] dark:text-[#e8e6ff]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
            aria-hidden="true"
          >
            &rdquo;
          </span>

          {/* Assinatura abaixo do texto */}
          <div className="mt-8 flex flex-col items-center gap-1">
            <p className="text-[15px] font-medium leading-snug text-[#0f0f14] dark:text-[#e8e6ff]">
              Melissa Monfre
            </p>
            <p className="text-[14px] font-light leading-snug text-[#6B7280] dark:text-[#9CA3AF]">
              Fundadora da Conexão
            </p>
          </div>

        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#EEEDF2] dark:opacity-0" />
    </section>
  );
};

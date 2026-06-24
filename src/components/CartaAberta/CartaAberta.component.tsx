import carImg from '../../assets/imagens/animacoes/carro.png';
import melissaAvatar from '../../assets/imagens/equipe/foto-melissa.png';

export const OpenLetterSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#F9F8FF] py-24" id="carta-aberta">

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
        <div className="max-w-88">

          <span
            className="select-none text-[52px] leading-none text-[#0f0f14]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <div className="mt-1">
            <p className="text-[18px] font-light leading-[1.75] text-[#0f0f14]">
              Oi, eu sou a Melissa. Criei a Conexão porque cansei de redes onde todos fingem
              que estão bem, crescendo e vencendo. Cansei de empacotar minha trajetória em
              otimismo forçado para ser levada a sério.
            </p>
            <span
              className="select-none block text-[52px] leading-none text-[#0f0f14]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
              aria-hidden="true"
            >
              &rdquo;
            </span>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <img
              src={melissaAvatar}
              alt="Melissa Monfre"
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
            <div>
              <p className="text-[15px] font-medium leading-snug text-[#0f0f14]">
                Melissa Monfre
              </p>
              <p className="text-[14px] font-light leading-snug text-[#6B7280]">
                Fundadora da Conexão
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#EEEDF2]" />
    </section>
  );
};

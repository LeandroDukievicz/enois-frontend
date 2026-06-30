import { useNavigate } from 'react-router-dom';
import { Button } from '../Sistema/Button';
import animacao1 from '../../assets/imagens/animacoes/animacao-1.png';

export const MidCTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-[#EEEDF2] dark:bg-linear-to-b dark:from-[#080614] dark:to-[#060411] px-6 py-32" id="early-access">
      <div className="mx-auto flex max-w-160 flex-col items-center text-center">

        <img
          src={animacao1}
          alt=""
          aria-hidden="true"
          className="animate-chama mb-10 h-52 w-auto object-contain"
        />

        <h2 className="text-[44px] font-light leading-[1.12] tracking-tight text-[#0f0f14] dark:text-[#e8e6ff] md:text-[52px]">
          Toda rede que você usa hoje já foi pequena um dia
        </h2>

        <p className="mt-5 text-[17px] font-light leading-relaxed text-[#6B7280] dark:text-[#9CA3AF]">
          A Conexão está nascendo agora com poucas pessoas,
          <br />
          conversas de verdade, e espaço de sobra para a sua voz.
        </p>

        <div className="mt-10">
          <Button variant="primary" size="hero" onClick={() => navigate('/cadastro')}>Criar conta</Button>
        </div>

      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-[#F5F3FF] dark:opacity-0" />
    </section>
  );
};

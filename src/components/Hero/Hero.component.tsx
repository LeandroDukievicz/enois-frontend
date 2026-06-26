import { useNavigate } from 'react-router-dom';
import { Button } from '../Sistema/Button';
import heroMockup from '../../assets/imagens/heroi/mao.png';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-linear-to-b from-purple-100 via-purple-50 to-[#F9F8FF] px-6 pt-32"
      id="top"
    >
      <div className="relative z-20 mx-auto flex max-w-225 flex-col items-center text-center">
        <h1 className="mt-7.5 max-w-175 bg-[linear-gradient(90deg,#493568_0%,#563B7D_40%,#7C3AED_100%)] bg-clip-text text-[52px] font-light leading-[1.1] tracking-tighter text-transparent md:text-[76px]">
          Networking sem
          <br />
          performance
        </h1>

        <p className="mt-5.5 max-w-147.5 text-[21px] font-light leading-[1.45] text-[#675C7E]">
          Uma rede profissional onde você pode ser você.
          <br />
          comunidades, mentorias sem métricas de vaidade.
        </p>

        <div className="mt-10.5 flex flex-wrap items-center justify-center gap-5">
          <Button variant="primary" size="hero" onClick={() => navigate('/cadastro')}>Criar conta</Button>
          <Button variant="secondarySoft" size="hero" onClick={() => navigate('/cadastro')}>Explorar Plataforma</Button>
        </div>
      </div>

      <div className="mt-20 flex justify-center pb-10">
        <div className="relative w-full max-w-112.5">
          <img
            className="w-full"
            src={heroMockup}
            alt="Mockup do aplicativo Conexão na mão de um usuário"
          />
          {/* gradient branco no pulso — parte inferior da imagem */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-linear-to-t from-[#F9F8FF] via-[#F9F8FF]/60 to-transparent" />
        </div>
      </div>
    </section>
  );
};

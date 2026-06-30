import { useNavigate } from 'react-router-dom';
import { Button } from '../Sistema/Button';
import globoVideo from '../../assets/videos/202606162205.mp4';

export const FooterCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pb-20 pt-0 bg-[#E4E0EE] dark:bg-linear-to-b dark:from-[#03020a] dark:to-[#020108]">

      {/* Gradiente esfumaçado — faz o globo emergir suavemente do fundo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-56 bg-linear-to-b from-[#E4E0EE] dark:from-[#03020a] to-transparent" />

      {/* Globo — metade superior, topo da seção */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '28.125%' }}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t from-[#E4E0EE] dark:from-[#020108] via-[#E4E0EE]/60 dark:via-[#020108]/60 to-transparent" />
        <video
          src={globoVideo}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          aria-hidden="true"
          className="absolute inset-x-0 top-0 w-full mix-blend-multiply dark:mix-blend-screen dark:opacity-70"
        />
      </div>

      {/* Texto e CTA */}
      <div className="mx-auto flex max-w-300 flex-col items-start gap-8 px-6 pt-10 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-130 text-[36px] font-light leading-tight tracking-tight text-[#0f0f14] dark:text-[#e8e6ff] md:text-[40px]">
          Sua carreira merece um lugar
          <br />
          onde você não precisa fingir
        </h2>
        <div className="shrink-0">
          <Button variant="primary" size="hero" onClick={() => navigate('/cadastro')}>Criar conta</Button>
        </div>
      </div>

    </section>
  );
};

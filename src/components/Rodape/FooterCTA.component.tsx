import { Button } from '../Sistema/Button';
import globoVideo from '../../assets/videos/202606162205.mp4';

const BG = '#E4E0EE';

export const FooterCTASection = () => {
  return (
    <section className="relative overflow-hidden pb-20 pt-0" style={{ background: BG }}>


      {/* Gradiente esfumaçado — faz o globo emergir suavemente do fundo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-56"
        style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }}
      />

      {/* Globo — metade superior, topo da seção */}
      <div className="relative w-full overflow-hidden" style={{ paddingBottom: '28.125%' }}>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
          style={{ background: `linear-gradient(to top, ${BG}, ${BG}99, transparent)` }}
        />
        <video
          src={globoVideo}
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          aria-hidden="true"
          className="absolute inset-x-0 top-0 w-full mix-blend-multiply"
        />
      </div>

      {/* Texto e CTA */}
      <div className="mx-auto flex max-w-300 flex-col items-start gap-8 px-6 pt-10 md:flex-row md:items-center md:justify-between">
        <h2 className="max-w-130 text-[36px] font-light leading-tight tracking-tight text-[#0f0f14] md:text-[40px]">
          Sua carreira merece um lugar
          <br />
          onde você não precisa fingir
        </h2>
        <div className="shrink-0">
          <Button variant="primary" size="hero">Criar conta</Button>
        </div>
      </div>

    </section>
  );
};

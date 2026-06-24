import { Hero } from '../../components/Hero';
import { ProblemSection } from '../../components/Problema';
import { FeaturesSection } from '../../components/Features';
import { OpenLetterSection } from '../../components/CartaAberta';
import { MidCTASection } from '../../components/CTAIntermediario';
import { RoadmapSection } from '../../components/Roadmap';
import { FAQSection } from '../../components/FAQ';
import { FooterCTASection } from '../../components/Rodape';

export const Home = () => {
  return (
    <>
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <OpenLetterSection />
      <MidCTASection />
      <RoadmapSection />
      <FAQSection />
      <FooterCTASection />
    </>
  );
};

import { Hero } from '../../components/Hero';
import { ProblemSection } from '../../components/Problema';
import { OpenLetterSection } from '../../components/CartaAberta';
import { MidCTASection } from '../../components/CTAIntermediario';
import { FAQSection } from '../../components/FAQ';
import { FooterCTASection } from '../../components/Rodape';

export const Home = () => {
  return (
    <>
      <Hero />
      <ProblemSection />
      <OpenLetterSection />
      <MidCTASection />
      <FAQSection />
      <FooterCTASection />
    </>
  );
};

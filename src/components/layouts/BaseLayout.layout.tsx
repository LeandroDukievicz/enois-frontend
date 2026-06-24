import type { ReactNode } from 'react';
import { Navbar } from '../Navbar';
import { Rodape } from '../Rodape';

interface BaseLayoutProps {
  children: ReactNode;
}

export const BaseLayout = ({ children }: BaseLayoutProps) => {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        {children}
      </main>
      <Rodape />
    </div>
  );
};

import { Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../Sistema/Button';

export const Navbar: React.FC = () => {
  const navLinks = ['O Problema', 'Features', 'Carta Aberta', 'Roadmap'];
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="fixed left-0 top-0 z-50 h-[88px] w-full bg-transparent backdrop-blur-sm">
      <div className="flex h-full w-full items-center justify-between px-10">
        <a className="inline-flex items-center gap-3 text-[27px] font-light leading-none text-[#0f0f14] dark:text-[#e8e6ff]" href="#top" aria-label="Conexão">
          <span className="inline-flex h-[37px] w-[37px] items-center justify-center rounded-[9px] bg-[#7C3AED] text-white shadow-[0_8px_18px_rgba(124,58,237,0.22)]" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" role="img">
              <path d="M12 3.7L13.35 8.15C13.54 8.77 14.02 9.25 14.65 9.44L19.1 10.8L14.65 12.16C14.02 12.35 13.54 12.83 13.35 13.45L12 17.9L10.65 13.45C10.46 12.83 9.98 12.35 9.35 12.16L4.9 10.8L9.35 9.44C9.98 9.25 10.46 8.77 10.65 8.15L12 3.7Z" fill="currentColor" />
              <path d="M6.7 14.7L7.3 16.45L9.05 17.05L7.3 17.65L6.7 19.4L6.1 17.65L4.35 17.05L6.1 16.45L6.7 14.7Z" fill="currentColor" />
            </svg>
          </span>
          <span>Conexão</span>
        </a>

        <ul className="hidden items-center gap-[92px] pl-20 md:flex">
          {navLinks.map((link) => (
            <li key={link}>
              <a
                className="text-[17px] font-normal leading-none text-[#14131a] dark:text-[#e8e6ff] transition-colors hover:text-[#7C3AED] dark:hover:text-[#a78bfa]"
                href={`#${link.toLowerCase().replace(' ', '-')}`}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggle}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7C3AED] dark:hover:text-[#a78bfa] transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Button variant="primary" size="nav" onClick={() => navigate('/cadastro')}>Criar conta</Button>
        </div>
      </div>
    </nav>
  );
};

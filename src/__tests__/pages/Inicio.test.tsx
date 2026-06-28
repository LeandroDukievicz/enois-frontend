import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, seedAuthUser } from '../utils/renderWithProviders';
import { InicioPage } from '../../pages/Inicio';

vi.mock('../../components/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
  Avatar: ({ name, src }: { name: string; src?: string | null }) =>
    src ? <img src={src} alt={name} /> : <span data-testid="avatar">{name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}</span>,
}));

describe('InicioPage — Feed', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    seedAuthUser();
  });

  it('renderiza os 5 posts de comunidade ao carregar', () => {
    renderWithProviders(<InicioPage />);
    // Community posts authors
    expect(screen.getByText('Iraê C. Brandão')).toBeInTheDocument();
    expect(screen.getByText('Beatriz Alves')).toBeInTheDocument();
    expect(screen.getByText('Victor Penachio')).toBeInTheDocument();
    expect(screen.getByText('Camila Torres')).toBeInTheDocument();
    expect(screen.getByText('Rafael Monteiro')).toBeInTheDocument();
  });

  it('exibe o badge da comunidade nos posts de comunidade', () => {
    renderWithProviders(<InicioPage />);
    const badges = screen.getAllByText('Mundinho React');
    expect(badges.length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('Editais, Inovação & Parcerias').length).toBeGreaterThanOrEqual(2);
  });

  it('cria um novo post e o exibe no topo do feed', async () => {
    renderWithProviders(<InicioPage />);
    const textarea = screen.getByPlaceholderText(/compartilhe algo/i);
    await user.type(textarea, 'Meu primeiro post de teste');
    await user.click(screen.getByRole('button', { name: /publicar/i }));
    await waitFor(() => {
      expect(screen.getByText('Meu primeiro post de teste')).toBeInTheDocument();
    });
    // novo post deve aparecer antes dos posts de comunidade
    const articles = screen.getAllByRole('article');
    expect(within(articles[0]).getByText('Meu primeiro post de teste')).toBeInTheDocument();
  });

  it('botão Publicar fica desabilitado com textarea vazio', () => {
    renderWithProviders(<InicioPage />);
    const btn = screen.getByRole('button', { name: /publicar/i });
    expect(btn).toBeDisabled();
  });

  it('publicar limpa o textarea após criar o post', async () => {
    renderWithProviders(<InicioPage />);
    const textarea = screen.getByPlaceholderText(/compartilhe algo/i);
    await user.type(textarea, 'Post temporário');
    await user.click(screen.getByRole('button', { name: /publicar/i }));
    await waitFor(() => { expect(textarea).toHaveValue(''); });
  });

  it('curtir aumenta a contagem de reações', async () => {
    renderWithProviders(<InicioPage />);
    // Iraê's post has 14 reactions
    const articles = screen.getAllByRole('article');
    const firstPost = articles[0];
    const likeBtn = within(firstPost).getByRole('button', { name: /curtir/i });
    const initialCount = parseInt(within(firstPost).getByText('14').textContent!, 10);
    await user.click(likeBtn);
    expect(within(firstPost).getByText(String(initialCount + 1))).toBeInTheDocument();
  });

  it('curtir novamente desfaz a curtida', async () => {
    renderWithProviders(<InicioPage />);
    const articles = screen.getAllByRole('article');
    const firstPost = articles[0];
    const likeBtn = within(firstPost).getByRole('button', { name: /curtir/i });
    await user.click(likeBtn);
    await user.click(likeBtn);
    expect(within(firstPost).getByText('14')).toBeInTheDocument();
  });

  it('dropdown de compartilhar abre ao clicar em "Compartilhar"', async () => {
    renderWithProviders(<InicioPage />);
    const articles = screen.getAllByRole('article');
    const shareBtn = within(articles[0]).getByRole('button', { name: /compartilhar/i });
    await user.click(shareBtn);
    expect(screen.getByText('Copiar link da publicação')).toBeInTheDocument();
    expect(screen.getByText('Repostar no feed')).toBeInTheDocument();
  });

  it('"Repostar no feed" fecha o dropdown e emite notificação', async () => {
    renderWithProviders(<InicioPage />);
    const shareBtn = within(screen.getAllByRole('article')[0]).getByRole('button', { name: /compartilhar/i });
    await user.click(shareBtn);
    await user.click(screen.getByText('Repostar no feed'));
    expect(screen.queryByText('Copiar link da publicação')).not.toBeInTheDocument();
  });

  it('"Copiar link" exibe "✓ Link copiado!" e fecha o dropdown após 1800ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<InicioPage />);
    const shareBtn = within(screen.getAllByRole('article')[0]).getByRole('button', { name: /compartilhar/i });
    await user.click(shareBtn);
    await user.click(screen.getByText('Copiar link da publicação'));
    expect(screen.getByText('✓ Link copiado!')).toBeInTheDocument();
    vi.advanceTimersByTime(1800);
    await waitFor(() => {
      expect(screen.queryByText('✓ Link copiado!')).not.toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  it('post criado como "Projeto" aparece no feed', async () => {
    renderWithProviders(<InicioPage />);
    const textarea = screen.getByPlaceholderText(/compartilhe algo/i);
    await user.type(textarea, 'Projeto incrível');
    await user.click(screen.getByRole('button', { name: /^projeto$/i }));
    await user.click(screen.getByRole('button', { name: /publicar/i }));
    await waitFor(() => {
      expect(screen.getByText('Projeto incrível')).toBeInTheDocument();
    });
  });
});

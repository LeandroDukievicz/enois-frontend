import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, seedAuthUser } from '../utils/renderWithProviders';
import { AppShell, Avatar } from '../../components/AppShell';
import { useNotifications } from '../../contexts/NotificationsContext';

// Componente auxiliar para disparar notificações de dentro do contexto
function NotifTrigger({ message }: { message: string }) {
  const { add } = useNotifications();
  return <button onClick={() => add(message, 'post')}>Disparar</button>;
}

function Shell() {
  return (
    <AppShell>
      <NotifTrigger message="Notificação de teste" />
      <p>Conteúdo filho</p>
    </AppShell>
  );
}

describe('AppShell', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    seedAuthUser();
  });

  it('renderiza o conteúdo filho', () => {
    renderWithProviders(<Shell />);
    expect(screen.getByText('Conteúdo filho')).toBeInTheDocument();
  });

  it('renderiza os links de navegação na sidebar', () => {
    renderWithProviders(<Shell />);
    // Sidebar + mobile nav both render some links; use getAllByRole and check at least one exists
    expect(screen.getAllByRole('link', { name: /início/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /rede/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /comunidades/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /mensagens/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /vagas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /mentoria/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /eventos/i })).toBeInTheDocument();
  });

  it('o sino abre o dropdown de notificações ao clicar', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /notificações/i }));
    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /novas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /histórico/i })).toBeInTheDocument();
  });

  it('dropdown de notificações fecha ao clicar no X', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /notificações/i }));
    await user.click(screen.getByText('Notificações').parentElement!.querySelector('button:last-child')!);
    expect(screen.queryByText('Notificações')).not.toBeInTheDocument();
  });

  it('aba "Novas" mostra empty state quando não há notificações', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /notificações/i }));
    expect(screen.getByText('Nenhuma notificação nova.')).toBeInTheDocument();
  });

  it('push toast aparece quando uma nova notificação é adicionada', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /disparar/i }));
    await waitFor(() => {
      expect(screen.getByText('Notificação de teste')).toBeInTheDocument();
    });
  });

  it('push toast fecha automaticamente após 3500ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /disparar/i }));
    await waitFor(() => {
      expect(screen.getByText('Notificação de teste')).toBeInTheDocument();
    });
    act(() => { vi.advanceTimersByTime(3500); });
    await waitFor(() => {
      expect(screen.queryByText('Notificação de teste')).not.toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  it('push toast fecha ao clicar no botão X do toast', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /disparar/i }));
    await waitFor(() => { screen.getByText('Notificação de teste'); });
    // X button dentro do toast (o último X na página)
    const closeButtons = screen.getAllByRole('button');
    const toastX = closeButtons.find(b => b.closest('[class*="fixed"]'));
    if (toastX) await user.click(toastX);
    await waitFor(() => {
      expect(screen.queryByText('Notificação de teste')).not.toBeInTheDocument();
    });
  });

  it('badge de não-lidas aparece no sino após nova notificação', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /disparar/i }));
    // Badge com número de não-lidas
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('"Marcar tudo como lido" aparece na aba Novas quando há não-lidas', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /disparar/i }));
    await user.click(screen.getByRole('button', { name: /notificações/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /marcar tudo como lido/i })).toBeInTheDocument();
    });
  });

  it('"Marcar tudo como lido" move notificações para o Histórico', async () => {
    renderWithProviders(<Shell />);
    await user.click(screen.getByRole('button', { name: /disparar/i }));
    await user.click(screen.getByRole('button', { name: /notificações/i }));
    await user.click(await screen.findByRole('button', { name: /marcar tudo como lido/i }));
    // Aba Novas agora vazia
    expect(screen.getByText('Nenhuma notificação nova.')).toBeInTheDocument();
    // Histórico tem a notificação (pode aparecer no toast também, por isso getAllByText)
    await user.click(screen.getByRole('button', { name: /histórico/i }));
    expect(screen.getAllByText('Notificação de teste').length).toBeGreaterThanOrEqual(1);
  });
});

describe('Avatar', () => {
  it('exibe as iniciais quando não há src', () => {
    const { container } = renderWithProviders(<Avatar name="Maria Silva" />);
    expect(container).toHaveTextContent('MS');
  });

  it('exibe imagem quando src é fornecido', () => {
    renderWithProviders(<Avatar name="Maria Silva" src="https://example.com/foto.jpg" />);
    expect(screen.getByRole('img', { name: 'Maria Silva' })).toBeInTheDocument();
  });

  it('exibe apenas 2 iniciais para nomes com mais de 2 palavras', () => {
    const { container } = renderWithProviders(<Avatar name="Maria da Silva Santos" />);
    expect(container).toHaveTextContent('MS');
  });

  it('converte iniciais para maiúsculas', () => {
    const { container } = renderWithProviders(<Avatar name="ana paula" />);
    expect(container).toHaveTextContent('AP');
  });
});

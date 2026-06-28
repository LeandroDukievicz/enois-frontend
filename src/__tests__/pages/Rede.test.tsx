import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, seedAuthUser } from '../utils/renderWithProviders';
import { RedePage } from '../../pages/Rede';

vi.mock('../../components/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
  Avatar: ({ name }: { name: string }) => <span data-testid="avatar">{name[0]}</span>,
}));

describe('RedePage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    seedAuthUser();
  });

  it('renderiza a aba "Sugestões" por padrão', () => {
    renderWithProviders(<RedePage />);
    expect(screen.getByText('Pessoas que combinam com você')).toBeInTheDocument();
  });

  it('exibe as 6 sugestões iniciais', () => {
    renderWithProviders(<RedePage />);
    expect(screen.getByText('Diego de Souza Faria')).toBeInTheDocument();
    expect(screen.getByText('Guilherme L.')).toBeInTheDocument();
    expect(screen.getByText('Vitor Hugo Paschen')).toBeInTheDocument();
    expect(screen.getByText('André Kalil Rosenberg')).toBeInTheDocument();
    expect(screen.getByText('Camila Souza')).toBeInTheDocument();
    expect(screen.getByText('Rafael Mendes')).toBeInTheDocument();
  });

  it('exibe as 2 solicitações pendentes acima das sugestões', () => {
    renderWithProviders(<RedePage />);
    expect(screen.getByText('Solicitações pendentes')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('aceitar solicitação remove a pessoa da lista de pendentes', async () => {
    renderWithProviders(<RedePage />);
    const joaoCard = screen.getByText('João Silva').closest('[class*="rounded-2xl"]')!;
    await user.click(within(joaoCard).getByRole('button', { name: /aceitar/i }));
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
  });

  it('aceitar solicitação aumenta o contador de Conexões', async () => {
    renderWithProviders(<RedePage />);
    // Clica no StatTab de Conexões para ver o número
    const conexoesTab = screen.getByRole('button', { name: /conexões/i });
    expect(within(conexoesTab).getByText('0')).toBeInTheDocument();
    // Aceita João
    const joaoCard = screen.getByText('João Silva').closest('[class*="rounded-2xl"]')!;
    await user.click(within(joaoCard).getByRole('button', { name: /aceitar/i }));
    expect(within(conexoesTab).getByText('1')).toBeInTheDocument();
  });

  it('recusar solicitação remove a pessoa sem adicioná-la a conexões', async () => {
    renderWithProviders(<RedePage />);
    const mariaCard = screen.getByText('Maria Santos').closest('[class*="rounded-2xl"]')!;
    await user.click(within(mariaCard).getByRole('button', { name: /recusar/i }));
    expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
    // Conexões continuam em 0
    const conexoesTab = screen.getByRole('button', { name: /conexões/i });
    expect(within(conexoesTab).getByText('0')).toBeInTheDocument();
  });

  it('"Conectar" move sugestão para Conexões', async () => {
    renderWithProviders(<RedePage />);
    const diegoCard = screen.getByText('Diego de Souza Faria').closest('[class*="rounded-2xl"]')!;
    await user.click(within(diegoCard).getByRole('button', { name: /conectar/i }));
    // Diego não está mais nas sugestões
    expect(screen.queryByText('Diego de Souza Faria')).not.toBeInTheDocument();
    // Conexões sobe para 1
    const conexoesTab = screen.getByRole('button', { name: /conexões/i });
    expect(within(conexoesTab).getByText('1')).toBeInTheDocument();
  });

  it('"Seguir" move sugestão para Seguindo', async () => {
    renderWithProviders(<RedePage />);
    const rafaelCard = screen.getByText('Rafael Mendes').closest('[class*="rounded-2xl"]')!;
    await user.click(within(rafaelCard).getByRole('button', { name: /seguir/i }));
    expect(screen.queryByText('Rafael Mendes')).not.toBeInTheDocument();
    const seguindoTab = screen.getByRole('button', { name: /seguindo/i });
    expect(within(seguindoTab).getByText('1')).toBeInTheDocument();
  });

  it('aba "Conexões" exibe empty state quando não há conexões', async () => {
    renderWithProviders(<RedePage />);
    await user.click(screen.getByRole('button', { name: /conexões/i }));
    expect(screen.getByText(/você ainda não tem conexões/i)).toBeInTheDocument();
  });

  it('aba "Seguindo" exibe empty state quando não segue ninguém', async () => {
    renderWithProviders(<RedePage />);
    await user.click(screen.getByRole('button', { name: /seguindo/i }));
    expect(screen.getByText(/você ainda não segue ninguém/i)).toBeInTheDocument();
  });

  it('aba "Solicitações" exibe as 2 solicitações pendentes', async () => {
    renderWithProviders(<RedePage />);
    await user.click(screen.getByRole('button', { name: /solicitações/i }));
    expect(screen.getByText('Solicitações de conexão')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it('StatTab de Solicitações exibe badge com a contagem', () => {
    renderWithProviders(<RedePage />);
    const solicitacoesTab = screen.getByRole('button', { name: /solicitações/i });
    // O badge vermelho (bg-red-500) mostra o pending count (2)
    const redBadge = solicitacoesTab.querySelector('.bg-red-500')!;
    expect(redBadge).toHaveTextContent('2');
  });

  it('"Remover" conexão move pessoa de volta para sugestões', async () => {
    renderWithProviders(<RedePage />);
    // Primeiro conecta Diego
    const diegoCard = screen.getByText('Diego de Souza Faria').closest('[class*="rounded-2xl"]')!;
    await user.click(within(diegoCard).getByRole('button', { name: /conectar/i }));
    // Vai para aba Conexões
    await user.click(screen.getByRole('button', { name: /conexões/i }));
    expect(screen.getByText('Diego de Souza Faria')).toBeInTheDocument();
    // Remove a conexão
    await user.click(screen.getByRole('button', { name: /remover/i }));
    expect(screen.queryByText('Diego de Souza Faria')).not.toBeInTheDocument();
  });
});

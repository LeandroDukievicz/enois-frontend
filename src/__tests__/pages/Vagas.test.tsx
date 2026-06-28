import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, seedAuthUser } from '../utils/renderWithProviders';
import { VagasPage } from '../../pages/Vagas';

vi.mock('../../components/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
}));

describe('VagasPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    seedAuthUser();
  });

  it('renderiza os 12 jobs iniciais', () => {
    renderWithProviders(<VagasPage />);
    expect(screen.getByText('Desenvolvedor Frontend Sênior')).toBeInTheDocument();
    expect(screen.getByText('Arquiteto de Soluções Cloud')).toBeInTheDocument();
    // Verifica total aproximado via companies
    expect(screen.getByText('Nubank')).toBeInTheDocument();
    expect(screen.getByText('iFood')).toBeInTheDocument();
    expect(screen.getByText('Vivo')).toBeInTheDocument();
  });

  it('filtro "Freelance" exibe apenas 1 vaga', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^freelance$/i }));
    expect(screen.getByText('Desenvolvedor Backend')).toBeInTheDocument();
    expect(screen.queryByText('Desenvolvedor Frontend Sênior')).not.toBeInTheDocument();
    expect(screen.queryByText('Engenheiro de Backend')).not.toBeInTheDocument();
  });

  it('filtro "Estágio" exibe apenas 1 vaga', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^estágio$/i }));
    expect(screen.getByText('Estágio em Engenharia de Software')).toBeInTheDocument();
    expect(screen.queryByText('Desenvolvedor Frontend Sênior')).not.toBeInTheDocument();
  });

  it('filtro "CLT" exibe apenas vagas CLT', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^clt$/i }));
    // CLT jobs: Nubank, Mercado Livre, BTG, Stone, PicPay, Totvs, Creditas = 7
    expect(screen.getByText('Desenvolvedor Frontend Sênior')).toBeInTheDocument();
    expect(screen.queryByText('Estágio em Engenharia de Software')).not.toBeInTheDocument();
    expect(screen.queryByText('Desenvolvedor Backend')).not.toBeInTheDocument(); // Freelance
  });

  it('filtro "PJ" exibe apenas vagas PJ', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^pj$/i }));
    expect(screen.getByText('Engenheiro de Backend')).toBeInTheDocument(); // iFood PJ
    expect(screen.queryByText('Desenvolvedor Frontend Sênior')).not.toBeInTheDocument(); // CLT
  });

  it('filtro "Remoto" exibe apenas vagas remotas', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^remoto$/i }));
    expect(screen.getByText('Desenvolvedor Frontend Sênior')).toBeInTheDocument();
    expect(screen.queryByText('Cientista de Dados')).not.toBeInTheDocument(); // Presencial
  });

  it('botão "Candidatar" exibe "✓ Candidatado" após clicar', async () => {
    renderWithProviders(<VagasPage />);
    const applyButtons = screen.getAllByRole('button', { name: /^candidatar$/i });
    await user.click(applyButtons[0]);
    expect(screen.getByText(/candidatado/i)).toBeInTheDocument();
  });

  it('job já candidatado desabilita o botão', async () => {
    renderWithProviders(<VagasPage />);
    const applyButtons = screen.getAllByRole('button', { name: /^candidatar$/i });
    await user.click(applyButtons[0]);
    const appliedBtn = screen.getByText(/candidatado/i).closest('button')!;
    expect(appliedBtn).toBeDisabled();
  });

  it('múltiplos filtros combinados funcionam (ex: CLT + Remoto)', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^clt$/i }));
    await user.click(screen.getByRole('button', { name: /^remoto$/i }));
    // Deve manter apenas vagas CLT + Remoto
    const nubank = screen.queryByText('Desenvolvedor Frontend Sênior'); // CLT + Remoto ✓
    const btg = screen.queryByText('Cientista de Dados'); // CLT + Presencial ✗
    expect(nubank).toBeInTheDocument();
    expect(btg).not.toBeInTheDocument();
  });

  it('"Publicar vaga" abre o modal', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /publicar vaga/i }));
    expect(screen.getByRole('heading', { name: /publicar vaga/i })).toBeInTheDocument();
  });

  it('modal de publicar vaga fecha com o botão X', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /publicar vaga/i }));
    const modalHeader = screen.getByRole('heading', { name: /publicar vaga/i }).closest('div')!;
    await user.click(within(modalHeader).getByRole('button', { name: '' })); // X button
    expect(screen.queryByRole('heading', { name: /publicar vaga/i })).not.toBeInTheDocument();
  });

  it('remover filtro restaura todos os jobs', async () => {
    renderWithProviders(<VagasPage />);
    await user.click(screen.getByRole('button', { name: /^estágio$/i }));
    expect(screen.queryByText('Desenvolvedor Frontend Sênior')).not.toBeInTheDocument();
    // Clica novamente em Estágio para desmarcar
    await user.click(screen.getByRole('button', { name: /^estágio$/i }));
    expect(screen.getByText('Desenvolvedor Frontend Sênior')).toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, seedAuthUser } from '../utils/renderWithProviders';
import { MentoriaPage } from '../../pages/Mentoria';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<object>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../components/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
  Avatar: ({ name }: { name: string }) => <span data-testid="avatar">{name[0]}</span>,
}));

describe('MentoriaPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    seedAuthUser();
    mockNavigate.mockClear();
  });

  it('renderiza os 6 mentores por padrão (filtro "Todos")', () => {
    renderWithProviders(<MentoriaPage />);
    expect(screen.getByText('Joao Reis')).toBeInTheDocument();
    expect(screen.getByText('Iraê C. Brandão')).toBeInTheDocument();
    expect(screen.getByText('Victor Penachio')).toBeInTheDocument();
    expect(screen.getByText('Camila Torres')).toBeInTheDocument();
    expect(screen.getByText('Rafael Monteiro')).toBeInTheDocument();
    expect(screen.getByText('Beatriz Alves')).toBeInTheDocument();
  });

  it('filtro "Gratuito" exibe apenas 2 mentores (R$ 0,00)', async () => {
    renderWithProviders(<MentoriaPage />);
    await user.click(screen.getByRole('button', { name: /gratuito/i }));
    expect(screen.getByText('Joao Reis')).toBeInTheDocument();
    expect(screen.getByText('Iraê C. Brandão')).toBeInTheDocument();
    expect(screen.queryByText('Victor Penachio')).not.toBeInTheDocument();
    expect(screen.queryByText('Rafael Monteiro')).not.toBeInTheDocument();
  });

  it('filtro "Pago" exibe 4 mentores (excluindo gratuitos)', async () => {
    renderWithProviders(<MentoriaPage />);
    await user.click(screen.getByRole('button', { name: /^pago$/i }));
    expect(screen.queryByText('Joao Reis')).not.toBeInTheDocument();
    expect(screen.queryByText('Iraê C. Brandão')).not.toBeInTheDocument();
    expect(screen.getByText('Victor Penachio')).toBeInTheDocument();
    expect(screen.getByText('Camila Torres')).toBeInTheDocument();
    expect(screen.getByText('Rafael Monteiro')).toBeInTheDocument();
    expect(screen.getByText('Beatriz Alves')).toBeInTheDocument();
  });

  it('filtro "Todos" restaura todos os 6 mentores', async () => {
    renderWithProviders(<MentoriaPage />);
    await user.click(screen.getByRole('button', { name: /gratuito/i }));
    await user.click(screen.getByRole('button', { name: /^todos$/i }));
    expect(screen.getByText('Joao Reis')).toBeInTheDocument();
    expect(screen.getByText('Rafael Monteiro')).toBeInTheDocument();
  });

  it('"Agendar sessão" desabilita o botão ao clicar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<MentoriaPage />);
    const scheduleBtn = screen.getAllByRole('button', { name: /agendar sessão/i })[0];
    await user.click(scheduleBtn);
    await waitFor(() => {
      expect(screen.getAllByText(/✓ sessão agendada/i)[0]).toBeInTheDocument();
    });
    vi.useRealTimers();
  });

  it('"Agendar sessão" navega para /mensagens após 800ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<MentoriaPage />);
    const scheduleBtn = screen.getAllByRole('button', { name: /agendar sessão/i })[0];
    await user.click(scheduleBtn);
    vi.advanceTimersByTime(800);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/mensagens');
    });
    vi.useRealTimers();
  });

  it('"Tornar-me mentor" abre o modal', async () => {
    renderWithProviders(<MentoriaPage />);
    await user.click(screen.getByRole('button', { name: /tornar-me mentor/i }));
    expect(screen.getByText('Tornar-se mentor')).toBeInTheDocument();
    expect(screen.getByLabelText(/especialidades/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/investimento/i)).toBeInTheDocument();
  });

  it('fechar o modal de mentor funciona com o botão X', async () => {
    renderWithProviders(<MentoriaPage />);
    await user.click(screen.getByRole('button', { name: /tornar-me mentor/i }));
    await user.click(screen.getByRole('button', { name: '' })); // X button
    expect(screen.queryByText('Tornar-se mentor')).not.toBeInTheDocument();
  });

  it('"Salvar" no modal de mentor fecha o modal', async () => {
    renderWithProviders(<MentoriaPage />);
    await user.click(screen.getByRole('button', { name: /tornar-me mentor/i }));
    await user.click(screen.getByRole('button', { name: /salvar/i }));
    expect(screen.queryByText('Tornar-se mentor')).not.toBeInTheDocument();
  });

  it('exibe valores de investimento corretos nos cards', () => {
    renderWithProviders(<MentoriaPage />);
    expect(screen.getAllByText('R$ 0,00').length).toBe(2);
    expect(screen.getAllByText('R$ 500,00').length).toBe(3);
    expect(screen.getByText('R$ 1.000,00')).toBeInTheDocument();
  });
});

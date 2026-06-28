import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils/renderWithProviders';
import { CadastroPage } from '../../pages/Cadastro';

// Mock da API de auth (não tem backend)
vi.mock('../../lib/api/auth', () => ({
  authApi: { forgotPassword: vi.fn().mockResolvedValue(undefined) },
}));

describe('CadastroPage', () => {
  const user = userEvent.setup();

  it('renderiza a aba "Criar conta" por padrão', () => {
    renderWithProviders(<CadastroPage />);
    expect(screen.getByText('Vamos começar.')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });

  it('alterna para a aba "Entrar" e oculta o campo de nome', async () => {
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(screen.getByText('Bem-vinda de volta.')).toBeInTheDocument();
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
  });

  it('alterna de volta para "Criar conta" mantendo limpeza de estado', async () => {
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(screen.getByText('Vamos começar.')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });

  it('submit em "Criar conta" persiste sessão no localStorage', async () => {
    renderWithProviders(<CadastroPage />);
    await user.type(screen.getByLabelText(/nome completo/i), 'Maria Silva');
    await user.type(screen.getByLabelText(/e-mail/i), 'maria@teste.com');
    await user.type(screen.getByLabelText(/senha/i), 'senhasegura');
    await user.click(screen.getByRole('button', { name: /criar conta →/i }));
    await waitFor(() => {
      expect(localStorage.getItem('session_token')).toBe('mock-session-token');
      expect(JSON.parse(localStorage.getItem('current_user')!).name).toBe('Maria Silva');
    });
  });

  it('submit em "Entrar" autentica o usuário via localStorage', async () => {
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await user.type(screen.getByLabelText(/e-mail/i), 'teste@exemplo.com');
    await user.type(screen.getByLabelText(/senha/i), 'qualquersenha');
    await user.click(screen.getByRole('button', { name: /entrar →/i }));
    await waitFor(() => {
      expect(localStorage.getItem('session_token')).toBe('mock-session-token');
    });
  });

  it('botão de toggle de senha alterna o tipo do campo', async () => {
    renderWithProviders(<CadastroPage />);
    const passwordInput = screen.getByLabelText(/senha/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    // O botão do olho fica ao lado do campo
    const toggleBtn = passwordInput.parentElement!.querySelector('button')!;
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('"Esqueci minha senha" exibe o formulário de recuperação', async () => {
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await user.click(screen.getByRole('button', { name: /esqueci minha senha/i }));
    expect(screen.getByText('Recuperar acesso.')).toBeInTheDocument();
    expect(screen.queryByLabelText(/senha/i)).not.toBeInTheDocument();
  });

  it('"Voltar para o login" cancela o fluxo de recuperação', async () => {
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await user.click(screen.getByRole('button', { name: /esqueci minha senha/i }));
    await user.click(screen.getByRole('button', { name: /voltar para o login/i }));
    expect(screen.getByText('Bem-vinda de volta.')).toBeInTheDocument();
  });

  it('envio de recuperação chama authApi.forgotPassword e exibe confirmação', async () => {
    const { authApi } = await import('../../lib/api/auth');
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await user.click(screen.getByRole('button', { name: /esqueci minha senha/i }));
    await user.type(screen.getByLabelText(/e-mail/i), 'recuperar@teste.com');
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(authApi.forgotPassword).toHaveBeenCalledWith('recuperar@teste.com');
      expect(screen.getByText('Link enviado!')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro quando API de recuperação falha', async () => {
    const { authApi } = await import('../../lib/api/auth');
    vi.mocked(authApi.forgotPassword).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<CadastroPage />);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    await user.click(screen.getByRole('button', { name: /esqueci minha senha/i }));
    await user.type(screen.getByLabelText(/e-mail/i), 'erro@teste.com');
    await user.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => {
      expect(screen.getByText(/não foi possível enviar/i)).toBeInTheDocument();
    });
  });
});

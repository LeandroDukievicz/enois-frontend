import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  it('user é null e isAuthenticated false sem sessão', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('login armazena session_token no localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('test@example.com', 'pass'); });
    expect(localStorage.getItem('session_token')).toBe('mock-session-token');
  });

  it('login armazena current_user no localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('test@example.com', 'pass'); });
    const stored = JSON.parse(localStorage.getItem('current_user')!);
    expect(stored.email).toBe('test@example.com');
  });

  it('login define isAuthenticated como true', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('test@example.com', 'pass'); });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
  });

  it('signup cria usuário com o nome fornecido', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.signup('Maria Silva', 'maria@example.com', 'pass'); });
    expect(result.current.user?.name).toBe('Maria Silva');
    expect(result.current.user?.email).toBe('maria@example.com');
  });

  it('logout limpa localStorage e define user como null', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('test@example.com', 'pass'); });
    await act(async () => { await result.current.logout(); });
    expect(localStorage.getItem('session_token')).toBeNull();
    expect(localStorage.getItem('current_user')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('updateUser faz merge da atualização parcial e persiste no localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('test@example.com', 'pass'); });
    act(() => { result.current.updateUser({ headline: 'Nova headline' }); });
    expect(result.current.user?.headline).toBe('Nova headline');
    const stored = JSON.parse(localStorage.getItem('current_user')!);
    expect(stored.headline).toBe('Nova headline');
  });

  it('updateUser preserva campos não alterados', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.signup('João', 'joao@example.com', 'pass'); });
    act(() => { result.current.updateUser({ headline: 'Nova headline' }); });
    expect(result.current.user?.name).toBe('João');
    expect(result.current.user?.email).toBe('joao@example.com');
  });

  it('restaura usuário do localStorage ao montar o provider', () => {
    const user = { id: '1', name: 'Stored User', email: 'stored@example.com', username: 'stored', avatar: null, headline: 'Test' };
    localStorage.setItem('session_token', 'mock-session-token');
    localStorage.setItem('current_user', JSON.stringify(user));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user?.name).toBe('Stored User');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('useAuth lança erro quando usado fora do AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within AuthProvider');
    consoleSpy.mockRestore();
  });
});

import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// ThemeProvider depends on useAuth, so needs AuthProvider as parent
function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}

describe('ThemeContext', () => {
  it('isDark é false por padrão quando localStorage não tem tema', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(false);
  });

  it('isDark é true quando localStorage tem theme = dark', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(true);
  });

  it('toggle inverte isDark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(false);
    act(() => { result.current.toggle(); });
    expect(result.current.isDark).toBe(true);
    act(() => { result.current.toggle(); });
    expect(result.current.isDark).toBe(false);
  });

  it('toggle persiste novo valor no localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => { result.current.toggle(); });
    expect(localStorage.getItem('theme')).toBe('dark');
    act(() => { result.current.toggle(); });
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('não aplica classe dark no documentElement quando não autenticado', () => {
    localStorage.setItem('theme', 'dark');
    renderHook(() => useTheme(), { wrapper });
    // sem session_token → isAuthenticated = false → dark class não deve ser adicionada
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('aplica classe dark quando autenticado e isDark = true', () => {
    localStorage.setItem('session_token', 'mock-session-token');
    localStorage.setItem('current_user', JSON.stringify({ id: '1', name: 'U', email: 'u@u.com', username: 'u', avatar: null, headline: '' }));
    localStorage.setItem('theme', 'dark');
    renderHook(() => useTheme(), { wrapper });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('useTheme lança erro quando usado fora do ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider');
    consoleSpy.mockRestore();
  });
});

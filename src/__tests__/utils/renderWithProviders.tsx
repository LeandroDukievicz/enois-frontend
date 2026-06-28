import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationsProvider } from '../../contexts/NotificationsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/** Seeds localStorage with a mock authenticated user before rendering. */
export function seedAuthUser(overrides: Record<string, unknown> = {}) {
  const user = {
    id: '1',
    name: 'Luiza Teste',
    email: 'luiza@teste.com',
    username: 'luizateste',
    avatar: null,
    headline: 'QA Engineer · Conexão',
    ...overrides,
  };
  localStorage.setItem('session_token', 'mock-session-token');
  localStorage.setItem('current_user', JSON.stringify(user));
  return user;
}

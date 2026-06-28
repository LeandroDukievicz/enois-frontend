import { renderHook, act } from '@testing-library/react';
import { NotificationsProvider, useNotifications } from '../../contexts/NotificationsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationsProvider>{children}</NotificationsProvider>
);

describe('NotificationsContext', () => {
  it('inicia com lista vazia e unread = 0', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unread).toBe(0);
  });

  it('add() cria notificação com read: false', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => { result.current.add('Teste', 'post'); });
    const [notif] = result.current.notifications;
    expect(notif.read).toBe(false);
    expect(notif.message).toBe('Teste');
    expect(notif.type).toBe('post');
    expect(notif.id).toBeTruthy();
    expect(notif.createdAt).toBeInstanceOf(Date);
  });

  it('add() prepend: notificação mais nova fica primeiro', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => {
      result.current.add('Primeira', 'post');
      result.current.add('Segunda', 'connect');
    });
    expect(result.current.notifications[0].message).toBe('Segunda');
    expect(result.current.notifications[1].message).toBe('Primeira');
  });

  it('unread aumenta a cada add()', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => {
      result.current.add('A', 'post');
      result.current.add('B', 'connect');
      result.current.add('C', 'community');
    });
    expect(result.current.unread).toBe(3);
  });

  it('markRead() marca apenas a notificação alvo como lida', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => { result.current.add('A', 'post'); });
    vi.advanceTimersByTime(1); // garante ID diferente para cada notificação
    act(() => { result.current.add('B', 'connect'); });
    vi.useRealTimers();
    const idB = result.current.notifications[0].id; // B é a mais nova (índice 0)
    act(() => { result.current.markRead(idB); });
    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.notifications[1].read).toBe(false);
    expect(result.current.unread).toBe(1);
  });

  it('markAllRead() marca todas as notificações como lidas', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => {
      result.current.add('A', 'post');
      result.current.add('B', 'event');
    });
    act(() => { result.current.markAllRead(); });
    expect(result.current.unread).toBe(0);
    expect(result.current.notifications.every(n => n.read)).toBe(true);
  });

  it('markRead() com id inexistente não altera o estado', () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    act(() => { result.current.add('A', 'post'); });
    act(() => { result.current.markRead('id-que-nao-existe'); });
    expect(result.current.notifications[0].read).toBe(false);
    expect(result.current.unread).toBe(1);
  });

  it('useNotifications lança erro quando usado fora do provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useNotifications())).toThrow();
    consoleSpy.mockRestore();
  });
});

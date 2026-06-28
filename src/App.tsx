import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ToastProvider } from './contexts/ToastContext';
import { ConfirmProvider } from './contexts/ConfirmContext';
import { BaseLayout } from './components/layouts';
import { Home } from './pages/Home';
import { CadastroPage } from './pages/Cadastro';
import { InicioPage } from './pages/Inicio';
import { RedePage } from './pages/Rede';
import { ComunidadesPage } from './pages/Comunidades';
import { MensagensPage } from './pages/Mensagens';
import { SalvosPage } from './pages/Salvos';
import { VagasPage } from './pages/Vagas';
import { MentoriaPage } from './pages/Mentoria';
import { EventosPage } from './pages/Eventos';
import { PerfilPage } from './pages/Perfil';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/cadastro" replace />;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/inicio" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BaseLayout><Home /></BaseLayout>} />
      <Route path="/cadastro" element={<PublicOnlyRoute><CadastroPage /></PublicOnlyRoute>} />
      <Route path="/inicio" element={<ProtectedRoute><InicioPage /></ProtectedRoute>} />
      <Route path="/rede" element={<ProtectedRoute><RedePage /></ProtectedRoute>} />
      <Route path="/comunidades" element={<ProtectedRoute><ComunidadesPage /></ProtectedRoute>} />
      <Route path="/mensagens" element={<ProtectedRoute><MensagensPage /></ProtectedRoute>} />
      <Route path="/salvos" element={<ProtectedRoute><SalvosPage /></ProtectedRoute>} />
      <Route path="/vagas" element={<ProtectedRoute><VagasPage /></ProtectedRoute>} />
      <Route path="/mentoria" element={<ProtectedRoute><MentoriaPage /></ProtectedRoute>} />
      <Route path="/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export const App = () => (
  <Router>
    <AuthProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AppRoutes />
            </ConfirmProvider>
          </ToastProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </AuthProvider>
  </Router>
);

export default App;

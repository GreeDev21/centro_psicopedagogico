import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pacientes } from './pages/Pacientes';
import { Evaluaciones } from './pages/Evaluaciones';
import { EvaluacionForm } from './pages/EvaluacionForm';
import { EvaluacionDetalle } from './pages/EvaluacionDetalle';
import { Historial } from './pages/Historial';
import { Estadisticas } from './pages/Estadisticas';
import { Turnos } from './pages/Turnos';
import { Perfil } from './pages/Perfil';
import { Usuarios } from './pages/Usuarios';
import { Ayuda } from './pages/Ayuda';

function Protected({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <p style={{ padding: 40 }}>Cargando sesión…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 40 }}>Cargando sesión…</p>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/pacientes" element={<Protected><Pacientes /></Protected>} />
      <Route path="/evaluaciones" element={<Protected><Evaluaciones /></Protected>} />
      <Route path="/evaluaciones/nueva" element={<Protected><EvaluacionForm /></Protected>} />
      <Route path="/evaluaciones/:id" element={<Protected><EvaluacionDetalle /></Protected>} />
      <Route path="/evaluaciones/:id/editar" element={<Protected><EvaluacionForm /></Protected>} />
      <Route path="/historial" element={<Protected><Historial /></Protected>} />
      <Route path="/estadisticas" element={<Protected><Estadisticas /></Protected>} />
      <Route path="/turnos" element={<Protected><Turnos /></Protected>} />
      <Route path="/perfil" element={<Protected><Perfil /></Protected>} />
      <Route path="/ayuda" element={<Protected><Ayuda /></Protected>} />
      <Route path="/ayuda/:id" element={<Protected><Ayuda /></Protected>} />
      <Route path="/usuarios" element={<Protected adminOnly><Usuarios /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

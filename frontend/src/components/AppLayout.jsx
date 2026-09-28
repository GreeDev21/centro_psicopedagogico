import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Credits } from './Credits';

function Icon({ children }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

const groups = [
  {
    label: 'El día',
    links: [
      { to: '/', label: 'Tablero', end: true, icon: <><rect x="4" y="4" width="7" height="7" rx="1.5" {...stroke} /><rect x="13" y="4" width="7" height="7" rx="1.5" {...stroke} /><rect x="4" y="13" width="7" height="7" rx="1.5" {...stroke} /><rect x="13" y="13" width="7" height="7" rx="1.5" {...stroke} /></> },
      { to: '/turnos', label: 'Turnera', icon: <><circle cx="12" cy="12" r="8" {...stroke} /><path d="M12 8v5l3 2" {...stroke} /></> }
    ]
  },
  {
    label: 'Clínica',
    links: [
      { to: '/pacientes', label: 'Pacientes', icon: <><circle cx="9" cy="9" r="3" {...stroke} /><path d="M4 19c1-3 2.8-4.5 5-4.5S13 16 14 19" {...stroke} /><circle cx="17" cy="9" r="2.2" {...stroke} /><path d="M16 14.5c2 .3 3.2 1.5 4 4.5" {...stroke} /></> },
      { to: '/evaluaciones', label: 'Evaluaciones', end: true, icon: <><path d="M7 4h8l4 4v12H7z" {...stroke} /><path d="M15 4v4h4M9 13h6M9 17h4" {...stroke} /></> },
      { to: '/evaluaciones/nueva', label: 'Nueva evaluación', icon: <><circle cx="12" cy="12" r="8" {...stroke} /><path d="M12 8v8M8 12h8" {...stroke} /></> },
      { to: '/historial', label: 'Historial', icon: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5z" {...stroke} /><path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H20" {...stroke} /></> }
    ]
  },
  {
    label: 'El centro',
    links: [
      { to: '/estadisticas', label: 'Estadísticas', icon: <><path d="M5 19V10M12 19V5M19 19v-7" {...stroke} /></> },
      { to: '/perfil', label: 'Mi configuración', icon: <><circle cx="12" cy="8" r="3" {...stroke} /><path d="M5 19c1.2-3 3.2-4.5 7-4.5s5.8 1.5 7 4.5" {...stroke} /></> },
      { to: '/ayuda', label: 'Ayuda', icon: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H18a2 2 0 0 1 2 2V19l-4-2-4 2-4-2-3 2z" {...stroke} /></> }
    ]
  }
];

export function AppLayout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials = `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}`.toUpperCase();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/logo-mark.png" alt="Centro Psicopedagógico" />
        </div>
        <nav className="nav">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end}>
                  <Icon>{link.icon}</Icon>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
          {isAdmin && (
            <div className="nav-group">
              <NavLink to="/usuarios">
                <Icon><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...stroke} /></Icon>
                Control de usuarios
              </NavLink>
            </div>
          )}
        </nav>
        <div className="sidebar-foot">
          <Credits />
          <button className="linkish" type="button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <h1>{titleFromPath(location.pathname)}</h1>
          <div className="user-chip">
            <div className="avatar" aria-hidden="true">{initials}</div>
            <div>
              <strong>{user.nombre} {user.apellido}</strong>
              <span>{user.rol === 'administrador' ? 'Administrador' : 'Profesional'}</span>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function titleFromPath(path) {
  const map = {
    '/': 'El día',
    '/pacientes': 'Pacientes',
    '/evaluaciones': 'Evaluaciones',
    '/evaluaciones/nueva': 'Nuevo legajo',
    '/historial': 'Historial',
    '/estadisticas': 'Retrato del centro',
    '/turnos': 'Turnera',
    '/perfil': 'Mi lugar',
    '/ayuda': 'Cuaderno de ayuda',
    '/usuarios': 'Control de usuarios'
  };
  if (path.startsWith('/ayuda')) return 'Cuaderno de ayuda';
  if (path.includes('/evaluaciones/') && path.includes('/editar')) return 'Editar legajo';
  if (path.includes('/evaluaciones/') && !path.includes('nueva')) return 'Legajo';
  return map[path] || 'Centro Psicopedagógico';
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Field } from '../components/ui';
import { Credits } from '../components/Credits';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('admin@centro.com');
  const [contrasena, setContrasena] = useState('Admin1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(correo, contrasena);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div>
          <img className="login-logo" src="/logo-mark.png" alt="Centro Psicopedagógico" />
          <h1>Un lugar para acompañar el aprendizaje.</h1>
          <p>Evaluaciones, historial y turnos del centro, con la calma de un cuaderno clínico.</p>
          <Credits tone="dark" />
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={onSubmit}>
          <h2>Ingresar</h2>
          <p className="lede">El cuaderno del centro espera a quien lo abre.</p>
          {error && <Alert type="error">{error}</Alert>}
          <Field label="Correo electrónico">
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
          </Field>
          <Field label="Contraseña">
            <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          </Field>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Abriendo el cuaderno…' : 'Entrar'}
          </button>
          <details className="demo-note">
            <summary>Accesos de práctica</summary>
            <p>Administración: admin@centro.com / Admin1234</p>
            <p>Profesional: c.ramirez@centro.com / hash123</p>
          </details>
        </form>
      </section>
    </div>
  );
}

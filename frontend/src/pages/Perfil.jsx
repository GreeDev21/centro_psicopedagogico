import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, Field } from '../components/ui';

export function Perfil() {
  const { user, setUser } = useAuth();
  const [nombre, setNombre] = useState(user.nombre);
  const [apellido, setApellido] = useState(user.apellido);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/api/auth/perfil', { method: 'PUT', body: { nombre, apellido } });
      setUser(data.user);
      setMsg('Datos personales actualizados.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/api/auth/password', { method: 'PUT', body: { actual, nueva } });
      setActual('');
      setNueva('');
      setMsg(data.message);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid grid-2">
      <form className="card" onSubmit={saveProfile}>
        <h3>Datos personales</h3>
        {msg && <Alert type="ok">{msg}</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        <Field label="Nombre"><input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></Field>
        <Field label="Apellido"><input value={apellido} onChange={(e) => setApellido(e.target.value)} required /></Field>
        <Field label="Correo"><input value={user.correo} readOnly /></Field>
        <Field label="Rol"><input value={user.rol === 'administrador' ? 'Administrador' : 'Profesional'} readOnly /></Field>
        <button className="btn btn-primary" type="submit">Guardar datos</button>
      </form>
      <form className="card" onSubmit={savePassword}>
        <h3>Cambio de contraseña</h3>
        <Field label="Contraseña actual"><input type="password" value={actual} onChange={(e) => setActual(e.target.value)} required /></Field>
        <Field label="Nueva contraseña" hint="Mínimo 6 caracteres.">
          <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} required minLength={6} />
        </Field>
        <button className="btn btn-primary" type="submit">Actualizar contraseña</button>
      </form>
    </div>
  );
}

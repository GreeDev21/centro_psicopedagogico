import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Alert, Badge, Empty, Field, Modal } from '../components/ui';

const emptyForm = { nombre: '', apellido: '', correo: '', contrasena: '', rol: 'psicopedagoga' };

export function Usuarios() {
  const [items, setItems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [u, l] = await Promise.all([api('/api/usuarios'), api('/api/usuarios/logs/acceso')]);
    setItems(u.usuarios);
    setLogs(l.logs);
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ nombre: item.nombre, apellido: item.apellido, correo: item.correo, contrasena: '', rol: item.rol });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api(`/api/usuarios/${editing.id_usuario}`, { method: 'PUT', body: form });
      } else {
        await api('/api/usuarios', { method: 'POST', body: form });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!confirm(`¿Eliminar a ${item.nombre} ${item.apellido}?`)) return;
    try {
      await api(`/api/usuarios/${item.id_usuario}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      {error && <Alert type="error">{error}</Alert>}
      <div className="section-title">
        <h3>Cuentas del sistema</h3>
        <button className="btn btn-primary" type="button" onClick={openNew}>Nuevo usuario</button>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        {items.length === 0 && <Empty>No hay usuarios.</Empty>}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id_usuario}>
                  <td>{item.apellido}, {item.nombre}</td>
                  <td>{item.correo}</td>
                  <td>
                    <Badge
                      value={item.rol === 'administrador' ? 'administrador' : 'profesional'}
                      kind={item.rol === 'administrador' ? 'admin' : 'psico'}
                    />
                  </td>
                  <td className="actions">
                    <button className="btn btn-ghost" type="button" onClick={() => openEdit(item)}>Editar</button>
                    <button className="btn btn-danger" type="button" onClick={() => remove(item)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3>Últimos accesos</h3>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((item) => (
                <tr key={item.id_log}>
                  <td>{item.fecha_hora}</td>
                  <td>{item.apellido}, {item.nombre}</td>
                  <td>{item.accion}</td>
                  <td>{item.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <Modal title={editing ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="grid grid-2">
              <Field label="Nombre"><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></Field>
              <Field label="Apellido"><input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required /></Field>
            </div>
            <Field label="Correo"><input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} required /></Field>
            <Field label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}>
              <input type="password" value={form.contrasena} onChange={(e) => setForm({ ...form, contrasena: e.target.value })} required={!editing} minLength={editing ? undefined : 6} />
            </Field>
            <Field label="Rol">
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                <option value="psicopedagoga">Profesional</option>
                <option value="administrador">Administrador</option>
              </select>
            </Field>
            <button className="btn btn-primary" type="submit">Guardar</button>
          </form>
        </Modal>
      )}
    </>
  );
}

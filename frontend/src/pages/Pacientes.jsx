import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, Empty, Field, Modal } from '../components/ui';

const emptyForm = {
  nombre: '', apellido: '', dni: '', fecha_nacimiento: '', telefono: '', correo: '', direccion: ''
};

export function Pacientes() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const data = await api(`/api/pacientes${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setItems(data.pacientes);
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, [q]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      apellido: item.apellido,
      dni: item.dni || '',
      fecha_nacimiento: item.fecha_nacimiento,
      telefono: item.telefono || '',
      correo: item.correo || '',
      direccion: item.direccion || ''
    });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api(`/api/pacientes/${editing.id_paciente}`, { method: 'PUT', body: form });
      } else {
        await api('/api/pacientes', { method: 'POST', body: form });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!confirm(`¿Eliminar a ${item.nombre} ${item.apellido}? Se borrarán también sus evaluaciones y turnos.`)) return;
    await api(`/api/pacientes/${item.id_paciente}`, { method: 'DELETE' });
    await load();
  }

  return (
    <>
      {error && <Alert type="error">{error}</Alert>}
      <div className="toolbar">
        <Field label="Buscar paciente">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Apellido, nombre o DNI" />
        </Field>
        <button className="btn btn-primary" type="button" onClick={openNew}>Nuevo paciente</button>
      </div>
      <div className="card">
        {items.length === 0 && <Empty>No se encontraron pacientes.</Empty>}
        {items.length > 0 && (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Apellido y nombre</th>
                  <th>DNI</th>
                  <th>Nacimiento</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_paciente}>
                    <td className="who">{item.apellido}, {item.nombre}</td>
                    <td>{item.dni || '—'}</td>
                    <td>{item.fecha_nacimiento}</td>
                    <td>{item.telefono || '—'}</td>
                    <td>{item.correo || '—'}</td>
                    <td className="actions">
                      <button className="btn btn-ghost" type="button" onClick={() => openEdit(item)}>Editar</button>
                      {isAdmin && (
                        <button className="btn btn-danger" type="button" onClick={() => remove(item)}>Eliminar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {open && (
        <Modal title={editing ? 'Editar paciente' : 'Nuevo paciente'} onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <div className="grid grid-2">
              <Field label="Nombre"><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></Field>
              <Field label="Apellido"><input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required /></Field>
              <Field label="DNI" hint="7 u 8 números. Sirve para buscar a la persona."><input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} inputMode="numeric" /></Field>
              <Field label="Fecha de nacimiento"><input type="date" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} required /></Field>
              <Field label="Teléfono"><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
              <Field label="Correo"><input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></Field>
              <Field label="Dirección"><input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></Field>
            </div>
            <button className="btn btn-primary" type="submit">Guardar</button>
          </form>
        </Modal>
      )}
    </>
  );
}

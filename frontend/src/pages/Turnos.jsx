import { useEffect, useState } from 'react';
import { api, downloadPdf, ESTADO_TURNO, horaCorta } from '../api/client';
import { fechaConAnio } from '../utils/fecha';
import { Alert, Badge, Empty, Field, Modal } from '../components/ui';
import { BuscadorPaciente } from '../components/BuscadorPaciente';

const emptyForm = {
  id_paciente: '',
  id_usuario: '',
  fecha_turno: '',
  hora_turno: '',
  motivo: '',
  estado: 'pendiente'
};

export function Turnos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({ desde: '', hasta: '', estado: '', id_usuario: '' });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
      const qs = params.toString();
      const data = await api(`/api/turnos${qs ? `?${qs}` : ''}`);
      setItems(data.turnos || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api('/api/pacientes').then((d) => setPacientes(d.pacientes));
    api('/api/auth/profesionales').then((d) => setUsuarios(d.usuarios));
  }, []);

  useEffect(() => { load().catch((err) => setError(err.message)); }, [filtros]);

  function openNew() {
    setEditing(null);
    setForm({
      ...emptyForm,
      id_usuario: usuarios[0]?.id_usuario || '',
      fecha_turno: new Date().toISOString().slice(0, 10)
    });
    setOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      id_paciente: item.id_paciente,
      id_usuario: item.id_usuario,
      fecha_turno: item.fecha_turno,
      hora_turno: horaCorta(item.hora_turno),
      motivo: item.motivo || '',
      estado: item.estado
    });
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api(`/api/turnos/${editing.id_turno}`, { method: 'PUT', body: form });
      } else {
        await api('/api/turnos', { method: 'POST', body: form });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(item) {
    if (!confirm('¿Dar de baja este turno?')) return;
    await api(`/api/turnos/${item.id_turno}`, { method: 'DELETE' });
    await load();
  }

  async function exportar() {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    await downloadPdf(`/api/turnos/pdf${qs ? `?${qs}` : ''}`, 'agenda-turnos.pdf');
  }

  return (
    <>
      {error && <Alert type="error">{error}</Alert>}
      <div className="toolbar">
        <Field label="Desde"><input type="date" value={filtros.desde} onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })} /></Field>
        <Field label="Hasta"><input type="date" value={filtros.hasta} onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })} /></Field>
        <Field label="Estado">
          <select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
            <option value="">Todos</option>
            {ESTADO_TURNO.map((e) => <option key={e}>{e}</option>)}
          </select>
        </Field>
        <button className="btn btn-primary" type="button" onClick={openNew}>Nuevo turno</button>
        <button className="btn btn-secondary" type="button" onClick={exportar}>Exportar agenda PDF</button>
      </div>
      <div className="card">
        {loading && <Empty>Cargando agenda…</Empty>}
        {!loading && items.length === 0 && <Empty>No hay turnos para los filtros elegidos.</Empty>}
        {!loading && items.length > 0 && (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Profesional</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_turno}>
                    <td className="meta">{fechaConAnio(item.fecha_turno)}</td>
                    <td className="meta">{horaCorta(item.hora_turno)}</td>
                    <td className="who">{item.paciente_apellido}, {item.paciente_nombre}</td>
                    <td>{item.profesional_nombre} {item.profesional_apellido}</td>
                    <td>{item.motivo || '—'}</td>
                    <td><Badge value={item.estado} /></td>
                    <td className="actions">
                      <button className="btn btn-ghost" type="button" onClick={() => openEdit(item)}>Modificar</button>
                      <button className="btn btn-danger" type="button" onClick={() => remove(item)}>Baja</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {open && (
        <Modal title={editing ? 'Modificar turno' : 'Alta de turno'} onClose={() => setOpen(false)}>
          <form onSubmit={save}>
            <Field label="Paciente" hint="Buscá por apellido, nombre o DNI.">
              <BuscadorPaciente
                pacientes={pacientes}
                value={form.id_paciente}
                onChange={(id) => setForm({ ...form, id_paciente: id })}
                required
              />
            </Field>
            <Field label="Profesional asignado">
              <select value={form.id_usuario} onChange={(e) => setForm({ ...form, id_usuario: e.target.value })} required>
                <option value="">Seleccione</option>
                {usuarios.map((u) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido}</option>)}
              </select>
            </Field>
            <div className="grid grid-2">
              <Field label="Fecha"><input type="date" value={form.fecha_turno} onChange={(e) => setForm({ ...form, fecha_turno: e.target.value })} required /></Field>
              <Field label="Hora"><input type="time" value={form.hora_turno} onChange={(e) => setForm({ ...form, hora_turno: e.target.value })} required /></Field>
            </div>
            <Field label="Motivo"><textarea value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></Field>
            <Field label="Estado">
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                {ESTADO_TURNO.map((e) => <option key={e}>{e}</option>)}
              </select>
            </Field>
            <button className="btn btn-primary" type="submit">Guardar turno</button>
          </form>
        </Modal>
      )}
    </>
  );
}

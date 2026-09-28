import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, downloadPdf, etiquetaLenguaje } from '../api/client';
import { fechaConAnio } from '../utils/fecha';
import { Alert, Empty, Field } from '../components/ui';

export function Historial() {
  const [nombre, setNombre] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [items, setItems] = useState([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  function queryString() {
    const params = new URLSearchParams();
    if (nombre) params.set('nombre', nombre);
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    return params.toString();
  }

  async function buscar(e) {
    e?.preventDefault();
    setError('');
    if (!nombre && !desde && !hasta) {
      setError('Indique un apellido, nombre, DNI o un período de fechas.');
      return;
    }
    try {
      const data = await api(`/api/evaluaciones?${queryString()}`);
      setItems(data.evaluaciones);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function exportar() {
    if (!items.length) return;
    await downloadPdf(`/api/evaluaciones/historial/pdf?${queryString()}`, 'historial-paciente.pdf');
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="hint">Busque por nombre del paciente o por un rango de fechas. Ambos criterios pueden combinarse.</p>
        {error && <Alert type="error">{error}</Alert>}
        <form className="toolbar" onSubmit={buscar}>
          <Field label="Paciente">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Apellido, nombre o DNI" />
          </Field>
          <Field label="Desde">
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </Field>
          <button className="btn btn-primary" type="submit">Buscar</button>
          <button className="btn btn-secondary" type="button" onClick={exportar} disabled={!items.length}>Exportar PDF</button>
        </form>
      </div>
      <div className="card">
        {!searched && <Empty>Utilice el formulario para consultar el historial.</Empty>}
        {searched && items.length === 0 && <Empty>No hay evaluaciones para esos criterios.</Empty>}
        {items.length > 0 && (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Edad</th>
                  <th>Motivo</th>
                  <th>Lenguaje</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_evaluacion}>
                    <td className="meta">{fechaConAnio(item.fecha_evaluacion)}</td>
                    <td className="who">{item.paciente_apellido}, {item.paciente_nombre}</td>
                    <td>{item.edad_cronologica?.etiqueta}</td>
                    <td>{item.motivo_consulta || '—'}</td>
                    <td>{etiquetaLenguaje(item.desarrollo_lenguaje)}</td>
                    <td className="actions">
                      <Link className="btn btn-ghost" to={`/evaluaciones/${item.id_evaluacion}`}>Ver</Link>
                      <button className="btn btn-secondary" type="button" onClick={() => downloadPdf(`/api/evaluaciones/${item.id_evaluacion}/pdf`, `evaluacion-${item.id_evaluacion}.pdf`)}>PDF</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

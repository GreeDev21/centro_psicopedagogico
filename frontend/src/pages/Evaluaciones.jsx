import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, downloadPdf, etiquetaLenguaje } from '../api/client';
import { fechaConAnio } from '../utils/fecha';
import { Alert, Empty, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export function Evaluaciones() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');

  async function load() {
    const query = nombre ? `?nombre=${encodeURIComponent(nombre)}` : '';
    const data = await api(`/api/evaluaciones${query}`);
    setItems(data.evaluaciones);
  }

  useEffect(() => { load().catch((err) => setError(err.message)); }, [nombre]);

  async function remove(item) {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    await api(`/api/evaluaciones/${item.id_evaluacion}`, { method: 'DELETE' });
    await load();
  }

  return (
    <>
      {error && <Alert type="error">{error}</Alert>}
      <div className="toolbar">
        <Field label="Filtrar por paciente">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Apellido, nombre o DNI" />
        </Field>
        <Link className="btn btn-primary" to="/evaluaciones/nueva">Nueva evaluación</Link>
      </div>
      <div className="card">
        {items.length === 0 && <Empty>No hay evaluaciones para mostrar.</Empty>}
        {items.length > 0 && (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Edad cronológica</th>
                  <th>Lenguaje</th>
                  <th>Profesional</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_evaluacion}>
                    <td className="meta">{fechaConAnio(item.fecha_evaluacion)}</td>
                    <td className="who">{item.paciente_apellido}, {item.paciente_nombre}</td>
                    <td className="meta">{item.edad_cronologica?.etiqueta}</td>
                    <td>{etiquetaLenguaje(item.desarrollo_lenguaje)}</td>
                    <td>{item.profesional_nombre} {item.profesional_apellido}</td>
                    <td className="actions">
                      <Link className="btn btn-ghost" to={`/evaluaciones/${item.id_evaluacion}`}>Ver</Link>
                      <button className="btn btn-secondary" type="button" onClick={() => downloadPdf(`/api/evaluaciones/${item.id_evaluacion}/pdf`, `evaluacion-${item.id_evaluacion}.pdf`)}>PDF</button>
                      {(isAdmin || item.id_usuario === user.id_usuario) && (
                        <>
                          <Link className="btn btn-ghost" to={`/evaluaciones/${item.id_evaluacion}/editar`}>Editar</Link>
                          <button className="btn btn-danger" type="button" onClick={() => remove(item)}>Eliminar</button>
                        </>
                      )}
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

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, downloadPdf, etiquetaLenguaje } from '../api/client';
import { Alert } from '../components/ui';
import { fechaConAnio } from '../utils/fecha';

export function EvaluacionDetalle() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/evaluaciones/${id}`)
      .then((data) => setItem(data.evaluacion))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!item) return <p>Abriendo el legajo…</p>;

  return (
    <article className="sheet">
      <div className="sheet-head">
        <div>
          <p className="kicker">{fechaConAnio(item.fecha_evaluacion)} · {item.profesional_nombre} {item.profesional_apellido}</p>
          <h2 style={{ margin: 0 }}>{item.paciente_nombre} {item.paciente_apellido}</h2>
        </div>
        <div className="edad-plate">
          <span>Edad cronológica</span>
          <strong>{item.edad_cronologica?.etiqueta}</strong>
        </div>
      </div>
      <div className="actions" style={{ marginBottom: 18 }}>
        <Link className="btn btn-ghost" to={`/evaluaciones/${id}/editar`}>Editar</Link>
        <button className="btn btn-secondary" type="button" onClick={() => downloadPdf(`/api/evaluaciones/${id}/pdf`, `evaluacion-${id}.pdf`)}>Exportar PDF</button>
      </div>

      <section className="chapter">
        <h3>Por qué llega</h3>
        <p className="dossier-note">{item.motivo_consulta || '—'}</p>
      </section>
      <section className="chapter">
        <h3>Desarrollo</h3>
        <div className="grid grid-3">
          <div><p className="dossier-label">Lenguaje</p><p className="dossier-note">{etiquetaLenguaje(item.desarrollo_lenguaje)}</p></div>
          <div><p className="dossier-label">Alimentación</p><p className="dossier-note">{item.alimentacion || '—'}</p></div>
          <div><p className="dossier-label">Sueño</p><p className="dossier-note">{item.sueno || '—'}</p></div>
        </div>
        <p className="dossier-label">Motricidad</p>
        <p className="dossier-note">{item.desarrollo_motor || '—'}</p>
      </section>
      <section className="chapter">
        <h3>La vida cotidiana</h3>
        <p className="dossier-label">Tiempo libre</p>
        <p className="dossier-note">{item.tiempo_libre || '—'}</p>
        <p className="dossier-label">Juego</p>
        <p className="dossier-note">{item.juego || '—'}</p>
      </section>
      <section className="chapter">
        <h3>Lo que queda escrito</h3>
        <p className="dossier-note">{item.observaciones || '—'}</p>
        {item.archivos?.length > 0 && (
          <div className="thumbs">
            {item.archivos.map((archivo) => (
              <figure key={archivo.id_archivo}>
                <a href={archivo.path_archivo} target="_blank" rel="noreferrer">
                  <img src={archivo.path_archivo} alt="Producción del paciente" />
                </a>
              </figure>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

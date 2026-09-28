import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, etiquetaLenguaje, horaCorta } from '../api/client';
import { Alert, Badge, Empty } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { fechaCorta, fechaLarga, saludo } from '../utils/fecha';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [evals, setEvals] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api('/api/estadisticas'),
      api('/api/turnos/proximos'),
      api('/api/evaluaciones')
    ]).then(([s, t, e]) => {
      setStats(s);
      setTurnos(t.turnos);
      setEvals(e.evaluaciones.slice(0, 5));
    }).catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!stats) return <p>Abriendo el día…</p>;

  const proximo = turnos[0];
  const resto = turnos.slice(1, 6);

  return (
    <>
      <div className="desk-hello">
        <p className="kicker">{fechaLarga()}</p>
        <h2>{saludo()}, {user.nombre}.</h2>
        <p>
          {turnos.length
            ? `Hay ${turnos.length} ${turnos.length === 1 ? 'encuentro' : 'encuentros'} en el horizonte.`
            : 'No hay turnos pendientes en el horizonte.'}
          {stats.rangoMayorIncidencia ? ` La consulta más frecuente está en ${stats.rangoMayorIncidencia.etiqueta}.` : ''}
        </p>
      </div>

      <div className="grid grid-2" style={{ marginTop: 8 }}>
        {proximo ? (
          <article className="hero-turno">
            <div>
              <p className="kicker">Próximo encuentro</p>
              <h3>{proximo.paciente_nombre} {proximo.paciente_apellido}</h3>
              <p>{proximo.motivo || 'Sesión en el centro'} · {proximo.profesional_nombre} {proximo.profesional_apellido}</p>
            </div>
            <div className="hero-when">
              {fechaCorta(proximo.fecha_turno)}
              <small>{horaCorta(proximo.hora_turno)} · {proximo.estado}</small>
            </div>
          </article>
        ) : (
          <article className="hero-turno">
            <div>
              <p className="kicker">Agenda</p>
              <h3>El día está en calma.</h3>
              <p>Cuando llegue un turno, va a ocupar este lugar.</p>
            </div>
          </article>
        )}

        <div className="card">
          <div className="section-title">
            <h3>Lo que sigue</h3>
            <Link className="btn btn-secondary" to="/turnos">Abrir turnera</Link>
          </div>
          {resto.length === 0 && <Empty>No hay más turnos después del próximo.</Empty>}
          <div className="timeline">
            {resto.map((turno, index) => (
              <div className={`tl-item ${turno.estado}`} key={turno.id_turno}>
                <div className="tl-time">{horaCorta(turno.hora_turno)}</div>
                <div className="tl-rail">
                  <span className="tl-dot" />
                  {index < resto.length - 1 && <span className="tl-line" />}
                </div>
                <div className="tl-body">
                  <strong>{turno.paciente_apellido}, {turno.paciente_nombre}</strong>
                  <span>{fechaCorta(turno.fecha_turno)} · {turno.profesional_nombre}</span>
                </div>
                <Badge value={turno.estado} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-title">
          <h3>Últimos legajos</h3>
          <Link className="btn btn-primary" to="/evaluaciones/nueva">Escribir evaluación</Link>
        </div>
        {evals.length === 0 && <Empty>Todavía no hay evaluaciones en el cuaderno.</Empty>}
        <div className="fichas">
          {evals.map((item) => (
            <Link className="ficha" key={item.id_evaluacion} to={`/evaluaciones/${item.id_evaluacion}`}>
              <div>
                <strong>{item.paciente_nombre} {item.paciente_apellido}</strong>
                <span>{item.edad_cronologica?.etiqueta} · {fechaCorta(item.fecha_evaluacion)}</span>
              </div>
              <em>{etiquetaLenguaje(item.desarrollo_lenguaje)}</em>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

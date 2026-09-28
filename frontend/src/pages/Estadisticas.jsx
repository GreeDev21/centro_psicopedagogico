import { useEffect, useState } from 'react';
import { api, etiquetaLenguaje } from '../api/client';
import { Alert } from '../components/ui';

const RIBBON = ['#4A90E2', '#7ED6A5', '#F5C469', '#1B2A4A'];

export function Estadisticas() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/estadisticas').then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!stats) return <p>Reuniendo el retrato…</p>;

  const lenguaje = stats.lenguaje.map((item) => ({
    ...item,
    etiqueta: etiquetaLenguaje(item.etiqueta)
  }));
  const totalLenguaje = lenguaje.reduce((acc, item) => acc + Number(item.cantidad), 0) || 1;
  const mayor = stats.rangoMayorIncidencia;
  const total = Number(stats.totales.total_evaluaciones) || 0;
  const frase = mayor
    ? `De ${total} consultas, ${mayor.cantidad} corresponden a ${mayor.etiqueta}.`
    : 'Todavía no hay consultas suficientes para un retrato.';

  return (
    <>
      <section className="portrait">
        <p className="kicker">Lo que el centro está viendo</p>
        <h2>{frase}</h2>
        <div className="ribbon" aria-hidden="true">
          {lenguaje.map((item, index) => (
            <i
              key={item.etiqueta}
              style={{
                width: `${(Number(item.cantidad) / totalLenguaje) * 100}%`,
                background: RIBBON[index % RIBBON.length]
              }}
            />
          ))}
        </div>
        <div className="ribbon-key">
          {lenguaje.map((item, index) => (
            <span key={item.etiqueta}>
              <i className="swatch" style={{ background: RIBBON[index % RIBBON.length] }} />
              {item.etiqueta} · {item.porcentaje}%
            </span>
          ))}
        </div>
        <div className="notes">
          <div className="note"><strong>{stats.totales.total_evaluaciones}</strong><span>evaluaciones en el cuaderno</span></div>
          <div className="note"><strong>{stats.totales.total_pacientes}</strong><span>pacientes acompañados</span></div>
          <div className="note"><strong>{stats.totales.total_profesionales}</strong><span>profesionales</span></div>
          <div className="note"><strong>{mayor?.etiqueta || '—'}</strong><span>rango con mayor incidencia</span></div>
        </div>
      </section>

      <div className="grid grid-2">
        <div className="card">
          <h3>Por profesional</h3>
          <Bars data={stats.porProfesional} labelKey="profesional" />
        </div>
        <div className="card">
          <h3>Rangos etarios</h3>
          <Bars data={stats.rangoEtario} />
        </div>
        <div className="card">
          <h3>Alimentación</h3>
          <Bars data={stats.alimentacion} />
        </div>
        <div className="card">
          <h3>Sueño</h3>
          <Bars data={stats.sueno} />
        </div>
      </div>
    </>
  );
}

function Bars({ data, labelKey = 'etiqueta' }) {
  const max = Math.max(1, ...data.map((item) => Number(item.cantidad) || 0));
  return (
    <div className="bars">
      {data.map((item) => (
        <div className="bar-row" key={item[labelKey]}>
          <span className="bar-label">{item[labelKey]}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${Math.round((Number(item.cantidad) / max) * 100)}%` }} />
          </div>
          <strong>{item.cantidad}</strong>
        </div>
      ))}
    </div>
  );
}

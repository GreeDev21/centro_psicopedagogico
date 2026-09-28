import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import manual from '../../../shared/manual.json';
import { downloadPdf } from '../api/client';
import { Alert } from '../components/ui';

export function Ayuda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [exportando, setExportando] = useState('');

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return manual.capitulos;
    return manual.capitulos.filter((cap) => {
      const texto = [
        cap.titulo,
        cap.resumen,
        cap.kicker,
        ...(cap.bloques || []).flatMap((b) => [b.texto, b.titulo, ...(b.items || [])])
      ].join(' ').toLowerCase();
      return texto.includes(q);
    });
  }, [busqueda]);

  const actual = manual.capitulos.find((cap) => cap.id === id)
    || visibles[0]
    || manual.capitulos[0];
  const indice = manual.capitulos.findIndex((cap) => cap.id === actual.id);
  const anterior = manual.capitulos[indice - 1];
  const siguiente = manual.capitulos[indice + 1];

  function abrir(capId) {
    navigate(`/ayuda/${capId}`);
  }

  async function exportar(alcance) {
    setError('');
    setExportando(alcance);
    try {
      if (alcance === 'libro') {
        await downloadPdf('/api/ayuda/pdf', 'manual-centro-psicopedagogico.pdf');
      } else {
        await downloadPdf(`/api/ayuda/pdf/${actual.id}`, `ayuda-${actual.id}.pdf`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setExportando('');
    }
  }

  return (
    <div className="book">
      <aside className="book-index">
        <p className="kicker">Índice</p>
        <input
          className="book-search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en el manual"
          aria-label="Buscar en el manual"
        />
        <ol>
          {visibles.map((cap, i) => (
            <li key={cap.id}>
              <button
                type="button"
                className={cap.id === actual.id ? 'active' : ''}
                onClick={() => abrir(cap.id)}
              >
                <span>{String(manual.capitulos.indexOf(cap) + 1).padStart(2, '0')}</span>
                {cap.titulo}
              </button>
            </li>
          ))}
        </ol>
        {visibles.length === 0 && <p className="hint">Ningún capítulo contiene esa palabra.</p>}
      </aside>

      <article className="book-sheet">
        {error && <Alert type="error">{error}</Alert>}
        <header className="book-head">
          <div>
            <p className="kicker">{actual.kicker} · {indice + 1} de {manual.capitulos.length}</p>
            <h2>{actual.titulo}</h2>
            {actual.rol === 'administrador' && <em className="book-role">Solo administrador</em>}
          </div>
          <div className="actions">
            <button className="btn btn-ghost" type="button" disabled={!!exportando} onClick={() => exportar('capitulo')}>
              {exportando === 'capitulo' ? 'Armando…' : 'PDF de este capítulo'}
            </button>
            <button className="btn btn-secondary" type="button" disabled={!!exportando} onClick={() => exportar('libro')}>
              {exportando === 'libro' ? 'Armando…' : 'PDF del libro'}
            </button>
          </div>
        </header>
        <p className="book-lead">{actual.resumen}</p>
        {actual.bloques.map((bloque, index) => (
          <Bloque key={`${actual.id}-${index}`} bloque={bloque} />
        ))}
        <footer className="book-turn">
          <button className="btn btn-ghost" type="button" disabled={!anterior} onClick={() => anterior && abrir(anterior.id)}>
            {anterior ? `Anterior · ${anterior.titulo}` : 'Inicio del libro'}
          </button>
          <button className="btn btn-primary" type="button" disabled={!siguiente} onClick={() => siguiente && abrir(siguiente.id)}>
            {siguiente ? `Siguiente · ${siguiente.titulo}` : 'Fin del libro'}
          </button>
        </footer>
      </article>
    </div>
  );
}

function Bloque({ bloque }) {
  if (bloque.tipo === 'parrafo') return <p className="book-prose">{bloque.texto}</p>;
  if (bloque.tipo === 'nota') return <aside className="book-note">{bloque.texto}</aside>;
  return (
    <section className="book-block">
      {bloque.titulo && <h3>{bloque.titulo}</h3>}
      {bloque.tipo === 'pasos' ? (
        <ol className="book-steps">
          {bloque.items.map((item) => <li key={item}>{item}</li>)}
        </ol>
      ) : (
        <ul className="book-list">
          {bloque.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
    </section>
  );
}

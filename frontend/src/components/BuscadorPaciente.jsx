import { useEffect, useMemo, useRef, useState } from 'react';

function sinAcento(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function etiquetaPaciente(paciente) {
  if (!paciente) return '';
  const dni = paciente.dni ? ` · DNI ${paciente.dni}` : '';
  return `${paciente.apellido}, ${paciente.nombre}${dni}`;
}

export function coincidePaciente(paciente, texto) {
  const consulta = sinAcento(texto).trim();
  if (!consulta) return true;
  const nombre = sinAcento(paciente.nombre);
  const apellido = sinAcento(paciente.apellido);
  const dni = String(paciente.dni || '').replace(/\D/g, '');
  return consulta.split(/\s+/).every((token) => {
    const digitos = token.replace(/\D/g, '');
    return nombre.includes(token)
      || apellido.includes(token)
      || (digitos.length > 0 && dni.includes(digitos));
  });
}

export function BuscadorPaciente({ pacientes, value, onChange, required = false }) {
  const seleccionado = pacientes.find((p) => String(p.id_paciente) === String(value));
  const [texto, setTexto] = useState(etiquetaPaciente(seleccionado));
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  useEffect(() => {
    setTexto(etiquetaPaciente(seleccionado));
  }, [seleccionado]);

  useEffect(() => {
    function cerrar(event) {
      if (!caja.current?.contains(event.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, []);

  const consulta = texto === etiquetaPaciente(seleccionado) ? '' : texto;
  const resultados = useMemo(
    () => pacientes.filter((p) => coincidePaciente(p, consulta)).slice(0, 12),
    [pacientes, consulta]
  );

  function elegir(paciente) {
    onChange(String(paciente.id_paciente));
    setTexto(etiquetaPaciente(paciente));
    setAbierto(false);
  }

  return (
    <div className="picker" ref={caja}>
      <input
        value={texto}
        placeholder="Apellido, nombre o DNI"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={abierto}
        onFocus={() => setAbierto(true)}
        onChange={(e) => {
          setTexto(e.target.value);
          setAbierto(true);
          if (value) onChange('');
        }}
      />
      <input className="picker-required" tabIndex={-1} value={value || ''} required={required} onChange={() => {}} />
      {abierto && (
        <ul className="picker-list" role="listbox">
          {resultados.length === 0 && <li className="picker-empty">Ningún paciente coincide.</li>}
          {resultados.map((paciente) => (
            <li key={paciente.id_paciente}>
              <button type="button" onClick={() => elegir(paciente)}>
                <strong>{paciente.apellido}, {paciente.nombre}</strong>
                <span>{paciente.dni ? `DNI ${paciente.dni}` : 'Sin DNI'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

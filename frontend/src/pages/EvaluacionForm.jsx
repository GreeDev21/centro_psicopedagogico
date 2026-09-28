import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ALIMENTACION_OPTIONS, LENGUAJE_OPTIONS, SUENO_OPTIONS } from '../api/client';
import { Alert, Field } from '../components/ui';
import { BuscadorPaciente } from '../components/BuscadorPaciente';

const empty = {
  id_paciente: '',
  nuevo: false,
  paciente_nombre: '',
  paciente_apellido: '',
  paciente_dni: '',
  fecha_nacimiento: '',
  paciente_telefono: '',
  paciente_correo: '',
  paciente_direccion: '',
  fecha_evaluacion: new Date().toISOString().slice(0, 10),
  motivo_consulta: '',
  desarrollo_lenguaje: '',
  desarrollo_motor: '',
  alimentacion: '',
  sueno: '',
  tiempo_libre: '',
  juego: '',
  observaciones: ''
};

export function EvaluacionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [pacientes, setPacientes] = useState([]);
  const [files, setFiles] = useState([]);
  const [existentes, setExistentes] = useState([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [edad, setEdad] = useState('—');

  useEffect(() => {
    api('/api/pacientes')
      .then((data) => setPacientes(data.pacientes || []))
      .catch((err) => setError(err.message));
    if (id) {
      api(`/api/evaluaciones/${id}`).then(({ evaluacion }) => {
        setForm({
          ...empty,
          id_paciente: String(evaluacion.id_paciente),
          fecha_evaluacion: evaluacion.fecha_evaluacion,
          motivo_consulta: evaluacion.motivo_consulta || '',
          desarrollo_lenguaje: evaluacion.desarrollo_lenguaje || '',
          desarrollo_motor: evaluacion.desarrollo_motor || '',
          alimentacion: evaluacion.alimentacion || '',
          sueno: evaluacion.sueno || '',
          tiempo_libre: evaluacion.tiempo_libre || '',
          juego: evaluacion.juego || '',
          observaciones: evaluacion.observaciones || ''
        });
        setExistentes(evaluacion.archivos || []);
      }).catch((err) => setError(err.message));
    }
  }, [id]);

  const selectedPatient = useMemo(
    () => pacientes.find((p) => String(p.id_paciente) === String(form.id_paciente)),
    [pacientes, form.id_paciente]
  );

  useEffect(() => {
    const nacimiento = form.nuevo ? form.fecha_nacimiento : selectedPatient?.fecha_nacimiento;
    if (!nacimiento || !form.fecha_evaluacion) {
      setEdad('—');
      return;
    }
    const n = new Date(`${nacimiento}T00:00:00`);
    const r = new Date(`${form.fecha_evaluacion}T00:00:00`);
    let anios = r.getFullYear() - n.getFullYear();
    let meses = r.getMonth() - n.getMonth();
    if (r.getDate() < n.getDate()) meses -= 1;
    if (meses < 0) { anios -= 1; meses += 12; }
    setEdad(`${anios} ${anios === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`);
  }, [form, selectedPatient]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setOk('');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'nuevo') data.append(key, value ?? '');
    });
    files.forEach((file) => data.append('imagenes', file));

    try {
      if (id) {
        await api(`/api/evaluaciones/${id}`, { method: 'PUT', body: data, isForm: true });
        setOk('Evaluación actualizada.');
      } else {
        await api('/api/evaluaciones', { method: 'POST', body: data, isForm: true });
        setOk('Evaluación registrada.');
      }
      setTimeout(() => navigate('/evaluaciones'), 700);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeFile(archivo) {
    await api(`/api/evaluaciones/archivo/${archivo.id_archivo}`, { method: 'DELETE' });
    setExistentes((prev) => prev.filter((item) => item.id_archivo !== archivo.id_archivo));
  }

  return (
    <form className="sheet dossier" onSubmit={onSubmit}>
      {error && <Alert type="error">{error}</Alert>}
      {ok && <Alert type="ok">{ok}</Alert>}
      <div className="sheet-head">
        <div>
          <p className="kicker">Legajo clínico</p>
          <h2 style={{ margin: 0 }}>{id ? 'Continuar la evaluación' : 'Abrir una evaluación'}</h2>
        </div>
        <div className="edad-plate">
          <span>Edad cronológica</span>
          <strong>{edad}</strong>
        </div>
      </div>

      <section className="chapter">
      <h3>Quién consulta</h3>
      <label className="checkline">
        <input type="checkbox" checked={form.nuevo} onChange={(e) => set('nuevo', e.target.checked)} />
        Registrar un paciente nuevo en esta evaluación
      </label>

      {!form.nuevo && (
        <Field label="Paciente" hint="Podés buscar por apellido, nombre o DNI, juntos o por separado.">
          <BuscadorPaciente
            pacientes={pacientes}
            value={form.id_paciente}
            onChange={(id) => set('id_paciente', id)}
            required={!form.nuevo}
          />
        </Field>
      )}

      {form.nuevo && (
        <div className="grid grid-2">
          <Field label="Nombre"><input value={form.paciente_nombre} onChange={(e) => set('paciente_nombre', e.target.value)} required={form.nuevo} /></Field>
          <Field label="Apellido"><input value={form.paciente_apellido} onChange={(e) => set('paciente_apellido', e.target.value)} required={form.nuevo} /></Field>
          <Field label="DNI" hint="7 u 8 números."><input value={form.paciente_dni} onChange={(e) => set('paciente_dni', e.target.value)} inputMode="numeric" /></Field>
          <Field label="Fecha de nacimiento"><input type="date" value={form.fecha_nacimiento} onChange={(e) => set('fecha_nacimiento', e.target.value)} required={form.nuevo} /></Field>
          <Field label="Teléfono"><input value={form.paciente_telefono} onChange={(e) => set('paciente_telefono', e.target.value)} /></Field>
          <Field label="Correo"><input type="email" value={form.paciente_correo} onChange={(e) => set('paciente_correo', e.target.value)} /></Field>
          <Field label="Dirección"><input value={form.paciente_direccion} onChange={(e) => set('paciente_direccion', e.target.value)} /></Field>
        </div>
      )}

      <Field label="Fecha de la evaluación">
        <input type="date" value={form.fecha_evaluacion} onChange={(e) => set('fecha_evaluacion', e.target.value)} required />
      </Field>
      </section>

      <section className="chapter">
      <h3>Por qué llega</h3>
      <Field label="Motivo inicial de la consulta">
        <textarea value={form.motivo_consulta} onChange={(e) => set('motivo_consulta', e.target.value)} />
      </Field>
      </section>

      <section className="chapter">
      <h3>Desarrollo</h3>

      <div className="grid grid-3">
        <Field label="Desarrollo del lenguaje">
          <select value={form.desarrollo_lenguaje} onChange={(e) => set('desarrollo_lenguaje', e.target.value)}>
            <option value="">Seleccionar</option>
            {LENGUAJE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </Field>
        <Field label="Alimentación">
          <select value={form.alimentacion} onChange={(e) => set('alimentacion', e.target.value)}>
            <option value="">Seleccionar</option>
            {ALIMENTACION_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </Field>
        <Field label="Sueño">
          <select value={form.sueno} onChange={(e) => set('sueno', e.target.value)}>
            <option value="">Seleccionar</option>
            {SUENO_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Desarrollo motor" hint="Características motrices observadas.">
        <textarea value={form.desarrollo_motor} onChange={(e) => set('desarrollo_motor', e.target.value)} />
      </Field>
      </section>

      <section className="chapter">
      <h3>La vida cotidiana</h3>
      <Field label="Tiempo libre" hint="Actividades de ocio del paciente.">
        <textarea value={form.tiempo_libre} onChange={(e) => set('tiempo_libre', e.target.value)} />
      </Field>
      <Field label="Juego" hint="Adaptación a consignas y resultados en las propuestas.">
        <textarea value={form.juego} onChange={(e) => set('juego', e.target.value)} />
      </Field>
      </section>

      <section className="chapter">
      <h3>Lo que queda escrito</h3>
      <Field label="Otras observaciones">
        <textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} />
      </Field>
      <Field label="Imágenes de producciones" hint="Escrituras, dibujos, cálculos u otras producciones. JPG, PNG, WEBP o GIF.">
        <input type="file" accept="image/*" multiple onChange={(e) => setFiles([...e.target.files])} />
      </Field>

      {existentes.length > 0 && (
        <div className="thumbs" style={{ marginBottom: 16 }}>
          {existentes.map((archivo) => (
            <div key={archivo.id_archivo}>
              <a href={archivo.path_archivo} target="_blank" rel="noreferrer">
                <img src={archivo.path_archivo} alt="Producción del paciente" />
              </a>
              <button className="btn btn-danger" type="button" onClick={() => removeFile(archivo)}>Quitar</button>
            </div>
          ))}
        </div>
      )}
      </section>

      <p className="hint">Al menos un campo clínico, además de la persona y la fecha.</p>
      <button className="btn btn-primary" type="submit">{id ? 'Guardar en el cuaderno' : 'Registrar evaluación'}</button>
    </form>
  );
}

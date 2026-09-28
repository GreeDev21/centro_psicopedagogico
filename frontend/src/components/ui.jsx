export function Alert({ type = 'warn', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

export function Badge({ value, kind }) {
  const cls = kind || value;
  return <span className={`badge badge-${cls}`}>{value}</span>;
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="section-title">
          <h3>{title}</h3>
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

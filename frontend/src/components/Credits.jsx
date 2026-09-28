export function Credits({ tone = 'light' }) {
  return (
    <p className={`credits credits-${tone}`}>
      <span>Desarrollo</span>
      Burgos Agustín · Pintos Julio
      <a href="https://www.webxpert.com.ar" target="_blank" rel="noreferrer">Webxpert</a>
    </p>
  );
}

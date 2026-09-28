function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Sesión no iniciada. Inicie sesión para continuar.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Sesión no iniciada.' });
  }
  if (req.session.user.rol !== 'administrador') {
    return res.status(403).json({ message: 'Esta acción requiere rol de administrador.' });
  }
  next();
}

function requireSelfOrAdmin(param = 'id') {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: 'Sesión no iniciada.' });
    }
    if (user.rol === 'administrador' || String(user.id_usuario) === String(req.params[param])) {
      return next();
    }
    return res.status(403).json({ message: 'No tiene permisos para modificar este recurso.' });
  };
}

module.exports = { requireAuth, requireAdmin, requireSelfOrAdmin };

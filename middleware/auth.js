const jwt = require("jsonwebtoken");

// 1. MIDDLEWARE DE AUTENTICACIÓN
const verificarToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      mensaje: "Acceso denegado. Token no proporcionado",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      mensaje: "Token inválido o expirado",
    });
  }
};

// 2. MIDDLEWARE DE ROL
const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: "Acceso denegado. No autenticado",
      });
    }

    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: "Acceso denegado. No tenés permisos para esta acción",
      });
    }

    next();
  };
};

module.exports = { verificarToken, verificarRol };

// MIDDLEWARE DE MANEJO CENTRALIZADO DE ERRORES
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // 1. ERROR DE VALIDACIÓN DE MONGOOSE
  if (err.name === "ValidationError") {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      mensaje: "Error de validación",
      errores: mensajes,
    });
  }

  // 2. ERROR DE ID INVÁLIDO DE MONGODB
  if (err.name === "CastError") {
    return res.status(400).json({
      mensaje: "ID inválido",
    });
  }

  // 3. ERROR DE DUPLICADO EN MONGODB
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      mensaje: `Ya existe un registro con ese ${campo}`,
    });
  }

  // 4. ERROR DE JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      mensaje: "Token inválido",
    });
  }

  // 5. ERROR GENÉRICO
  res.status(err.status || 500).json({
    mensaje: err.message || "Error interno del servidor",
  });
};

module.exports = errorHandler;

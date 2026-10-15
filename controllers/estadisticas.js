const Turno = require("../models/Turno");

// 1. OBTENER ESTADÍSTICAS
const obtenerEstadisticas = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const totalTurnos = await Turno.countDocuments();

    const pendientes = await Turno.countDocuments({ estado: "pendiente" });
    const confirmados = await Turno.countDocuments({ estado: "confirmado" });
    const cancelados = await Turno.countDocuments({ estado: "cancelado" });

    const porServicio = await Turno.aggregate([
      {
        $group: {
          _id: "$servicio",
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "servicios",
          localField: "_id",
          foreignField: "_id",
          as: "servicio",
        },
      },
      {
        $project: {
          servicio: { $arrayElemAt: ["$servicio.nombre", 0] },
          total: 1,
        },
      },
    ]);

    const turnosHoy = await Turno.countDocuments({ fecha: hoy });

    res.json({
      totalTurnos,
      porEstado: {
        pendiente: pendientes,
        confirmado: confirmados,
        cancelado: cancelados,
      },
      porServicio,
      turnosHoy,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener estadísticas",
      error: error.message,
    });
  }
};

module.exports = { obtenerEstadisticas };

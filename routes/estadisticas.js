const express = require("express");
const router = express.Router();
const Turno = require("../models/Turno");
const { verificarToken, verificarRol } = require("../middleware/auth");

// GET - Estadísticas generales (solo admin)
router.get("/", verificarToken, verificarRol("admin"), async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    // 1. TOTAL DE TURNOS
    const totalTurnos = await Turno.countDocuments();

    // 2. TURNOS POR ESTADO
    const pendientes = await Turno.countDocuments({ estado: "pendiente" });
    const confirmados = await Turno.countDocuments({ estado: "confirmado" });
    const cancelados = await Turno.countDocuments({ estado: "cancelado" });

    // 3. TURNOS POR SERVICIO
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

    // 4. TURNOS DE HOY
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
});

module.exports = router;

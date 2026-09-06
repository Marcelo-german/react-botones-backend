const express = require("express");
const router = express.Router();
const Turno = require("../models/Turno");

// POST - Crear turno
router.post("/", async (req, res) => {
  try {
    const { fecha, hora } = req.body;

    const turnoExistente = await Turno.findOne({ fecha, hora });

    if (turnoExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un turno para esa fecha y hora",
      });
    }

    const nuevoTurno = await Turno.create(req.body);
    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el turno",
      error: error.message,
    });
  }
});

// GET - Obtener turnos
router.get("/", async (req, res) => {
  try {
    const turnos = await Turno.find().populate("servicio");
    res.json(turnos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los turnos",
      error: error.message,
    });
  }
});

// PUT - Actualizar turno
router.put("/:id", async (req, res) => {
  try {
    const turnoActualizado = await Turno.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true },
    );
    if (!turnoActualizado) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }
    res.json(turnoActualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el turno",
      error: error.message,
    });
  }
});

// DELETE - Eliminar turno
router.delete("/:id", async (req, res) => {
  try {
    const turnoEliminado = await Turno.findByIdAndDelete(req.params.id);
    if (!turnoEliminado) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }
    res.json({
      mensaje: "Turno eliminado correctamente",
      turno: turnoEliminado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al eliminar el turno",
      error: error.message,
    });
  }
});

module.exports = router;

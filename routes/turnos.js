const express = require("express");
const router = express.Router();
const Turno = require("../models/Turno");
const { verificarToken, verificarRol } = require("../middleware/auth");

// POST - Crear turno
router.post("/", verificarToken, async (req, res) => {
  try {
    const { nombreCliente, servicio, fecha, hora } = req.body || {};

    if (!nombreCliente || !servicio || !fecha || !hora) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    const turnoExistente = await Turno.findOne({ fecha, hora });

    if (turnoExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un turno para esa fecha y hora",
      });
    }

    // 1. GUARDAR EL USUARIO DEL TOKEN
    const nuevoTurno = await Turno.create({
      ...req.body,
      usuario: req.usuario.id,
    });

    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el turno",
      error: error.message,
    });
  }
});

// GET - Horarios disponibles
router.get("/disponibles", async (req, res) => {
  try {
    const { fecha, servicioId } = req.query;

    if (!fecha || !servicioId) {
      return res.status(400).json({
        mensaje: "Fecha y servicioId son obligatorios",
      });
    }

    const Servicio = require("../models/Servicio");
    const servicio = await Servicio.findById(servicioId);

    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    const slots = [];
    for (let hora = 9; hora < 17; hora++) {
      slots.push(`${String(hora).padStart(2, "0")}:00`);
      slots.push(`${String(hora).padStart(2, "0")}:30`);
    }

    const turnosDelDia = await Turno.find({ fecha });
    const slotsQueBloquea = servicio.duracion / 30;

    const horariosOcupados = new Set();
    turnosDelDia.forEach((turno) => {
      const indexSlot = slots.indexOf(turno.hora);
      for (let i = 0; i < slotsQueBloquea; i++) {
        if (slots[indexSlot + i]) {
          horariosOcupados.add(slots[indexSlot + i]);
        }
      }
    });

    const horariosDisponibles = slots.filter((slot, index) => {
      if (horariosOcupados.has(slot)) return false;
      for (let i = 1; i < slotsQueBloquea; i++) {
        if (!slots[index + i] || horariosOcupados.has(slots[index + i])) {
          return false;
        }
      }
      return true;
    });

    res.json({
      fecha,
      servicio: servicio.nombre,
      duracion: servicio.duracion,
      horariosDisponibles,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener horarios disponibles",
      error: error.message,
    });
  }
});

// GET - Mis turnos
router.get("/mis-turnos", verificarToken, async (req, res) => {
  try {
    const turnos = await Turno.find({ usuario: req.usuario.id })
      .populate("servicio")
      .sort({ fecha: 1, hora: 1 });

    res.json(turnos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener tus turnos",
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

// PATCH - Cambiar estado del turno
router.patch("/:id/estado", verificarToken, async (req, res) => {
  try {
    const { estado } = req.body || {};

    if (!estado) {
      return res.status(400).json({
        mensaje: "El estado es obligatorio",
      });
    }

    const estadosValidos = ["pendiente", "confirmado", "cancelado"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "Estado inválido. Use: pendiente, confirmado o cancelado",
      });
    }

    const turnoActualizado = await Turno.findByIdAndUpdate(
      req.params.id,
      { estado },
      { returnDocument: "after" },
    );

    if (!turnoActualizado) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }

    res.json(turnoActualizado);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el estado",
      error: error.message,
    });
  }
});

module.exports = router;

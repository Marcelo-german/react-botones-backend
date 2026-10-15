const Turno = require("../models/Turno");
const Servicio = require("../models/Servicio");
const Usuario = require("../models/Usuario");
const { enviarConfirmacionTurno } = require("../middleware/email");

// 1. CREAR TURNO
const crearTurno = async (req, res) => {
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

    const nuevoTurno = await Turno.create({
      ...req.body,
      usuario: req.usuario.id,
    });

    try {
      const servicioData = await Servicio.findById(servicio);
      const usuarioData = await Usuario.findById(req.usuario.id);
      if (servicioData && usuarioData) {
        await enviarConfirmacionTurno(
          nuevoTurno,
          servicioData,
          usuarioData.email,
        );
      }
    } catch (emailError) {
      console.error("Error al enviar email:", emailError.message);
    }

    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el turno",
      error: error.message,
    });
  }
};

// 2. HORARIOS DISPONIBLES
const horariosDisponibles = async (req, res) => {
  try {
    const { fecha, servicioId } = req.query;

    if (!fecha || !servicioId) {
      return res.status(400).json({
        mensaje: "Fecha y servicioId son obligatorios",
      });
    }

    const diaSemana = new Date(fecha + "T00:00:00").getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return res.status(400).json({
        mensaje: "No hay turnos disponibles los fines de semana",
      });
    }

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

    const disponibles = slots.filter((slot, index) => {
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
      horariosDisponibles: disponibles,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener horarios disponibles",
      error: error.message,
    });
  }
};

// 3. MIS TURNOS
const misTurnos = async (req, res) => {
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
};

// 4. OBTENER TURNOS
const obtenerTurnos = async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const saltar = (pagina - 1) * limite;

    const filtro = {};
    if (req.query.fecha) filtro.fecha = req.query.fecha;
    if (req.query.estado) filtro.estado = req.query.estado;
    if (req.query.nombreCliente) {
      filtro.nombreCliente = { $regex: req.query.nombreCliente, $options: "i" };
    }

    const total = await Turno.countDocuments(filtro);
    const turnos = await Turno.find(filtro)
      .populate("servicio")
      .skip(saltar)
      .limit(limite);

    res.json({
      turnos,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los turnos",
      error: error.message,
    });
  }
};

// 5. ACTUALIZAR TURNO
const actualizarTurno = async (req, res) => {
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
};

// 6. ELIMINAR TURNO
const eliminarTurno = async (req, res) => {
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
};

// 7. CAMBIAR ESTADO
const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body || {};

    if (!estado) {
      return res.status(400).json({ mensaje: "El estado es obligatorio" });
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
};

// 8. CANCELAR TURNO PROPIO
const cancelarTurno = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id);

    if (!turno) {
      return res.status(404).json({ mensaje: "Turno no encontrado" });
    }

    if (turno.usuario.toString() !== req.usuario.id) {
      return res.status(403).json({
        mensaje: "No tenés permiso para cancelar este turno",
      });
    }

    turno.estado = "cancelado";
    await turno.save();

    res.json({ mensaje: "Turno cancelado correctamente", turno });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cancelar el turno",
      error: error.message,
    });
  }
};

module.exports = {
  crearTurno,
  horariosDisponibles,
  misTurnos,
  obtenerTurnos,
  actualizarTurno,
  eliminarTurno,
  cambiarEstado,
  cancelarTurno,
};

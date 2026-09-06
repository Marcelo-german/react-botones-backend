const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Servicio = require("./models/Servicio");
const Turno = require("./models/Turno");

const app = express();
const PORT = 4000;

// ================================
// 1. MIDDLEWARES
// ================================

app.use(express.json());
app.use(cors());

// ================================
// 2. RUTA PRINCIPAL
// ================================

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

// ================================
// 3. SERVICIOS
// ================================

// GET - Obtener servicios
// Permite filtrar por categoría:
// /api/servicios?categoria=peluqueria
app.get("/api/servicios", async (req, res) => {
  try {
    const { categoria } = req.query;

    const filtro = categoria ? { categoria } : {};

    const servicios = await Servicio.find(filtro);

    res.json(servicios);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los servicios",
      error: error.message,
    });
  }
});

// POST - Crear servicio
app.post("/api/servicios", async (req, res) => {
  try {
    const nuevoServicio = await Servicio.create(req.body);

    res.status(201).json(nuevoServicio);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el servicio",
      error: error.message,
    });
  }
});

// PUT - Actualizar servicio
app.put("/api/servicios/:id", async (req, res) => {
  try {
    const servicioActualizado = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!servicioActualizado) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    res.json(servicioActualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el servicio",
      error: error.message,
    });
  }
});

// DELETE - Eliminar servicio
app.delete("/api/servicios/:id", async (req, res) => {
  try {
    const servicioEliminado = await Servicio.findByIdAndDelete(req.params.id);

    if (!servicioEliminado) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
      });
    }

    res.json({
      mensaje: "Servicio eliminado correctamente",
      servicio: servicioEliminado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al eliminar el servicio",
      error: error.message,
    });
  }
});

// ================================
// 4. TURNOS
// ================================

// POST - Crear turno
app.post("/api/turnos", async (req, res) => {
  try {
    const { nombreCliente, servicio, fecha, hora } = req.body;

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
app.get("/api/turnos", async (req, res) => {
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
app.put("/api/turnos/:id", async (req, res) => {
  try {
    const turnoActualizado = await Turno.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!turnoActualizado) {
      return res.status(404).json({
        mensaje: "Turno no encontrado",
      });
    }

    res.json(turnoActualizado);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el turno",
      error: error.message,
    });
  }
});

// DELETE - Eliminar turnos
app.delete("/api/turnos/:id", async (req, res) => {
  try {
    const turnoEliminado = await Turno.findByIdAndDelete(req.params.id);

    if (!turnoEliminado) {
      return res.status(404).json({
        mensaje: "Turno no encontrado",
      });
    }

    res.json({
      mensaje: "turno eliminado correctamente",
      turno: turnoEliminado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al eliminar el turno",
      error: error.message,
    });
  }
});

// ================================
// 5. CONEXIÓN A MONGODB
// ================================

const iniciarServidor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB conectado");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar MongoDB:", error.message);
  }
};

iniciarServidor();

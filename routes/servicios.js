const express = require("express");
const router = express.Router();
const Servicio = require("../models/Servicio");

// GET - Obtener servicios
router.get("/", async (req, res) => {
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
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
  try {
    const servicioActualizado = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true },
    );
    if (!servicioActualizado) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
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
router.delete("/:id", async (req, res) => {
  try {
    const servicioEliminado = await Servicio.findByIdAndDelete(req.params.id);
    if (!servicioEliminado) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
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

module.exports = router;

const Servicio = require("../models/Servicio");

// 1. OBTENER SERVICIOS
const obtenerServicios = async (req, res) => {
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
};

// 2. CREAR SERVICIO
const crearServicio = async (req, res) => {
  try {
    const nuevoServicio = await Servicio.create(req.body);
    res.status(201).json(nuevoServicio);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el servicio",
      error: error.message,
    });
  }
};

// 3. SUBIR IMAGEN
const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        mensaje: "No se subió ninguna imagen",
      });
    }

    const servicioActualizado = await Servicio.findByIdAndUpdate(
      req.params.id,
      { imagen: req.file.filename },
      { returnDocument: "after" },
    );

    if (!servicioActualizado) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    res.json({
      mensaje: "Imagen subida correctamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al subir la imagen",
      error: error.message,
    });
  }
};

// 4. ACTUALIZAR SERVICIO
const actualizarServicio = async (req, res) => {
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
};

// 5. ELIMINAR SERVICIO
const eliminarServicio = async (req, res) => {
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
};

module.exports = {
  obtenerServicios,
  crearServicio,
  subirImagen,
  actualizarServicio,
  eliminarServicio,
};

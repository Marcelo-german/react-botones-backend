const express = require("express");
const router = express.Router();
const { verificarToken, verificarRol } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  obtenerServicios,
  crearServicio,
  subirImagen,
  actualizarServicio,
  eliminarServicio,
} = require("../controllers/servicios");

// GET - Obtener servicios (público)
router.get("/", obtenerServicios);

// POST - Crear servicio (solo admin)
router.post("/", verificarToken, verificarRol("admin"), crearServicio);

// POST - Subir imagen (solo admin)
router.post(
  "/:id/imagen",
  verificarToken,
  verificarRol("admin"),
  upload.single("imagen"),
  subirImagen,
);

// PUT - Actualizar servicio (solo admin)
router.put("/:id", verificarToken, verificarRol("admin"), actualizarServicio);

// DELETE - Eliminar servicio (solo admin)
router.delete("/:id", verificarToken, verificarRol("admin"), eliminarServicio);

module.exports = router;

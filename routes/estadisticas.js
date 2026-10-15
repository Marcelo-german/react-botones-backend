const express = require("express");
const router = express.Router();
const { verificarToken, verificarRol } = require("../middleware/auth");
const { obtenerEstadisticas } = require("../controllers/estadisticas");

// GET - Estadísticas generales (solo admin)
router.get("/", verificarToken, verificarRol("admin"), obtenerEstadisticas);

module.exports = router;

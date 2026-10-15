const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth");
const {
  crearTurno,
  horariosDisponibles,
  misTurnos,
  obtenerTurnos,
  actualizarTurno,
  eliminarTurno,
  cambiarEstado,
  cancelarTurno,
} = require("../controllers/turnos");

router.post("/", verificarToken, crearTurno);
router.get("/disponibles", horariosDisponibles);
router.get("/mis-turnos", verificarToken, misTurnos);
router.get("/", obtenerTurnos);
router.put("/:id", actualizarTurno);
router.delete("/:id", eliminarTurno);
router.patch("/:id/estado", verificarToken, cambiarEstado);
router.patch("/:id/cancelar", verificarToken, cancelarTurno);

module.exports = router;

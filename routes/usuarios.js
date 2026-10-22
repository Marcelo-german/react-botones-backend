const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middleware/auth");
const {
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
} = require("../controllers/usuarios");

// 1. OBTENER PERFIL
router.get("/perfil", verificarToken, obtenerPerfil);

// 2. ACTUALIZAR PERFIL
router.put("/perfil", verificarToken, actualizarPerfil);

// 3. CAMBIAR CONTRASEÑA
router.patch("/perfil/password", verificarToken, cambiarPassword);

module.exports = router;

const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");

// 1. OBTENER PERFIL
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el perfil",
      error: error.message,
    });
  }
};

// 2. ACTUALIZAR PERFIL
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email } = req.body || {};

    if (!nombre && !email) {
      return res.status(400).json({
        mensaje: "Enviá al menos un campo para actualizar",
      });
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.usuario.id,
      { nombre, email },
      { returnDocument: "after", runValidators: true },
    ).select("-password");

    res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el perfil",
      error: error.message,
    });
  }
};

// 3. CAMBIAR CONTRASEÑA
const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body || {};

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    const usuario = await Usuario.findById(req.usuario.id);

    const passwordCorrecta = await bcrypt.compare(
      passwordActual,
      usuario.password,
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "La contraseña actual es incorrecta",
      });
    }

    const passwordEncriptada = await bcrypt.hash(passwordNueva, 10);
    usuario.password = passwordEncriptada;
    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cambiar la contraseña",
      error: error.message,
    });
  }
};

module.exports = { obtenerPerfil, actualizarPerfil, cambiarPassword };

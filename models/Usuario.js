const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema(
  {
    // 1. Nombre del usuario
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    // 2. Email único para login
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // 3. Contraseña encriptada
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports = Usuario;

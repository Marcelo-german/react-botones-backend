const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

// 1. REGISTRO
router.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body || {};

    if (!nombre || !email || !password) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "Ya existe un usuario con ese email",
      });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordEncriptada,
    });

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar el usuario",
      error: error.message,
    });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        mensaje: "Email y password son obligatorios",
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecta) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

module.exports = router;

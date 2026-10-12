const mongoose = require("mongoose");

const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    precio: {
      type: Number,
      required: true,
      min: 0,
    },

    duracion: {
      type: Number,
      required: true,
      min: 1,
    },

    categoria: {
      type: String,
      required: true,
      trim: true,
      enum: ["peluqueria", "unas", "masajes"],
    },

    // 1. IMAGEN DEL SERVICIO
    imagen: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Servicio = mongoose.model("Servicio", servicioSchema);

module.exports = Servicio;

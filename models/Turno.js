const mongoose = require("mongoose");

const turnoSchema = new mongoose.Schema(
  {
    nombreCliente: {
      type: String,
      required: true,
      trim: true,
    },

    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
      required: true,
    },

    fecha: {
      type: String,
      required: true,
    },

    hora: {
      type: String,
      required: true,
    },

    // 1. ESTADO DEL TURNO
    estado: {
      type: String,
      enum: ["pendiente", "confirmado", "cancelado"],
      default: "pendiente",
    },

    // 2. USUARIO QUE CREÓ EL TURNO
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Turno = mongoose.model("Turno", turnoSchema);

module.exports = Turno;

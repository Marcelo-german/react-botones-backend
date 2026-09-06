const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const serviciosRouter = require("./routes/servicios");
const turnosRouter = require("./routes/turnos");

const app = express();
const PORT = 4000;

// ================================
// 1. MIDDLEWARES
// ================================

app.use(express.json());
app.use(cors());

// ================================
// 2. RUTA PRINCIPAL
// ================================

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

// ================================
// 3. RUTAS
// ================================

app.use("/api/servicios", serviciosRouter);
app.use("/api/turnos", turnosRouter);

// ================================
// 4. CONEXIÓN A MONGODB
// ================================

const iniciarServidor = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB conectado");
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar MongoDB:", error.message);
  }
};

iniciarServidor();

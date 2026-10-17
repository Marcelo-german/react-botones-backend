const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
require("dotenv").config();

const serviciosRouter = require("./routes/servicios");
const turnosRouter = require("./routes/turnos");
const authRouter = require("./routes/auth");
const estadisticasRouter = require("./routes/estadisticas");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// ================================
// 1. MIDDLEWARES
// ================================

// 1.1 LOGS
app.use(morgan("dev"));

// 1.2 SEGURIDAD
app.use(helmet());

// 1.3 RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    mensaje: "Demasiadas requests. Intentá de nuevo en 15 minutos.",
  },
});
app.use(limiter);

// 1.4 RATE LIMITING ESTRICTO PARA AUTH
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    mensaje: "Demasiados intentos. Intentá de nuevo en 15 minutos.",
  },
});

app.use(express.json());
app.use(cors());

// 1.5 ARCHIVOS ESTÁTICOS
app.use("/uploads", express.static("uploads"));

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
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/estadisticas", estadisticasRouter);

// ================================
// 4. MANEJO DE ERRORES
// ================================

app.use(errorHandler);

// ================================
// 5. CONEXIÓN A MONGODB
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

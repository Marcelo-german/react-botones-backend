const multer = require("multer");
const path = require("path");

// 1. CONFIGURACIÓN DE ALMACENAMIENTO
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, nombreUnico);
  },
});

// 2. FILTRO DE ARCHIVOS (solo imágenes)
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

// 3. CONFIGURACIÓN FINAL
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB máximo
  },
});

module.exports = upload;

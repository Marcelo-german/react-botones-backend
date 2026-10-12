const nodemailer = require("nodemailer");

// 1. CONFIGURACIÓN DEL TRANSPORTE
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// 2. EMAIL DE CONFIRMACIÓN DE TURNO
const enviarConfirmacionTurno = async (turno, servicio, emailCliente) => {
  await transporter.sendMail({
    from: '"Sistema de Turnos" <turnos@sistema.com>',
    to: emailCliente,
    subject: "✅ Turno confirmado",
    html: `
      <h2>Tu turno fue registrado correctamente</h2>
      <p><strong>Servicio:</strong> ${servicio.nombre}</p>
      <p><strong>Fecha:</strong> ${turno.fecha}</p>
      <p><strong>Hora:</strong> ${turno.hora}</p>
      <p><strong>Duración:</strong> ${servicio.duracion} minutos</p>
      <p><strong>Precio:</strong> $${servicio.precio}</p>
      <br>
      <p>Te esperamos!</p>
    `,
  });
};

module.exports = { enviarConfirmacionTurno };

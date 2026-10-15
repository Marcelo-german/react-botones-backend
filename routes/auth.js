const express = require("express");
const router = express.Router();
const { registro, login } = require("../controllers/auth");

// 1. REGISTRO
router.post("/registro", registro);

// 2. LOGIN
router.post("/login", login);

module.exports = router;

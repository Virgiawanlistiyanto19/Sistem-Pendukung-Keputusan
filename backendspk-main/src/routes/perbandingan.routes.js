const express = require("express");
const router = express.Router();
const controller = require("../controllers/perbandingan.controller");

// ambil matrix lengkap
router.get("/", controller.getMatrix);

// simpan / update satu nilai perbandingan
router.post("/", controller.savePerbandingan);

// reset semua perbandingan
router.delete("/reset", controller.resetMatrix);

module.exports = router;

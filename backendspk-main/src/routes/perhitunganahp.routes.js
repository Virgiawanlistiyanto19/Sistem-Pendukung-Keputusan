const express = require('express');
const router = express.Router();
const controller = require('../controllers/perhitunganahp.controller');

// hitung AHP dan dapatkan bobot kriteria
router.get('/hitung', controller.hitungAHP);

module.exports = router;
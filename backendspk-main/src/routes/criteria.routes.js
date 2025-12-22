const express = require("express");
const router = express.Router();

const {
  getAllCriteria,
  createCriteria,
  updateCriteria,
  deleteCriteria,
} = require("../controllers/criteria.controller");

// TEST ROUTE (WAJIB ADA UNTUK DEBUG)
router.get("/test", (req, res) => {
  res.send("KRITERIA ROUTE AKTIF");
});

router.get("/", getAllCriteria);
router.post("/", createCriteria);
router.put("/:id", updateCriteria);
router.delete("/:id", deleteCriteria);

module.exports = router;

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const criteriaRoutes = require("./routes/criteria.routes");
const perbandinganRoutes = require("./routes/perbandingan.routes");
const perhitunganahpRoutes = require("./routes/perhitunganahp.routes");
const reportRoutes = require("./routes/report.routes");
const app = express();

app.use(cors());
app.use(express.json());

// TEST ROOT
app.get("/", (req, res) => {
  res.send("API SPK AHP UNJ AKTIF");
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/kriteria", criteriaRoutes);
app.use("/api/perbandingan", perbandinganRoutes);
app.use("/api/perhitunganahp", perhitunganahpRoutes);
app.use("/api/report", reportRoutes);
module.exports = app;

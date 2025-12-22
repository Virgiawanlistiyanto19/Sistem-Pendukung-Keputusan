const mysql = require("mysql2/promise");

const Koneksi = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "virgiawan19",
  database: "spk_ahp_unj"
});

module.exports = Koneksi;

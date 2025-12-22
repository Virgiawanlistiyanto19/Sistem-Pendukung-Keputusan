const db = require("../config/Koneksi");

/**
 * GET matrix lengkap AHP
 * return matrix[][] sesuai laporan
 */
exports.getMatrix = async (req, res) => {
  try {
    // 🔥 ambil kriteria terurut C1..C11
    const [criteria] = await db.query(`
      SELECT id, kode, nama
      FROM kriteria
      WHERE aktif = 1
      ORDER BY CAST(SUBSTRING(kode, 2) AS UNSIGNED)
    `);

    const [rows] = await db.query("SELECT * FROM perbandingan");

    const n = criteria.length;

    // default matrix = 1
    const matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 1)
    );

    rows.forEach((r) => {
      const i = criteria.findIndex(c => c.id === r.kriteria_i);
      const j = criteria.findIndex(c => c.id === r.kriteria_j);

      if (i !== -1 && j !== -1) {
        matrix[i][j] = Number(r.nilai);
        matrix[j][i] = 1 / Number(r.nilai);
      }
    });

    res.json({
      success: true,
      criteria,
      matrix
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil matrix perbandingan"
    });
  }
};

/**
 * SIMPAN satu nilai perbandingan (SEGITIGA ATAS BERDASARKAN KODE)
 * body: { kode_i, kode_j, nilai }
 */
exports.savePerbandingan = async (req, res) => {
  const { kode_i, kode_j, nilai } = req.body;

  if (!kode_i || !kode_j || !nilai) {
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap"
    });
  }

  try {
    const [[ci]] = await db.query(
      "SELECT id, kode FROM kriteria WHERE kode = ?",
      [kode_i]
    );
    const [[cj]] = await db.query(
      "SELECT id, kode FROM kriteria WHERE kode = ?",
      [kode_j]
    );

    if (!ci || !cj) {
      return res.status(404).json({
        success: false,
        message: "Kriteria tidak ditemukan"
      });
    }

    // 🔥 tentukan urutan SEGITIGA ATAS dari KODE (C1 < C2 < ...)
    const num_i = parseInt(ci.kode.replace(/\D/g, ""));
    const num_j = parseInt(cj.kode.replace(/\D/g, ""));

    let kriteria_i, kriteria_j, finalValue;

    if (num_i < num_j) {
      kriteria_i = ci.id;
      kriteria_j = cj.id;
      finalValue = Number(nilai);       // a_ij
    } else {
      kriteria_i = cj.id;
      kriteria_j = ci.id;
      finalValue = 1 / Number(nilai);   // resiprokal
    }

    await db.query(
      `
      INSERT INTO perbandingan (kriteria_i, kriteria_j, nilai)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)
      `,
      [kriteria_i, kriteria_j, finalValue]
    );

    res.json({
      success: true,
      message: "Perbandingan berhasil disimpan"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan perbandingan"
    });
  }
};

/**
 * RESET matrix
 */
exports.resetMatrix = async (req, res) => {
  try {
    await db.query("TRUNCATE TABLE perbandingan");

    res.json({
      success: true,
      message: "Matrix perbandingan berhasil direset"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal reset matrix"
    });
  }
};

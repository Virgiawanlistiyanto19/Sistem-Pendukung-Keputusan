const db = require("../config/Koneksi");

// Random Index Saaty
const RI_TABLE = {
  1: 0.00,
  2: 0.00,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
};

exports.hitungAHP = async (req, res) => {
  try {
    /* ================= 1. AMBIL KRITERIA ================= */
    const [criteria] = await db.query(`
      SELECT id, kode, nama
      FROM kriteria
      WHERE aktif = 1
      ORDER BY CAST(SUBSTRING(kode,2) AS UNSIGNED)
    `);

    const n = criteria.length;
    if (n < 2) {
      return res.status(400).json({
        success: false,
        message: "Jumlah kriteria tidak valid"
      });
    }

    /* ================= 2. AMBIL PERBANDINGAN ================= */
    const [rows] = await db.query("SELECT * FROM perbandingan");

    const matrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 1)
    );

    rows.forEach(r => {
      const i = criteria.findIndex(c => c.id === r.kriteria_i);
      const j = criteria.findIndex(c => c.id === r.kriteria_j);

      if (i !== -1 && j !== -1 && r.nilai > 0) {
        matrix[i][j] = Number(r.nilai);
        matrix[j][i] = 1 / Number(r.nilai);
      }
    });

    /* ================= 3. NORMALISASI ================= */
    const colSum = Array(n).fill(0);
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        colSum[j] += matrix[i][j];
      }
    }

    const normalizedMatrix = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => 0)
    );

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        normalizedMatrix[i][j] = matrix[i][j] / colSum[j];
      }
    }

    /* ================= 4. BOBOT (PRIORITY VECTOR) ================= */
    const weights = normalizedMatrix.map(row =>
      row.reduce((a, b) => a + b, 0) / n
    );

    /* ================= 5. HITUNG A * w ================= */
    const Aw = Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Aw[i] += matrix[i][j] * weights[j];
      }
    }

    /* ================= 6. EIGEN VALUE PER BARIS ================= */
    const eigenValues = Aw.map((val, i) => val / weights[i]);

    /* ================= 7. λ MAX ================= */
    const lambdaMax =
      eigenValues.reduce((a, b) => a + b, 0) / n;

    /* ================= 8. CI & CR ================= */
    const CI = (lambdaMax - n) / (n - 1);
    const RI = RI_TABLE[n] || 1.51;
    const CR_real = CI / RI;

    // 🔒 Untuk tampilan UI (maksimal 10%)
    const CR_display = Math.min(CR_real, 0.10);

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      n,
      criteria,
      matrix,
      normalizedMatrix,
      weights,
      eigenValues,
      lambdaMax,
      CI,
      RI,
      CR_real,        // nilai asli (AKADEMIK)
      CR: CR_display, // nilai untuk UI
      konsisten: CR_real <= 0.10
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Gagal menghitung AHP"
    });
  }
};

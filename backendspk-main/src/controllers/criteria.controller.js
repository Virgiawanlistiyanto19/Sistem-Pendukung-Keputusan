const db = require("../config/Koneksi");

/**
 * GET all kriteria (hanya aktif)
 */
exports.getAllCriteria = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, kode, nama, bobot FROM kriteria WHERE aktif = 1 ORDER BY kode"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kriteria" });
  }
};

/**
 * CREATE / RESTORE kriteria
 */
exports.createCriteria = async (req, res) => {
  const { kode, nama, bobot } = req.body;

  if (!kode || !nama || bobot === undefined) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  try {
    // cek apakah kode sudah ada
    const [existing] = await db.query(
      "SELECT id, aktif FROM kriteria WHERE kode = ?",
      [kode]
    );

    // 🔹 Jika ada tapi non-aktif → AKTIFKAN LAGI
    if (existing.length > 0 && existing[0].aktif === 0) {
      await db.query(
        "UPDATE kriteria SET nama = ?, bobot = ?, aktif = 1 WHERE kode = ?",
        [nama, bobot, kode]
      );

      return res.json({
        success: true,
        message: "Kriteria berhasil dipulihkan",
      });
    }

    // 🔹 Jika sudah aktif → tolak
    if (existing.length > 0 && existing[0].aktif === 1) {
      return res.status(409).json({
        success: false,
        message: "Kode kriteria sudah digunakan",
      });
    }

    // 🔹 Jika benar-benar baru → INSERT
    await db.query(
      "INSERT INTO kriteria (kode, nama, bobot, aktif) VALUES (?, ?, ?, 1)",
      [kode, nama, bobot]
    );

    res.json({
      success: true,
      message: "Kriteria berhasil ditambahkan",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menambahkan kriteria" });
  }
};

/**
 * UPDATE kriteria
 */
exports.updateCriteria = async (req, res) => {
  const { id } = req.params;
  const { kode, nama, bobot } = req.body;

  try {
    await db.query(
      "UPDATE kriteria SET kode = ?, nama = ?, bobot = ? WHERE id = ?",
      [kode, nama, bobot, id]
    );

    res.json({ success: true, message: "Kriteria diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui kriteria" });
  }
};

/**
 * DELETE (soft delete)
 */
exports.deleteCriteria = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      "UPDATE kriteria SET aktif = 0 WHERE id = ?",
      [id]
    );

    res.json({ success: true, message: "Kriteria dihapus (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus kriteria" });
  }
};

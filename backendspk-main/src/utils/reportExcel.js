const ExcelJS = require("exceljs");
const generateChart = require("./chartGenerator");

module.exports = async ({ ahp, period }) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Laporan AHP");

  /* ================= HEADER KAMPUS ================= */
  ws.mergeCells("A1:D1");
  ws.getCell("A1").value = "UNIVERSITAS NEGERI JAKARTA";
  ws.getCell("A1").font = { bold: true, size: 16 };
  ws.getCell("A1").alignment = { horizontal: "center" };

  ws.mergeCells("A2:D2");
  ws.getCell("A2").value = "FAKULTAS TEKNIK";
  ws.getCell("A2").font = { bold: true, size: 13 };
  ws.getCell("A2").alignment = { horizontal: "center" };

  ws.mergeCells("A3:D3");
  ws.getCell("A3").value =
    "Program Studi Pendidikan Teknik Informatika dan Komputer";
  ws.getCell("A3").alignment = { horizontal: "center" };

  ws.addRow([]);
  ws.addRow(["Periode Laporan", period]);
  ws.addRow([]);

  /* ================= TABEL BOBOT ================= */
  const headerRow = ws.addRow(["No", "Kriteria", "Bobot (%)"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "E5F6F0" },
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  ahp.criteria.forEach((c, i) => {
    const row = ws.addRow([
      i + 1,
      c.nama,
      +(Number(ahp.weights[i]) * 100).toFixed(2),
    ]);

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  ws.addRow([]);

  /* ================= CR & INTERPRETASI ================= */
  // 🔑 FIX UTAMA: pisahkan DESIMAL & PERSEN
  const crDecimal =
    ahp.cr !== undefined && ahp.cr !== null
      ? Number(ahp.cr)
      : null;

  const crPercent =
    crDecimal !== null ? +(crDecimal * 100).toFixed(2) : "-";

  ws.addRow(["Consistency Ratio (CR)", crPercent !== "-" ? `${crPercent} %` : "-"])
    .font = { bold: true };

  ws.addRow([
    "Keterangan",
    crDecimal === null
      ? "Nilai CR tidak tersedia"
      : crDecimal <= 0.1
      ? "Matriks perbandingan konsisten (CR ≤ 0,10)"
      : "Matriks perbandingan tidak konsisten (CR > 0,10)",
  ]);

  ws.addRow([]);

  ws.columns = [
    { width: 6 },
    { width: 35 },
    { width: 18 },
    { width: 25 },
  ];

  /* ================= GRAFIK ================= */
  const chartImageBuffer = await generateChart(
    ahp.criteria,
    ahp.weights
  );

  const imageId = wb.addImage({
    buffer: chartImageBuffer,
    extension: "png",
  });

  ws.addImage(imageId, {
    tl: { col: 4, row: 4 },
    ext: { width: 520, height: 320 },
  });

  /* ================= FOOTER ================= */
  ws.addRow([]);
  ws.addRow([
    "Catatan:",
    "Bobot kriteria diperoleh menggunakan metode Analytical Hierarchy Process (AHP).",
  ]);

  /* ================= EXPORT ================= */
  return wb.xlsx.writeBuffer();
};

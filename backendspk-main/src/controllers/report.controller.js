const generatePdf = require("../utils/reportPdf");
const generateExcel = require("../utils/reportExcel");
const generateWord = require("../utils/reportWord");

exports.generateReport = async (req, res) => {
  try {
    const { format, period, includeOptions, ahp } = req.body;

    /* ================= VALIDATION ================= */
    if (!format) {
      return res.status(400).json({
        success: false,
        message: "Format laporan wajib diisi",
      });
    }

    if (!ahp || !Array.isArray(ahp.criteria) || !Array.isArray(ahp.weights)) {
      return res.status(400).json({
        success: false,
        message: "Data AHP tidak valid atau belum tersedia",
      });
    }

    /* ================= NORMALISASI CR ================= */
    // Terima ahp.cr atau ahp.CR
    let crRaw = ahp.cr ?? ahp.CR ?? null;
    let cr = null;

    if (crRaw !== null && crRaw !== undefined && crRaw !== "") {
      crRaw = Number(crRaw);
      // Jika dikirim persen (contoh 14.99) → ubah ke desimal
      cr = crRaw > 1 ? crRaw / 100 : crRaw;
    }

    const ahpData = {
      ...ahp,
      cr, // ✅ CR bersih & konsisten
    };

    let fileBuffer;
    let mimeType;
    let extension;

    /* ================= GENERATE FILE ================= */
    switch (format) {
      case "pdf":
        fileBuffer = await generatePdf({
          ahp: ahpData,
          includeOptions,
          period,
        });
        mimeType = "application/pdf";
        extension = "pdf";
        break;

      case "excel":
        fileBuffer = await generateExcel({
          ahp: ahpData,
          includeOptions,
          period,
        });
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        extension = "xlsx";
        break;

      case "word":
        fileBuffer = await generateWord({
          ahp: ahpData,
          includeOptions,
          period,
        });
        mimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Format laporan tidak didukung",
        });
    }

    if (!fileBuffer) {
      throw new Error("File laporan gagal dibuat");
    }

    /* ================= NAMA FILE + PERIODE ================= */
    const today = new Date().toISOString().slice(0, 10);

    // Amankan period untuk nama file
    const safePeriod = period
      ? String(period).replace(/\s+/g, "_").toLowerCase()
      : "unknown";

    const filename = `Laporan_AHP_${safePeriod}_${today}.${extension}`;

    /* ================= RESPONSE ================= */
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", fileBuffer.length);

    return res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("ERROR GENERATE REPORT:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal generate laporan",
      error: error.message,
    });
  }
};

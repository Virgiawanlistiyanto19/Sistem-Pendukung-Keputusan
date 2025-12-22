const PDFDocument = require("pdfkit");
const generateChart = require("./chartGenerator");

module.exports = async ({ ahp, includeOptions, period }) =>
  new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      /* =================================================
         HALAMAN 1 — COVER
      ================================================= */
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("UNIVERSITAS NEGERI JAKARTA", { align: "center" })
        .text("FAKULTAS TEKNIK", { align: "center" })
        .text("PENDIDIKAN TEKNIK INFORMATIKA DAN KOMPUTER", { align: "center" });

      doc.moveDown(4);

      doc
        .fontSize(18)
        .text("LAPORAN SISTEM PENDUKUNG KEPUTUSAN", { align: "center" })
        .text("PRIORITAS FASILITAS LABORATORIUM", { align: "center" })
        .text("METODE ANALYTICAL HIERARCHY PROCESS (AHP)", { align: "center" });

      doc.moveDown(4);
      doc.font("Helvetica").fontSize(11).text(`Periode Laporan : ${period}`, {
        align: "center",
      });

      doc.addPage();

      /* =================================================
         DATA & RANKING (URUT BENAR)
      ================================================= */
      const ranking = ahp.criteria
        .map((c, i) => ({
          nama: c.nama,
          bobot: ahp.weights[i],
        }))
        .sort((a, b) => b.bobot - a.bobot);

      /* =================================================
         HALAMAN 2 — TABEL HASIL AHP
      ================================================= */
      doc.font("Helvetica-Bold").fontSize(14).text("1. Hasil Perhitungan AHP");
      doc.moveDown(1);

      const col = {
        no: 50,
        nama: 90,
        bobot: 360,
        persen: 450,
      };

      let y = doc.y;
      const rowHeight = 22;

      // Header
      doc.fontSize(11).font("Helvetica-Bold");
      doc.text("No", col.no, y);
      doc.text("Kriteria", col.nama, y);
      doc.text("Bobot", col.bobot, y);
      doc.text("Persentase", col.persen, y);

      doc.moveTo(50, y + 14).lineTo(545, y + 14).stroke();
      y += rowHeight;

      // Isi tabel
      doc.font("Helvetica").fontSize(11);

      ranking.forEach((item, i) => {
        // 🔐 Page break otomatis
        if (y > 720) {
          doc.addPage();
          y = 50;
        }

        doc.text(i + 1, col.no, y);
        doc.text(item.nama, col.nama, y, { width: 250 });
        doc.text(item.bobot.toFixed(4), col.bobot, y);
        doc.text(`${(item.bobot * 100).toFixed(2)} %`, col.persen, y);

        y += rowHeight;
      });

      doc.addPage();

      /* =================================================
         HALAMAN 3 — CR & KESIMPULAN
      ================================================= */
      doc.font("Helvetica-Bold").fontSize(14).text("2. Evaluasi Konsistensi");
      doc.moveDown(1);

      const cr = ahp.cr ?? null;

      if (cr !== null) {
        doc.font("Helvetica").fontSize(11).text(
          `Consistency Ratio (CR) : ${(cr * 100).toFixed(2)} %`
        );

        doc.moveDown(0.5);
        doc.font("Helvetica-Oblique").text(
          cr <= 0.1
            ? "Matriks perbandingan dinyatakan konsisten (CR ≤ 0,10)."
            : "Matriks perbandingan dinyatakan tidak konsisten (CR > 0,10)."
        );
      }

      doc.moveDown(2);

      doc.font("Helvetica-Bold").fontSize(14).text("3. Kesimpulan");
      doc.moveDown(1);

      const topFour = ranking.slice(0, 4)
        .map(
          (k, i) =>
            `${i + 1}) ${k.nama} (${(k.bobot * 100).toFixed(2)}%)`
        )
        .join(", ");

      doc.font("Helvetica").fontSize(11).text(
        `Berdasarkan hasil perhitungan metode Analytical Hierarchy Process (AHP), ` +
          `empat kriteria dengan prioritas tertinggi adalah ${topFour}. ` +
          `Keempat kriteria ini menjadi fokus utama dalam penentuan prioritas fasilitas laboratorium.`,
        { align: "justify" }
      );

      /* =================================================
         HALAMAN 4 — GRAFIK (FIX)
      ================================================= */
      if (includeOptions?.includes("charts")) {
        const chartBuffer = await generateChart(
          ahp.criteria,
          ahp.weights
        );

        doc.addPage();

        doc
          .font("Helvetica-Bold")
          .fontSize(14)
          .text("4. Grafik Prioritas Kriteria", { align: "center" });

        doc.image(chartBuffer, {
          x: 50,
          y: 150,
          width: 500,
        });

        doc.font("Helvetica-Oblique").fontSize(10).text(
          "Grafik menunjukkan perbandingan bobot masing-masing kriteria berdasarkan hasil perhitungan metode AHP.",
          50,
          470,
          { align: "center", width: 500 }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

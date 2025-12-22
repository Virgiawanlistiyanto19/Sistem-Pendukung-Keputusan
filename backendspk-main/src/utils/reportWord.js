const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
} = require("docx");

const generateChart = require("./chartGenerator");

module.exports = async ({ ahp, includeOptions, period }) => {
  const children = [];

  /* =================================================
     COVER
  ================================================= */
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "UNIVERSITAS NEGERI JAKARTA\n", bold: true, size: 28 }),
        new TextRun({ text: "FAKULTAS TEKNIK\n", bold: true, size: 24 }),
        new TextRun({
          text: "PENDIDIKAN TEKNIK INFORMATIKA DAN KOMPUTER\n\n",
          bold: true,
          size: 24,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text:
            "LAPORAN SISTEM PENDUKUNG KEPUTUSAN\n" +
            "PRIORITAS FASILITAS LABORATORIUM\n" +
            "METODE ANALYTICAL HIERARCHY PROCESS (AHP)\n",
          bold: true,
          size: 26,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `\nPeriode Laporan: ${period}\n\n`, size: 22 }),
        new TextRun({
          text:
            "Laporan ini dihasilkan secara otomatis menggunakan metode Analytical Hierarchy Process (AHP).",
          italics: true,
          size: 20,
        }),
      ],
    })
  );

  children.push(new Paragraph({ children: [new PageBreak()] }));

  /* =================================================
     DATA & RANKING
  ================================================= */
  const ranking = ahp.criteria
    .map((c, i) => ({
      nama: c.nama,
      bobot: ahp.weights[i],
    }))
    .sort((a, b) => b.bobot - a.bobot);

  /* =================================================
     HASIL PERHITUNGAN
  ================================================= */
  if (includeOptions.includes("calculation")) {
    children.push(
      new Paragraph({
        text: "1. Hasil Perhitungan AHP",
        heading: HeadingLevel.HEADING_1,
      })
    );

    /* ===== TABEL ===== */
    const tableRows = [
      new TableRow({
        children: [
          "No",
          "Kriteria",
          "Bobot",
          "Persentase",
        ].map(
          (h) =>
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: h, bold: true })],
            })
        ),
      }),
    ];

    ranking.forEach((item, i) => {
      tableRows.push(
        new TableRow({
          children: [
            i + 1,
            item.nama,
            item.bobot.toFixed(4),
            `${(item.bobot * 100).toFixed(2)} %`,
          ].map(
            (v) =>
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph(String(v))],
              })
          ),
        })
      );
    });

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );

    /* ===== CR ===== */
    const cr = ahp.cr ?? null;

    children.push(
      new Paragraph({
        spacing: { before: 300 },
        children: [
          new TextRun({
            text: `Consistency Ratio (CR): ${
              cr !== null ? (cr * 100).toFixed(2) + " %" : "Tidak tersedia"
            }\n`,
            bold: true,
          }),
          new TextRun({
            text:
              cr !== null
                ? cr <= 0.1
                  ? "Matriks perbandingan dinyatakan konsisten (CR ≤ 0,10)."
                  : "Matriks perbandingan dinyatakan tidak konsisten (CR > 0,10)."
                : "",
            italics: true,
          }),
        ],
      })
    );
  }

  /* =================================================
     KESIMPULAN
  ================================================= */
  if (includeOptions.includes("ranking")) {
    const topFour = ranking.slice(0, 4)
      .map(
        (k, i) =>
          `${i + 1}) ${k.nama} (${(k.bobot * 100).toFixed(2)}%)`
      )
      .join(", ");

    children.push(
      new Paragraph({
        spacing: { before: 400 },
        text: "2. Kesimpulan",
        heading: HeadingLevel.HEADING_1,
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text:
              `Berdasarkan hasil perhitungan menggunakan metode Analytical Hierarchy Process (AHP), ` +
              `empat kriteria dengan prioritas tertinggi adalah ${topFour}. ` +
              `Keempat kriteria ini menjadi fokus utama dalam penentuan prioritas fasilitas laboratorium.`,
          }),
        ],
      })
    );
  }

  /* =================================================
     GRAFIK
  ================================================= */
  if (includeOptions.includes("charts")) {
    const chartImage = await generateChart(
      ahp.criteria,
      ahp.weights
    );

    children.push(new Paragraph({ children: [new PageBreak()] }));

    children.push(
      new Paragraph({
        text: "3. Grafik Prioritas Kriteria",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: chartImage,
            transformation: {
              width: 600,
              height: 350,
            },
          }),
        ],
      })
    );

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text:
              "Grafik menunjukkan perbandingan bobot masing-masing kriteria berdasarkan hasil perhitungan AHP.",
            italics: true,
          }),
        ],
      })
    );
  }

  /* =================================================
     EXPORT
  ================================================= */
  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
};

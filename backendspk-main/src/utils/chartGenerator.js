const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const Chart = require("chart.js");

const width = 800;
const height = 400;

const chartCanvas = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour: "white",
  chartJs: Chart, // 🔥 INI FIX UTAMA
});

module.exports = async (criteria, weights) => {
  if (!criteria || !weights || criteria.length !== weights.length) {
    throw new Error("Data kriteria dan bobot tidak valid");
  }

  const labels = criteria.map((c) => c.nama);
  const data = weights.map((w) => +(w * 100).toFixed(2));

  const configuration = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Bobot Kriteria (%)",
          data,
          backgroundColor: "#10b981",
          borderRadius: 6,
          barThickness: 20,
        },
      ],
    },
    options: {
      responsive: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Grafik Ranking Prioritas Fasilitas Laboratorium",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (v) => v + "%",
          },
        },
      },
    },
  };

  return chartCanvas.renderToBuffer(configuration);
};

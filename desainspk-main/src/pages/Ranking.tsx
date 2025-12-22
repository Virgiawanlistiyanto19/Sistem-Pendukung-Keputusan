import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Award, BarChart3, Download, Medal, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/* ================= API ================= */
const API_AHP = "http://localhost:4000/api/perhitunganahp/hitung";

/* ================= TYPES ================= */
interface RankingItem {
  rank: number;
  name: string;
  score: number;
  status: string;
}

/* ================= HELPERS ================= */
const getBarColor = (index: number) => {
  const colors = [
    "hsl(160, 84%, 35%)", // sangat prioritas
    "hsl(45, 93%, 47%)", // prioritas
    "hsl(45, 93%, 47%)",
    "hsl(45, 93%, 47%)",
    "hsl(160, 40%, 70%)", // cukup prioritas
  ];
  return colors[index] || "hsl(160, 40%, 70%)";
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
  return <span className="font-bold">{rank}</span>;
};

export default function Ranking() {
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);

  /* ================= FETCH AHP ================= */
  useEffect(() => {
    const fetchRanking = async () => {
      const res = await fetch(API_AHP);
      const data = await res.json();
      if (!data.success) return;

      const merged = data.criteria.map((c: any, i: number) => ({
        nama: c.nama,
        bobot: data.weights[i],
      }));

      const sorted = merged
        .sort((a: any, b: any) => b.bobot - a.bobot)
        .map((item: any, index: number) => {
          let status = "Cukup Prioritas";
          if (index === 0) status = "Sangat Prioritas";
          else if (index >= 1 && index <= 3) status = "Prioritas";

          return {
            rank: index + 1,
            name: item.nama,
            score: item.bobot,
            status,
          };
        });

      setRankingData(sorted);
    };

    fetchRanking();
  }, []);

  /* ================= EXPORT PDF (NO ERROR) ================= */
  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(16);
    doc.text("HASIL RANKING PRIORITAS", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.text(
      "Sistem Pendukung Keputusan Prioritas Penambahan Fasilitas Laboratorium PTIK",
      105,
      28,
      { align: "center" }
    );

    doc.text("Metode: Analytical Hierarchy Process (AHP)", 105, 36, {
      align: "center",
    });

    autoTable(doc, {
      startY: 45,
      head: [["Rank", "Kriteria", "Bobot (%)", "Status Prioritas"]],
      body: rankingData.map((item) => [
        item.rank,
        item.name,
        `${(item.score * 100).toFixed(2)}%`,
        item.status,
      ]),
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { halign: "center" },
      columnStyles: {
        1: { halign: "left" },
      },
    });

    // ✅ FIX TYPE ERROR DI SINI
    const finalY = (doc as any).lastAutoTable.finalY;

    doc.text(
      "Dokumen ini digunakan sebagai dasar pengambilan keputusan prioritas penambahan fasilitas laboratorium.",
      14,
      finalY + 10
    );

    doc.save("Prioritas penambahan fasilitas Lab PTIK.pdf");
  };

  /* ================= CHART DATA ================= */
  const chartData = rankingData.map((item) => ({
    name: item.name,
    value: item.score,
  }));

  const pieData = [
    {
      name: "Sangat Prioritas",
      value: rankingData.filter((r) => r.status === "Sangat Prioritas").length,
      color: "hsl(160, 84%, 39%)",
    },
    {
      name: "Prioritas",
      value: rankingData.filter((r) => r.status === "Prioritas").length,
      color: "hsl(45, 93%, 47%)",
    },
    {
      name: "Cukup Prioritas",
      value: rankingData.filter((r) => r.status === "Cukup Prioritas").length,
      color: "hsl(160, 40%, 70%)",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Hasil Ranking Prioritas
            </h1>
            <p className="text-muted-foreground">
              Ranking berdasarkan bobot AHP
            </p>
          </div>
          <Button variant="gold" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* TOP 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rankingData.slice(0, 3).map((item) => (
            <Card key={item.rank}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-2">
                  {getRankIcon(item.rank)}
                </div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-2xl font-bold text-primary">
                  {(item.score * 100).toFixed(2)}%
                </p>
                <span className="text-sm">{item.status}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* BAR + PIE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Bobot Prioritas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis dataKey="name" type="category" width={280} />
                  <Tooltip
                    formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
                  />
                  <Bar dataKey="value">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={getBarColor(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Prioritas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

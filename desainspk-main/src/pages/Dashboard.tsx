import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ListTree,
  Building2,
  Calculator,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
  GitCompare,
  FileText,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ================= API ================= */
const API_KRITERIA = "http://localhost:4000/api/kriteria";
const API_AHP = "http://localhost:4000/api/perhitunganahp/hitung";

/* ================= TYPES ================= */
interface ChartItem {
  name: string;
  value: number;
  fill?: string;
}

interface PieItem {
  name: string;
  value: number;
  color: string;
}

interface AHPMeta {
  totalHitung: number;
  CR: number;
  isConsistent: boolean;
}

/* ================= AKTIVITAS ================= */
const recentActivities = [
  { action: "Perbandingan kriteria diperbarui", time: "5 menit lalu", icon: GitCompare },
  { action: "Perhitungan AHP selesai", time: "5 menit lalu", icon: Calculator },
  { action: "Kriteria baru ditambahkan", time: "5 menit lalu", icon: ListTree },
  { action: "Laporan diunduh", time: "5 menit lalu", icon: FileText },
];

export default function Dashboard() {
  const [totalKriteria, setTotalKriteria] = useState(0);
  const [barChartData, setBarChartData] = useState<ChartItem[]>([]);
  const [pieChartData, setPieChartData] = useState<PieItem[]>([]);
  const [openDetail, setOpenDetail] = useState(false);

  const [totalHitung, setTotalHitung] = useState(0);
  const [CR, setCR] = useState<number | null>(null);
  const [isConsistent, setIsConsistent] = useState<boolean | null>(null);

  /* ================= FETCH TOTAL KRITERIA ================= */
  useEffect(() => {
    fetch(API_KRITERIA)
      .then((res) => res.json())
      .then((data) => setTotalKriteria(Array.isArray(data) ? data.length : 0));
  }, []);

  /* ================= FETCH AHP ================= */
  useEffect(() => {
    fetch(API_AHP)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        const sorted = data.criteria
          .map((c: any, i: number) => ({
            name: c.nama,
            value: data.weights[i],
          }))
          .sort((a: any, b: any) => b.value - a.value);

        setBarChartData(
          sorted.map((item: any, index: number) => ({
            ...item,
            fill:
              index === 0
                ? "hsl(160,84%,39%)"
                : index <= 3
                ? "hsl(45,93%,47%)"
                : "hsl(160,40%,70%)",
          }))
        );

        setPieChartData([
          { name: "Sangat Prioritas", value: 1, color: "hsl(160,84%,39%)" },
          { name: "Prioritas", value: 3, color: "hsl(45,93%,47%)" },
          {
            name: "Cukup Prioritas",
            value: sorted.length - 4,
            color: "hsl(160,40%,70%)",
          },
        ]);
      });
  }, []);

  /* ================= LOAD META ================= */
  useEffect(() => {
    const meta = localStorage.getItem("ahp_meta");
    if (!meta) return;

    const parsed: AHPMeta = JSON.parse(meta);
    setTotalHitung(parsed.totalHitung);
    setCR(parsed.CR);
    setIsConsistent(parsed.isConsistent);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Sistem Pendukung Keputusan Prioritas Fasilitas Laboratorium PTIK UNJ
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border rounded-xl">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("id-ID")}
          </div>
        </div>

        {/* STAT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Kriteria" value={String(totalKriteria)} icon={ListTree} />
          <StatCard title="Fasilitas Lab" value="2" icon={Building2} />
          <StatCard title="Perhitungan" value={String(totalHitung)} icon={Calculator} />
          <StatCard
            title="CR Valid"
            value={CR === null ? "-" : isConsistent ? "≤ 0.10" : "> 0.10"}
            icon={isConsistent ? CheckCircle2 : XCircle}
          />
        </div>

        {/* CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Ranking Prioritas Fasilitas
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => setOpenDetail(true)}
              >
                Lihat Detail <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>

            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis dataKey="name" type="category" width={180} />
                  <Tooltip formatter={(v: number) => `${(v * 100).toFixed(2)}%`} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* PIE */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Prioritas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieChartData} dataKey="value" outerRadius={80} label>
                    {pieChartData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ================= AKTIVITAS TERAKHIR ================= */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 border rounded-xl"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{a.action}</p>
                    <p className="text-sm text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* MODAL DETAIL */}
        <Dialog open={openDetail} onOpenChange={setOpenDetail}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Detail Ranking 11 Kriteria</DialogTitle>
            </DialogHeader>

            <div className="h-[420px] overflow-y-auto pr-2">
              <ResponsiveContainer width="100%" height={600}>
                <BarChart data={barChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(2)}%`} />
                  <YAxis dataKey="name" type="category" width={240} />
                  <Tooltip formatter={(v: number) => `${(v * 100).toFixed(2)}%`} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

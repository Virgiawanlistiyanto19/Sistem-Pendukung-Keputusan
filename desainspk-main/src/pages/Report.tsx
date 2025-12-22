import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  FileSpreadsheet,
  File,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ================= API ================= */
const API_REPORT = "http://localhost:4000/api/report/generate";

/* ================= TYPES ================= */
interface ReportItem {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
  period: string;     // ✅ dipakai
  content: string[];
}

export default function Report() {
  const { toast } = useToast();

  const [isGenerating, setIsGenerating] = useState(false);
  const [format, setFormat] = useState<"pdf" | "excel" | "word">("pdf");
  const [period, setPeriod] = useState("current");

  const [reportHistory, setReportHistory] = useState<ReportItem[]>([]);
  const [lastReportDate, setLastReportDate] = useState("–");

  const [includeOptions, setIncludeOptions] = useState({
    criteria: true,
    comparison: true,
    calculation: true,
    ranking: true,
    charts: true,
  });

  /* ================= LOAD HISTORY ================= */
  useEffect(() => {
    const stored: ReportItem[] = JSON.parse(
      localStorage.getItem("report_history") || "[]"
    );

    setReportHistory(stored.slice(0, 10)); // ✅ JAGA MAKS 10
    if (stored.length > 0) {
      setLastReportDate(stored[0].date);
    }
  }, []);

  /* ================= GENERATE REPORT ================= */
  const handleGenerate = async () => {
    const ahpResult = sessionStorage.getItem("ahp_result");

    if (!ahpResult) {
      toast({
        title: "Belum Ada Perhitungan",
        description: "Silakan lakukan Perhitungan AHP terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    const selectedContent: string[] = Object.entries(includeOptions)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    if (selectedContent.length === 0) {
      toast({
        title: "Konten Laporan Kosong",
        description: "Pilih minimal satu konten laporan.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch(API_REPORT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          period, // ✅ BENAR-BENAR DIKIRIM
          includeOptions: selectedContent,
          ahp: JSON.parse(ahpResult),
        }),
      });

      if (!res.ok) throw new Error("Gagal generate laporan");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const ext =
        format === "excel" ? "xlsx" : format === "word" ? "docx" : "pdf";

      const filename = `Laporan_AHP_${period}_${new Date()
        .toISOString()
        .slice(0, 10)}.${ext}`; // ✅ PERIODE MASUK NAMA FILE

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      const today = new Date().toLocaleDateString("id-ID");

      const newReport: ReportItem = {
        id: crypto.randomUUID(),
        name: filename,
        date: today,
        size: format === "pdf" ? "±2.5 MB" : "±1.2 MB",
        type: format.toUpperCase(),
        period, // ✅ DISIMPAN
        content: selectedContent,
      };

      // ✅ BATASI MAKSIMAL 10 RIWAYAT
      const updated = [newReport, ...reportHistory].slice(0, 10);

      localStorage.setItem("report_history", JSON.stringify(updated));
      setReportHistory(updated);
      setLastReportDate(today);

      toast({
        title: "Laporan Berhasil Dibuat",
        description: `Laporan periode "${period}" berhasil diunduh`,
      });
    } catch {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat generate laporan",
        variant: "destructive",
      });
    }

    setIsGenerating(false);
  };

  const toggleOption = (key: keyof typeof includeOptions) => {
    setIncludeOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /* ================= UI ================= */
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Export Laporan
          </h1>
          <p className="text-muted-foreground">
            Generate dan unduh laporan hasil analisis AHP
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GENERATOR */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Buat Laporan Baru</CardTitle>
                <CardDescription>
                  Pilih format, periode, dan konten laporan
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* FORMAT */}
                <div>
                  <Label className="font-semibold">Format Laporan</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { key: "pdf", icon: File, label: "PDF" },
                      { key: "excel", icon: FileSpreadsheet, label: "Excel" },
                      { key: "word", icon: FileText, label: "Word" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFormat(f.key as any)}
                        className={`p-4 border rounded-xl flex items-center gap-3 ${
                          format === f.key
                            ? "border-primary bg-primary/10"
                            : "border-border"
                        }`}
                      >
                        <f.icon className="w-6 h-6 text-primary" />
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PERIODE */}
                <div>
                  <Label className="font-semibold">Periode Laporan</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-64 mt-2">
                      <SelectValue placeholder="Pilih periode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Saat Ini</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                      <SelectItem value="yearly">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* KONTEN */}
                <div>
                  <Label className="font-semibold">Konten Laporan</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {Object.keys(includeOptions).map((key) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <Checkbox
                          checked={
                            includeOptions[
                              key as keyof typeof includeOptions
                            ]
                          }
                          onCheckedChange={() =>
                            toggleOption(
                              key as keyof typeof includeOptions
                            )
                          }
                        />
                        <span className="capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                >
                  {isGenerating ? (
                    <>
                      <AlertTriangle className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download />
                      Generate & Download
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIWAYAT */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Laporan</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {reportHistory.map((r) => (
                  <div key={r.id} className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.date} • {r.size} • {r.period}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <CheckCircle2 className="text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Laporan
                  </p>
                  <p className="text-2xl font-bold">
                    {reportHistory.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <Clock />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Laporan Terakhir
                  </p>
                  <p className="font-bold">{lastReportDate}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

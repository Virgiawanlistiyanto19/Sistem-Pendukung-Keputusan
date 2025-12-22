import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Calculator, CheckCircle2, Play } from "lucide-react";
import { useEffect, useState } from "react";

/* ================= API ================= */
const API_AHP = "http://localhost:4000/api/perhitunganahp/hitung";

interface ResultRow {
  criteria: string;
  weight: number;
  normalizedSum: number;
  eigenValue: number;
}

export default function Calculation() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ResultRow[]>([]);

  const [lambdaMax, setLambdaMax] = useState<number | null>(null);
  const [CI, setCI] = useState<number | null>(null);
  const [RI, setRI] = useState<number | null>(null);
  const [CR, setCR] = useState<number | null>(null);
  const [isConsistent, setIsConsistent] = useState(false);

  /* ================= LOAD SESSION DATA ================= */
  useEffect(() => {
    const cached = sessionStorage.getItem("ahp_result");
    if (!cached) return;

    try {
      const data = JSON.parse(cached);

      const rows: ResultRow[] = data.weights.map((w: number, i: number) => ({
        criteria: data.criteria[i].nama,
        weight: w,
        normalizedSum: data.normalizedMatrix[i].reduce(
          (a: number, b: number) => a + b,
          0
        ),
        eigenValue: data.Aw?.[i]
          ? data.Aw[i] / w
          : data.lambdaMax,
      }));

      setResults(rows);
      setLambdaMax(data.lambdaMax);
      setCI(data.CI);
      setRI(data.RI);
      setCR(data.CR);
      setIsConsistent(data.CR <= 0.1);
    } catch {
      sessionStorage.removeItem("ahp_result");
    }
  }, []);

  /* ================= HITUNG ULANG ================= */
  const handleCalculate = async () => {
    setLoading(true);
    setProgress(0);

    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 60));
        setProgress(i);
      }

      const res = await fetch(API_AHP);
      const data = await res.json();
      if (!data.success) throw new Error();

      const rows: ResultRow[] = data.weights.map((w: number, i: number) => ({
        criteria: data.criteria[i].nama,
        weight: w,
        normalizedSum: data.normalizedMatrix[i].reduce(
          (a: number, b: number) => a + b,
          0
        ),
        eigenValue: data.Aw?.[i]
          ? data.Aw[i] / w
          : data.lambdaMax,
      }));

      /* ================= SIMPAN HASIL ================= */
      sessionStorage.setItem("ahp_result", JSON.stringify(data));

      /* ================= 🔥 TAMBAHAN PENTING (UNTUK DASHBOARD) ================= */
      const prevMeta = JSON.parse(localStorage.getItem("ahp_meta") || "{}");

      localStorage.setItem(
        "ahp_meta",
        JSON.stringify({
          totalHitung: (prevMeta.totalHitung || 0) + 1,
          CR: data.CR,
          isConsistent: data.CR <= 0.1,
        })
      );
      /* ======================================================================== */

      setResults(rows);
      setLambdaMax(data.lambdaMax);
      setCI(data.CI);
      setRI(data.RI);
      setCR(data.CR);
      setIsConsistent(data.CR <= 0.1);

      toast({
        title: "Perhitungan Selesai",
        description: `CR = ${(data.CR * 100).toFixed(2)}%`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghitung AHP",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calculator className="w-8 h-8 text-primary" />
              Perhitungan AHP
            </h1>
            <p className="text-muted-foreground">
              Hitung bobot kriteria dan validasi konsistensi
            </p>
          </div>

          <Button variant="hero" onClick={handleCalculate} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Hitung Ulang
          </Button>
        </div>

        {/* PROGRESS */}
        {loading && (
          <Card>
            <CardContent className="p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memproses perhitungan...</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <Progress value={progress} />
            </CardContent>
          </Card>
        )}

        {/* HASIL */}
        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Metric title="λ Max" value={lambdaMax!.toFixed(3)} />
              <Metric title="Consistency Index (CI)" value={CI!.toFixed(4)} />
              <Metric title="Random Index (RI)" value={RI!.toFixed(2)} />

              <Card
                className={
                  isConsistent
                    ? "border-primary/50 bg-primary/5"
                    : "border-destructive/50 bg-destructive/5"
                }
              >
                <CardContent className="p-5">
                  <p className="text-sm">Consistency Ratio (CR)</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      {(CR! * 100).toFixed(2)}%
                    </p>
                    {isConsistent ? (
                      <CheckCircle2 className="text-primary" />
                    ) : (
                      <AlertTriangle className="text-destructive" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* TABEL */}
            <Card>
              <CardHeader>
                <CardTitle>Hasil Bobot Kriteria</CardTitle>
                <CardDescription>
                  Hasil perhitungan AHP otomatis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Kriteria</th>
                      <th className="p-3 text-center">Bobot</th>
                      <th className="p-3 text-center">Σ Normalized</th>
                      <th className="p-3 text-center">Eigen Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-3">{r.criteria}</td>
                        <td className="p-3 text-center">
                          {(r.weight * 100).toFixed(2)}%
                        </td>
                        <td className="p-3 text-center">
                          {r.normalizedSum.toFixed(4)}
                        </td>
                        <td className="p-3 text-center">
                          {r.eigenValue.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* FORMULA */}
            <Card>
              <CardHeader>
                <CardTitle>Formula AHP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/40">
                    <CardContent className="p-4">
                      <p className="font-semibold">Consistency Index</p>
                      <p className="text-sm text-muted-foreground">
                        CI = (λmax − n) / (n − 1)
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/40">
                    <CardContent className="p-4">
                      <p className="font-semibold">Consistency Ratio</p>
                      <p className="text-sm text-muted-foreground">
                        CR = CI / RI
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/40">
                    <CardContent className="p-4">
                      <p className="font-semibold">Syarat Konsisten</p>
                      <p className="text-sm text-muted-foreground">
                        CR ≤ 0.10
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

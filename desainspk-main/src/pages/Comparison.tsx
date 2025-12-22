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
import { GitCompare, Save, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ================= API ================= */
const API_KRITERIA = "http://localhost:4000/api/kriteria";
const API_PERBANDINGAN = "http://localhost:4000/api/perbandingan";

/* ================= SKALA SAATY ================= */
const scaleValues = [
  "1","2","3","4","5","6","7","8","9",
  "1/2","1/3","1/4","1/5","1/6","1/7","1/8","1/9",
];

/* ================= TYPE ================= */
interface Kriteria {
  id: number;
  kode: string;
  nama: string;
}

export default function Comparison() {
  const { toast } = useToast();

  const [criteria, setCriteria] = useState<Kriteria[]>([]);
  const [matrix, setMatrix] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ================= UTIL ================= */

  // string Saaty -> number (ke DB)
  const toNumber = (v: string) =>
    v.includes("/") ? 1 / Number(v.split("/")[1]) : Number(v);

  // number (DB) -> string Saaty (ke UI)  🔥 FIXED
  const toSaatyString = (num: number): string => {
    const eps = 1e-6;
    if (Math.abs(num - 1) < eps) return "1";

    const values = [2,3,4,5,6,7,8,9];
    for (const v of values) {
      if (Math.abs(num - v) < eps) return String(v);
      if (Math.abs(num - 1 / v) < eps) return `1/${v}`;
    }

    // fallback (debug / safety)
    return num.toFixed(3);
  };

  const initMatrix = (length: number) => {
    const m: { [key: string]: string } = {};
    for (let i = 0; i < length; i++) {
      for (let j = i; j < length; j++) {
        m[`${i}-${j}`] = "1";
      }
    }
    return m;
  };

  /* ================= FETCH MATRIX ================= */
  const fetchMatrix = async () => {
    const res = await fetch(API_PERBANDINGAN);
    const json = await res.json();
    if (!json.success) return;

    const m: { [key: string]: string } = {};
    json.matrix.forEach((row: number[], i: number) => {
      row.forEach((val: number, j: number) => {
        if (i <= j) {
          m[`${i}-${j}`] = toSaatyString(val);
        }
      });
    });

    setMatrix(m);
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_KRITERIA);
        const data: Kriteria[] = await res.json();

        const sorted = data.sort(
          (a, b) =>
            parseInt(a.kode.replace(/\D/g, "")) -
            parseInt(b.kode.replace(/\D/g, ""))
        );

        setCriteria(sorted);
        setMatrix(initMatrix(sorted.length));
        await fetchMatrix();
      } catch {
        toast({
          title: "Error",
          description: "Gagal mengambil data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  /* ================= HANDLER ================= */
  const handleValueChange = (row: number, col: number, value: string) => {
    setMatrix((prev) => ({
      ...prev,
      [`${row}-${col}`]: value,
    }));
  };

  const getDisplayValue = (row: number, col: number): string => {
    if (row === col) return "1";
    if (row < col) return matrix[`${row}-${col}`] || "1";

    const upper = matrix[`${col}-${row}`] || "1";
    if (upper.startsWith("1/")) return upper.slice(2);
    if (upper === "1") return "1";
    return `1/${upper}`;
  };

  /* ================= RESET ================= */
  const handleReset = async () => {
    await fetch(`${API_PERBANDINGAN}/reset`, { method: "DELETE" });
    setMatrix(initMatrix(criteria.length));
    toast({
      title: "Reset Berhasil",
      description: "Matrix perbandingan direset",
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const requests = [];

      for (let i = 0; i < criteria.length; i++) {
        for (let j = i + 1; j < criteria.length; j++) {
          const value = matrix[`${i}-${j}`];
          if (!value) continue;

          requests.push(
            fetch(API_PERBANDINGAN, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kode_i: criteria[i].kode,
                kode_j: criteria[j].kode,
                nilai: toNumber(value),
              }),
            })
          );
        }
      }

      await Promise.all(requests);

      toast({
        title: "Berhasil",
        description: "Matrix perbandingan berhasil disimpan",
      });
    } catch {
      toast({
        title: "Error",
        description: "Gagal menyimpan matrix",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  /* ================= RENDER ================= */
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <GitCompare className="w-8 h-8 text-primary" />
              Perbandingan Berpasangan
            </h1>
            <p className="text-muted-foreground">
              Masukkan nilai perbandingan antar kriteria menggunakan skala Saaty
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="hero" onClick={handleSubmit} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </div>
        </div>

        {/* SKALA SAATY */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-4 h-4 text-primary" />
              Skala Saaty (1–9)
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
            <div className="p-2 bg-muted/50 rounded"><b>1</b> = Sama Penting</div>
            <div className="p-2 bg-muted/50 rounded"><b>3</b> = Sedikit Lebih Penting</div>
            <div className="p-2 bg-muted/50 rounded"><b>5</b> = Lebih Penting</div>
            <div className="p-2 bg-muted/50 rounded"><b>7</b> = Sangat Lebih Penting</div>
            <div className="p-2 bg-muted/50 rounded"><b>9</b> = Mutlak Lebih Penting</div>
          </CardContent>
        </Card>

        {/* MATRIX */}
        <Card>
          <CardHeader>
            <CardTitle>Matriks Perbandingan Kriteria</CardTitle>
            <CardDescription>Nilai resiprokal dihitung otomatis</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 bg-muted/50">Kriteria</th>
                    {criteria.map((c) => (
                      <th key={c.id} className="p-3 bg-muted/50">
                        <Tooltip>
                          <TooltipTrigger>{c.kode}</TooltipTrigger>
                          <TooltipContent>{c.nama}</TooltipContent>
                        </Tooltip>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {criteria.map((row, i) => (
                    <tr key={row.id}>
                      <td className="p-3 bg-muted/30">{row.kode}</td>
                      {criteria.map((_, j) => (
                        <td key={j} className="p-2 text-center border-t">
                          {i === j ? (
                            <span className="font-bold text-primary">1</span>
                          ) : i < j ? (
                            <Select
                              value={matrix[`${i}-${j}`] || "1"}
                              onValueChange={(v) =>
                                handleValueChange(i, j, v)
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {scaleValues.map((v) => (
                                  <SelectItem key={v} value={v}>
                                    {v}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground">
                              {getDisplayValue(i, j)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}

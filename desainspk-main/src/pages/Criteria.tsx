import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ListTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Criterion {
  id: number;
  kode: string;
  nama: string;
  bobot: number; // HARUS desimal (0.15)
}

const API_URL = "http://localhost:4000/api/kriteria";

/* 🔑 helper: C10 → 10 */
const getKodeNumber = (kode: string) =>
  parseInt(kode.replace(/\D/g, ""), 10);

export default function Criteria() {
  const { toast } = useToast();

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [newCriterion, setNewCriterion] = useState({
    kode: "",
    nama: "",
    bobot: "",
  });

  const [editingCriterion, setEditingCriterion] =
    useState<Criterion | null>(null);

  /* ================= GET ================= */
  const fetchCriteria = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      // 🔒 pastikan bobot number
      const safeData = data.map((c: any) => ({
        ...c,
        bobot: Number(c.bobot) || 0,
      }));

      setCriteria(safeData);
    } catch {
      toast({
        title: "Error",
        description: "Gagal mengambil data kriteria",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, []);

  /* ================= ADD ================= */
  const handleAddCriterion = async () => {
    if (!newCriterion.kode || !newCriterion.nama || !newCriterion.bobot) return;

    const bobotNormalized =
      parseFloat(newCriterion.bobot.replace(",", ".")) / 100;

    if (isNaN(bobotNormalized)) {
      toast({
        title: "Input tidak valid",
        description: "Bobot harus berupa angka (contoh: 14,99)",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: newCriterion.kode,
          nama: newCriterion.nama,
          bobot: bobotNormalized,
        }),
      });

      toast({
        title: "Kriteria Ditambahkan",
        description: `Kriteria ${newCriterion.nama} berhasil ditambahkan`,
      });

      setNewCriterion({ kode: "", nama: "", bobot: "" });
      setIsAddDialogOpen(false);
      fetchCriteria();
    } catch {
      toast({
        title: "Error",
        description: "Gagal menambahkan kriteria",
        variant: "destructive",
      });
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdateCriterion = async () => {
    if (!editingCriterion) return;

    if (isNaN(editingCriterion.bobot)) {
      toast({
        title: "Bobot tidak valid",
        description: "Bobot harus berupa angka",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(`${API_URL}/${editingCriterion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingCriterion,
          bobot: Number(editingCriterion.bobot),
        }),
      });

      toast({
        title: "Kriteria Diperbarui",
        description: "Perubahan berhasil disimpan",
      });

      setIsEditDialogOpen(false);
      setEditingCriterion(null);
      fetchCriteria();
    } catch {
      toast({
        title: "Error",
        description: "Gagal memperbarui kriteria",
        variant: "destructive",
      });
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: number, name: string) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });

      toast({
        title: "Kriteria Dihapus",
        description: `Kriteria ${name} berhasil dihapus`,
        variant: "destructive",
      });

      fetchCriteria();
    } catch {
      toast({
        title: "Error",
        description: "Gagal menghapus kriteria",
        variant: "destructive",
      });
    }
  };

  /* ================= SORT ================= */
  const sortedCriteria = [...criteria].sort(
    (a, b) => getKodeNumber(a.kode) - getKodeNumber(b.kode)
  );

  /* ✅ FIX NaN TOTAL */
  const totalBobot = sortedCriteria.reduce(
    (sum, c) => sum + (Number(c.bobot) || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ListTree className="w-8 h-8 text-primary" />
              Manajemen Kriteria
            </h1>
            <p className="text-muted-foreground">
              Kelola kriteria untuk perhitungan AHP
            </p>
          </div>

          {/* ADD */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="w-4 h-4" />
                Tambah Kriteria
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kriteria</DialogTitle>
                <DialogDescription>
                  Masukkan kode, nama, dan bobot (%)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Kode (C1, C2, …)"
                  value={newCriterion.kode}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, kode: e.target.value })
                  }
                />
                <Input
                  placeholder="Nama"
                  value={newCriterion.nama}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, nama: e.target.value })
                  }
                />
                <Input
                  placeholder="Bobot (%)"
                  value={newCriterion.bobot}
                  onChange={(e) =>
                    setNewCriterion({ ...newCriterion, bobot: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button onClick={handleAddCriterion}>Simpan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kriteria</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-center">Bobot</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCriteria.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.kode}</TableCell>
                    <TableCell>{c.nama}</TableCell>
                    <TableCell className="text-center">
                      {(c.bobot * 100).toLocaleString("id-ID", {
                        maximumFractionDigits: 2,
                      })}
                      %
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingCriterion(c);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(c.id, c.nama)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <p>Total Kriteria</p>
              <p className="text-2xl font-bold">{sortedCriteria.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p>Total Bobot</p>
              <p
                className={`text-2xl font-bold ${
                  Math.abs(totalBobot - 1) > 0.001
                    ? "text-destructive"
                    : "text-primary"
                }`}
              >
                {(totalBobot * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ================= EDIT ================= */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kriteria</DialogTitle>
            <DialogDescription>
              Perbarui nama dan bobot (%)
            </DialogDescription>
          </DialogHeader>

          {editingCriterion && (
            <div className="space-y-4">
              <Input value={editingCriterion.kode} disabled />
              <Input
                value={editingCriterion.nama}
                onChange={(e) =>
                  setEditingCriterion({
                    ...editingCriterion,
                    nama: e.target.value,
                  })
                }
              />
              <Input
                value={(editingCriterion.bobot * 100)
                  .toString()
                  .replace(".", ",")}
                onChange={(e) =>
                  setEditingCriterion({
                    ...editingCriterion,
                    bobot:
                      parseFloat(e.target.value.replace(",", ".")) / 100 || 0,
                  })
                }
              />
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleUpdateCriterion}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

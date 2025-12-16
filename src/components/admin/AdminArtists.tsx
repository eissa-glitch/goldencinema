import { useState } from "react";
import { useArtists, useCreateArtist, useUpdateArtist, useDeleteArtist } from "@/hooks/useArtists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

interface ArtistFormData {
  name: string;
  birth_year: number | null;
  death_year: number | null;
  biography: string;
  image: string;
  role: string[];
}

const emptyArtist: ArtistFormData = {
  name: "",
  birth_year: null,
  death_year: null,
  biography: "",
  image: "",
  role: [],
};

const AdminArtists = () => {
  const { data: artists, isLoading } = useArtists();
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArtistFormData>(emptyArtist);
  const [roleInput, setRoleInput] = useState("");

  const resetForm = () => {
    setFormData(emptyArtist);
    setRoleInput("");
    setEditingId(null);
  };

  const handleEdit = (artist: any) => {
    setFormData({
      name: artist.name,
      birth_year: artist.birth_year,
      death_year: artist.death_year,
      biography: artist.biography || "",
      image: artist.image || "",
      role: artist.role || [],
    });
    setRoleInput((artist.role || []).join(", "));
    setEditingId(artist.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const artistData = {
      ...formData,
      role: roleInput.split(",").map((r) => r.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateArtist.mutateAsync({ id: editingId, ...artistData });
        toast.success("تم تحديث الفنان بنجاح");
      } else {
        await createArtist.mutateAsync(artistData);
        toast.success("تم إضافة الفنان بنجاح");
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الفنان");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      try {
        await deleteArtist.mutateAsync(id);
        toast.success("تم حذف الفنان بنجاح");
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف الفنان");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          إدارة الفنانين ({artists?.length || 0})
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة فنان
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الفنان" : "إضافة فنان جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_year">سنة الميلاد</Label>
                  <Input
                    id="birth_year"
                    type="number"
                    value={formData.birth_year || ""}
                    onChange={(e) => setFormData({ ...formData, birth_year: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="death_year">سنة الوفاة</Label>
                  <Input
                    id="death_year"
                    type="number"
                    value={formData.death_year || ""}
                    onChange={(e) => setFormData({ ...formData, death_year: e.target.value ? parseInt(e.target.value) : null })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">الأدوار (مفصولة بفاصلة)</Label>
                <Input
                  id="role"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  placeholder="ممثل, مخرج, كاتب"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">رابط الصورة</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="biography">السيرة الذاتية</Label>
                <Textarea
                  id="biography"
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createArtist.isPending || updateArtist.isPending}>
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {artists && artists.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">سنة الميلاد</TableHead>
                <TableHead className="text-right">الأدوار</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => (
                <TableRow key={artist.id}>
                  <TableCell className="font-medium">{artist.name}</TableCell>
                  <TableCell>{artist.birth_year || "-"}</TableCell>
                  <TableCell>{artist.role?.join(", ") || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(artist)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(artist.id, artist.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا يوجد فنانين بعد</p>
            <p className="text-sm">اضغط على "إضافة فنان" لإضافة فنان جديد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminArtists;

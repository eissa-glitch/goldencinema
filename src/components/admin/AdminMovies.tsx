import { useState } from "react";
import { useMovies, useCreateMovie, useUpdateMovie, useDeleteMovie } from "@/hooks/useMovies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Film } from "lucide-react";
import { toast } from "sonner";

interface MovieFormData {
  title: string;
  year: number;
  director: string;
  synopsis: string;
  poster: string;
  genre: string[];
  rating: number;
  duration: number;
}

const emptyMovie: MovieFormData = {
  title: "",
  year: new Date().getFullYear(),
  director: "",
  synopsis: "",
  poster: "",
  genre: [],
  rating: 0,
  duration: 0,
};

const AdminMovies = () => {
  const { data: movies, isLoading } = useMovies();
  const createMovie = useCreateMovie();
  const updateMovie = useUpdateMovie();
  const deleteMovie = useDeleteMovie();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MovieFormData>(emptyMovie);
  const [genreInput, setGenreInput] = useState("");

  const resetForm = () => {
    setFormData(emptyMovie);
    setGenreInput("");
    setEditingId(null);
  };

  const handleEdit = (movie: any) => {
    setFormData({
      title: movie.title,
      year: movie.year,
      director: movie.director || "",
      synopsis: movie.synopsis || "",
      poster: movie.poster || "",
      genre: movie.genre || [],
      rating: movie.rating || 0,
      duration: movie.duration || 0,
    });
    setGenreInput((movie.genre || []).join(", "));
    setEditingId(movie.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const movieData = {
      ...formData,
      genre: genreInput.split(",").map((g) => g.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateMovie.mutateAsync({ id: editingId, ...movieData });
        toast.success("تم تحديث الفيلم بنجاح");
      } else {
        await createMovie.mutateAsync(movieData);
        toast.success("تم إضافة الفيلم بنجاح");
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الفيلم");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف "${title}"؟`)) {
      try {
        await deleteMovie.mutateAsync(id);
        toast.success("تم حذف الفيلم بنجاح");
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف الفيلم");
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
          <Film className="h-5 w-5" />
          إدارة الأفلام ({movies?.length || 0})
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة فيلم
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الفيلم" : "إضافة فيلم جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الفيلم *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">سنة الإنتاج *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">المخرج</Label>
                  <Input
                    id="director"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">المدة (دقيقة)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">التقييم (0-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">التصنيفات (مفصولة بفاصلة)</Label>
                  <Input
                    id="genre"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="دراما, رومانسي, كوميدي"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poster">رابط البوستر</Label>
                <Input
                  id="poster"
                  type="url"
                  value={formData.poster}
                  onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="synopsis">القصة</Label>
                <Textarea
                  id="synopsis"
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMovie.isPending || updateMovie.isPending}>
                  {editingId ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {movies && movies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">السنة</TableHead>
                <TableHead className="text-right">المخرج</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.map((movie) => (
                <TableRow key={movie.id}>
                  <TableCell className="font-medium">{movie.title}</TableCell>
                  <TableCell>{movie.year}</TableCell>
                  <TableCell>{movie.director || "-"}</TableCell>
                  <TableCell>{movie.rating || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(movie)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(movie.id, movie.title)}>
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
            <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد أفلام بعد</p>
            <p className="text-sm">اضغط على "إضافة فيلم" لإضافة فيلم جديد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminMovies;

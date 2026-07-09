import { useState } from "react";
import {
  useAllFestivals, useSaveFestival, useDeleteFestival,
  useFestivalGallery, useAddGalleryItem, useDeleteGalleryItem,
  useFestivalArticles, useSaveArticle, useDeleteArticle,
  useFestivalVideos, useSaveVideo, useDeleteVideo,
  type Festival,
} from "@/hooks/useFestivals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Award, Images, Newspaper, Video, X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";

const emptyFestival = {
  name: "", description: "", year: null as number | null, edition: "",
  poster_url: "", cover_url: "", sort_order: 0, is_published: true,
};

const FestivalsManager = () => {
  const { data: festivals = [], isLoading } = useAllFestivals();
  const saveFestival = useSaveFestival();
  const deleteFestival = useDeleteFestival();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFestival);
  const [managing, setManaging] = useState<Festival | null>(null);

  const reset = () => { setForm(emptyFestival); setEditingId(null); };

  const handleEdit = (f: Festival) => {
    setForm({
      name: f.name, description: f.description || "", year: f.year, edition: f.edition || "",
      poster_url: f.poster_url || "", cover_url: f.cover_url || "",
      sort_order: f.sort_order || 0, is_published: f.is_published,
    });
    setEditingId(f.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveFestival.mutateAsync(editingId ? { id: editingId, ...form } : form);
      toast.success(editingId ? "تم التحديث" : "تم الإضافة");
      setIsOpen(false); reset();
    } catch { toast.error("حدث خطأ"); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`حذف "${name}"؟`)) return;
    try { await deleteFestival.mutateAsync(id); toast.success("تم الحذف"); }
    catch { toast.error("حدث خطأ"); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />إدارة المهرجانات ({festivals.length})</CardTitle>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="ml-2 h-4 w-4" />إضافة مهرجان</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader><DialogTitle>{editingId ? "تعديل مهرجان" : "إضافة مهرجان جديد"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>الاسم *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>السنة</Label>
                  <Input type="number" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : null })} />
                </div>
                <div className="space-y-2">
                  <Label>الدورة</Label>
                  <Input value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} placeholder="مثال: الدورة 30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ملصق المهرجان</Label>
                <ImageUploader onUpload={(url) => setForm({ ...form, poster_url: url })} currentImage={form.poster_url} folder="festivals/posters" />
                <Input dir="ltr" placeholder="أو رابط مباشر" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>صورة الغلاف</Label>
                <ImageUploader onUpload={(url) => setForm({ ...form, cover_url: url })} currentImage={form.cover_url} folder="festivals/covers" />
                <Input dir="ltr" placeholder="أو رابط مباشر" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الترتيب</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
                    منشور
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); reset(); }}>إلغاء</Button>
                <Button type="submit" disabled={saveFestival.isPending}>{editingId ? "تحديث" : "إضافة"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {festivals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">السنة</TableHead>
                <TableHead className="text-right">الدورة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {festivals.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.year || "-"}</TableCell>
                  <TableCell>{f.edition || "-"}</TableCell>
                  <TableCell>{f.is_published ? "منشور" : "مخفي"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => setManaging(f)}>
                        <Images className="h-4 w-4 ml-1" /> المحتوى
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(f)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(f.id, f.name)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد مهرجانات بعد</p>
          </div>
        )}
      </CardContent>

      {/* Content management dialog */}
      <Dialog open={!!managing} onOpenChange={(o) => !o && setManaging(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader><DialogTitle>{managing?.name} — إدارة المحتوى</DialogTitle></DialogHeader>
          {managing && <ContentTabs festival={managing} />}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const ContentTabs = ({ festival }: { festival: Festival }) => (
  <Tabs defaultValue="gallery" className="w-full">
    <TabsList className="grid grid-cols-3 w-full">
      <TabsTrigger value="gallery"><Images className="h-4 w-4 ml-1" />الصور</TabsTrigger>
      <TabsTrigger value="articles"><Newspaper className="h-4 w-4 ml-1" />الأخبار</TabsTrigger>
      <TabsTrigger value="videos"><Video className="h-4 w-4 ml-1" />الفيديوهات</TabsTrigger>
    </TabsList>
    <TabsContent value="gallery"><GalleryPanel festivalId={festival.id} /></TabsContent>
    <TabsContent value="articles"><ArticlesPanel festivalId={festival.id} /></TabsContent>
    <TabsContent value="videos"><VideosPanel festivalId={festival.id} /></TabsContent>
  </Tabs>
);

const GalleryPanel = ({ festivalId }: { festivalId: string }) => {
  const { data: items = [] } = useFestivalGallery(festivalId);
  const add = useAddGalleryItem();
  const del = useDeleteGalleryItem();
  const [caption, setCaption] = useState("");

  const handleUpload = async (url: string) => {
    try {
      await add.mutateAsync({ festival_id: festivalId, image_url: url, caption: caption || null, sort_order: items.length });
      toast.success("تم إضافة الصورة");
      setCaption("");
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>وصف الصورة (اختياري)</Label>
        <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
        <Label>ارفع صورة</Label>
        <ImageUploader onUpload={handleUpload} folder={`festivals/${festivalId}/gallery`} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((i) => (
          <div key={i.id} className="relative group">
            <img src={i.image_url} alt="" className="w-full aspect-square object-cover rounded" />
            {i.caption && <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-1 truncate">{i.caption}</div>}
            <Button size="icon" variant="destructive" className="absolute top-1 left-1 h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => del.mutate({ id: i.id, festival_id: festivalId })}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ArticlesPanel = ({ festivalId }: { festivalId: string }) => {
  const { data: items = [] } = useFestivalArticles(festivalId);
  const save = useSaveArticle();
  const del = useDeleteArticle();
  const [form, setForm] = useState({ title: "", content: "", source: "", published_date: "", image_url: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        festival_id: festivalId,
        title: form.title,
        content: form.content || null,
        source: form.source || null,
        published_date: form.published_date || null,
        image_url: form.image_url || null,
      });
      toast.success("تم الإضافة");
      setForm({ title: "", content: "", source: "", published_date: "", image_url: "" });
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-4 pt-4">
      <form onSubmit={submit} className="space-y-3 border p-4 rounded">
        <Input placeholder="العنوان *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Textarea placeholder="المحتوى" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="المصدر" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <Input type="date" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} />
        </div>
        <ImageUploader onUpload={(url) => setForm({ ...form, image_url: url })} currentImage={form.image_url} folder={`festivals/${festivalId}/articles`} />
        <Button type="submit"><Plus className="h-4 w-4 ml-1" />إضافة مقال</Button>
      </form>
      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="flex items-center justify-between border p-3 rounded">
            <div>
              <div className="font-bold">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.source} {a.published_date}</div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => del.mutate({ id: a.id, festival_id: festivalId })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const VideosPanel = ({ festivalId }: { festivalId: string }) => {
  const { data: items = [] } = useFestivalVideos(festivalId);
  const save = useSaveVideo();
  const del = useDeleteVideo();
  const [form, setForm] = useState({ title: "", description: "", video_url: "", thumbnail_url: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await save.mutateAsync({
        festival_id: festivalId,
        title: form.title,
        description: form.description || null,
        video_url: form.video_url,
        thumbnail_url: form.thumbnail_url || null,
        sort_order: items.length,
      });
      toast.success("تم الإضافة");
      setForm({ title: "", description: "", video_url: "", thumbnail_url: "" });
    } catch { toast.error("حدث خطأ"); }
  };

  return (
    <div className="space-y-4 pt-4">
      <form onSubmit={submit} className="space-y-3 border p-4 rounded">
        <Input placeholder="عنوان الفيديو *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Input dir="ltr" placeholder="رابط الفيديو (يوتيوب أو مباشر) *" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} required />
        <Textarea placeholder="الوصف" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Label>صورة مصغرة (للفيديوهات المرفوعة)</Label>
        <ImageUploader onUpload={(url) => setForm({ ...form, thumbnail_url: url })} currentImage={form.thumbnail_url} folder={`festivals/${festivalId}/videos`} />
        <Button type="submit"><Plus className="h-4 w-4 ml-1" />إضافة فيديو</Button>
      </form>
      <div className="space-y-2">
        {items.map((v) => (
          <div key={v.id} className="flex items-center justify-between border p-3 rounded">
            <div>
              <div className="font-bold">{v.title}</div>
              <div className="text-xs text-muted-foreground truncate max-w-md" dir="ltr">{v.video_url}</div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => del.mutate({ id: v.id, festival_id: festivalId })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FestivalsManager;

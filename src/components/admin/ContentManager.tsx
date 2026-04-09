import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Plus, Trash2, Save, FileText, Video, ImageIcon, Music } from "lucide-react";
import { 
  useSiteContent, 
  useUpdateContent, 
  useCreateContent, 
  useDeleteContent,
  SiteContent 
} from "@/hooks/useSiteContent";
import ImageUploader from "./ImageUploader";

const ContentManager = () => {
  const { data, isLoading } = useSiteContent();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  const [editingItem, setEditingItem] = useState<SiteContent | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState({
    key: "",
    value: "",
    description: "",
  });

  // Quick edit states
  const videoUrl = data?.map["video_url"] || "";
  const heroImage = data?.map["hero_card_image"] || "";
  const musicUrl = data?.map["music_url"] || "";
  const [videoInput, setVideoInput] = useState("");
  const [heroImageInput, setHeroImageInput] = useState("");
  const [musicInput, setMusicInput] = useState("");
  const [videoEditing, setVideoEditing] = useState(false);
  const [heroEditing, setHeroEditing] = useState(false);
  const [musicEditing, setMusicEditing] = useState(false);

  const saveQuickContent = (key: string, value: string, description: string) => {
    if (data?.map[key] !== undefined) {
      updateContent.mutate({ key, value });
    } else {
      createContent.mutate({ key, value, description });
    }
  };

  const handleEdit = (item: SiteContent) => {
    setEditingItem(item);
    setEditValue(item.content_value);
  };

  const handleSave = () => {
    if (!editingItem) return;
    updateContent.mutate(
      { key: editingItem.content_key, value: editValue },
      { onSuccess: () => setEditingItem(null) }
    );
  };

  const handleAdd = () => {
    if (!newContent.key.trim() || !newContent.value.trim()) return;
    createContent.mutate(
      {
        key: newContent.key,
        value: newContent.value,
        description: newContent.description,
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setNewContent({ key: "", value: "", description: "" });
        },
      }
    );
  };

  const handleDelete = (key: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      deleteContent.mutate(key);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Video URL Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-primary" />
              رابط الفيديو الرئيسي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {videoUrl && !videoEditing ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground break-all" dir="ltr">{videoUrl}</p>
                <Button variant="outline" size="sm" onClick={() => { setVideoInput(videoUrl); setVideoEditing(true); }}>
                  <Pencil className="ml-2 h-4 w-4" />
                  تعديل
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (videoInput.trim()) {
                        saveQuickContent("video_url", videoInput.trim(), "رابط الفيديو الرئيسي");
                        setVideoEditing(false);
                      }
                    }}
                    disabled={!videoInput.trim()}
                  >
                    <Save className="ml-2 h-4 w-4" />
                    حفظ
                  </Button>
                  {videoEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setVideoEditing(false)}>
                      إلغاء
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hero Image Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
              الصورة الرئيسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {heroImage && (
              <img src={heroImage} alt="الصورة الرئيسية" className="w-full h-32 object-cover rounded-lg" />
            )}
            {!heroEditing ? (
              <Button variant="outline" size="sm" onClick={() => { setHeroImageInput(heroImage); setHeroEditing(true); }}>
                <Pencil className="ml-2 h-4 w-4" />
                تعديل الصورة
              </Button>
            ) : (
              <div className="space-y-3">
                <ImageUploader
                  folder="hero"
                  onUpload={(url) => {
                    saveQuickContent("hero_card_image", url, "صورة البطاقة الرئيسية");
                    setHeroEditing(false);
                  }}
                />
                <div className="text-sm text-muted-foreground text-center">أو أدخل رابط الصورة</div>
                <Input
                  value={heroImageInput}
                  onChange={(e) => setHeroImageInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (heroImageInput.trim()) {
                        saveQuickContent("hero_card_image", heroImageInput.trim(), "صورة البطاقة الرئيسية");
                        setHeroEditing(false);
                      }
                    }}
                    disabled={!heroImageInput.trim()}
                  >
                    <Save className="ml-2 h-4 w-4" />
                    حفظ الرابط
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setHeroEditing(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Table */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-gold" />
          <h2 className="text-2xl font-bold">إدارة المحتوى النصي</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة محتوى
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة محتوى جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">المفتاح (بالإنجليزية)</label>
                <Input
                  value={newContent.key}
                  onChange={(e) => setNewContent({ ...newContent, key: e.target.value })}
                  placeholder="hero_title"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">القيمة</label>
                <Textarea
                  value={newContent.value}
                  onChange={(e) => setNewContent({ ...newContent, value: e.target.value })}
                  placeholder="النص المراد عرضه"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الوصف (اختياري)</label>
                <Input
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="وصف للمحتوى"
                />
              </div>
              <Button onClick={handleAdd} className="w-full" disabled={createContent.isPending}>
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">المفتاح</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead className="w-48">الوصف</TableHead>
              <TableHead className="w-32 text-center">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.list.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm" dir="ltr">
                  {item.content_key}
                </TableCell>
                <TableCell>
                  {editingItem?.id === item.id ? (
                    <div className="flex items-center gap-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        size="icon"
                        onClick={handleSave}
                        disabled={updateContent.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="line-clamp-2">{item.content_value}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.description}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.content_key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ContentManager;

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
import { Pencil, Plus, Trash2, Save, FileText } from "lucide-react";
import { 
  useSiteContent, 
  useUpdateContent, 
  useCreateContent, 
  useDeleteContent,
  SiteContent 
} from "@/hooks/useSiteContent";

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

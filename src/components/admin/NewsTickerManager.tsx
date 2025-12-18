import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewsTicker } from "@/hooks/useNewsTicker";

const NewsTickerManager = () => {
  const { newsItems, isLoading, addNews, updateNews, deleteNews } = useNewsTicker();
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addNews.mutate(newContent.trim());
    setNewContent("");
  };

  const handleStartEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) return;
    updateNews.mutate({ id, content: editContent.trim() });
    setEditingId(null);
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateNews.mutate({ id, is_active: !currentActive });
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card className="cinema-card">
      <CardHeader>
        <CardTitle className="text-gradient-gold">إدارة شريط الأخبار</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New */}
        <div className="flex gap-2">
          <Input
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="أضف خبر جديد..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={addNews.isPending || !newContent.trim()}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة
          </Button>
        </div>

        {/* News List */}
        <div className="space-y-3">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                item.is_active ? "bg-secondary/50 border-gold/20" : "bg-muted/30 border-muted opacity-60"
              }`}
            >
              {editingId === item.id ? (
                <>
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSaveEdit(item.id)}
                    className="text-green-500 hover:text-green-400"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm">{item.content}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                    title={item.is_active ? "إخفاء" : "إظهار"}
                  >
                    {item.is_active ? (
                      <Eye className="h-4 w-4 text-gold" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleStartEdit(item.id, item.content)}
                  >
                    <Pencil className="h-4 w-4 text-gold" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteNews.mutate(item.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
          
          {newsItems.length === 0 && (
            <p className="text-center text-muted-foreground py-4">لا توجد أخبار</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsTickerManager;

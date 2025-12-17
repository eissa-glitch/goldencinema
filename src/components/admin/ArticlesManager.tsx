import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, FileText, ExternalLink, Wand2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ImageUploader from "./ImageUploader";

interface Article {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
}

interface ArticlesManagerProps {
  entityId: string;
  entityType: "movie" | "artist";
  articles: Article[];
  entityName: string;
}

const ArticlesManager = ({ entityId, entityType, articles, entityName }: ArticlesManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const queryClient = useQueryClient();

  const resetForm = () => {
    setNewTitle("");
    setNewContent("");
    setNewSource("");
    setNewDate("");
    setNewImageUrl("");
  };

  const handleExtractText = async () => {
    if (!newImageUrl) {
      toast.error("يرجى رفع صورة أولاً");
      return;
    }

    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-text-ocr", {
        body: { imageUrl: newImageUrl },
      });

      if (error) throw error;

      if (data.success && data.text) {
        setNewContent(data.text);
        toast.success("تم استخراج النص بنجاح");
      } else {
        toast.error(data.error || "لم يتم العثور على نص في الصورة");
      }
    } catch (error) {
      console.error("OCR error:", error);
      toast.error("حدث خطأ أثناء استخراج النص");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddArticle = async () => {
    if (!newTitle.trim()) {
      toast.error("الرجاء إدخال عنوان المقال");
      return;
    }

    setIsLoading(true);
    try {
      let error;
      if (entityType === "movie") {
        const result = await supabase
          .from("movie_articles")
          .insert({
            movie_id: entityId,
            title: newTitle.trim(),
            content: newContent.trim() || null,
            source: newSource.trim() || null,
            published_date: newDate || null,
            image_url: newImageUrl || null,
          });
        error = result.error;
      } else {
        const result = await supabase
          .from("artist_articles")
          .insert({
            artist_id: entityId,
            title: newTitle.trim(),
            content: newContent.trim() || null,
            source: newSource.trim() || null,
            published_date: newDate || null,
            image_url: newImageUrl || null,
          });
        error = result.error;
      }

      if (error) throw error;

      toast.success("تمت إضافة المقال بنجاح");
      resetForm();
      queryClient.invalidateQueries({ queryKey: [entityType === "movie" ? "movies" : "artists"] });
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
    } catch (error) {
      console.error("Error adding article:", error);
      toast.error("حدث خطأ أثناء إضافة المقال");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    setIsLoading(true);
    try {
      let error;
      if (entityType === "movie") {
        const result = await supabase.from("movie_articles").delete().eq("id", articleId);
        error = result.error;
      } else {
        const result = await supabase.from("artist_articles").delete().eq("id", articleId);
        error = result.error;
      }

      if (error) throw error;

      toast.success("تم حذف المقال بنجاح");
      queryClient.invalidateQueries({ queryKey: [entityType === "movie" ? "movies" : "artists"] });
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("حدث خطأ أثناء حذف المقال");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">مقالات ({articles?.length || 0})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إدارة مقالات: {entityName}
          </DialogTitle>
        </DialogHeader>

        {/* Add New Article Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">إضافة مقال جديد</h4>
          
          <div className="space-y-2">
            <Label htmlFor="articleTitle">عنوان المقال *</Label>
            <Input
              id="articleTitle"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="عنوان المقال"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="articleSource">المصدر</Label>
              <Input
                id="articleSource"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="اسم المصدر أو الرابط"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="articleDate">تاريخ النشر</Label>
              <Input
                id="articleDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>صورة المقال</Label>
            <ImageUploader
              onUpload={(url) => setNewImageUrl(url)}
              currentImage={newImageUrl}
              folder={`articles/${entityType}s`}
            />
            {newImageUrl && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleExtractText}
                disabled={isExtracting}
                className="mt-2"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري استخراج النص...
                  </>
                ) : (
                  <>
                    <Wand2 className="ml-2 h-4 w-4" />
                    استخراج النص من الصورة (OCR)
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="articleContent">محتوى المقال</Label>
            <Textarea
              id="articleContent"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="نص المقال... (يمكنك استخراج النص تلقائياً من صورة المقال)"
              rows={6}
            />
          </div>

          <Button onClick={handleAddArticle} disabled={isLoading || !newTitle.trim()}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة المقال
          </Button>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          <h4 className="font-semibold">المقالات الحالية ({articles?.length || 0})</h4>
          {articles && articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold truncate">{article.title}</h5>
                    {article.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {article.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {article.source && (
                        <span className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {article.source}
                        </span>
                      )}
                      {article.published_date && (
                        <span>{new Date(article.published_date).toLocaleDateString("ar-EG")}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteArticle(article.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد مقالات بعد</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticlesManager;

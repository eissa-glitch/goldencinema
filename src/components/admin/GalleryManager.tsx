import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
}

interface GalleryManagerProps {
  entityId: string;
  entityType: "movie" | "artist";
  images: GalleryImage[];
  entityName: string;
}

const GalleryManager = ({ entityId, entityType, images, entityName }: GalleryManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      toast.error("الرجاء إدخال رابط الصورة");
      return;
    }

    setIsLoading(true);
    try {
      let error;
      if (entityType === "movie") {
        const result = await supabase
          .from("movie_gallery")
          .insert({
            movie_id: entityId,
            image_url: newImageUrl.trim(),
            caption: newCaption.trim() || null,
          });
        error = result.error;
      } else {
        const result = await supabase
          .from("artist_gallery")
          .insert({
            artist_id: entityId,
            image_url: newImageUrl.trim(),
            caption: newCaption.trim() || null,
          });
        error = result.error;
      }

      if (error) throw error;

      toast.success("تمت إضافة الصورة بنجاح");
      setNewImageUrl("");
      setNewCaption("");
      queryClient.invalidateQueries({ queryKey: [entityType === "movie" ? "movies" : "artists"] });
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("حدث خطأ أثناء إضافة الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;

    setIsLoading(true);
    try {
      let error;
      if (entityType === "movie") {
        const result = await supabase.from("movie_gallery").delete().eq("id", imageId);
        error = result.error;
      } else {
        const result = await supabase.from("artist_gallery").delete().eq("id", imageId);
        error = result.error;
      }

      if (error) throw error;

      toast.success("تم حذف الصورة بنجاح");
      queryClient.invalidateQueries({ queryKey: [entityType === "movie" ? "movies" : "artists"] });
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("حدث خطأ أثناء حذف الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">صور ({images?.length || 0})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            إدارة صور: {entityName}
          </DialogTitle>
        </DialogHeader>

        {/* Add New Image Form */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">إضافة صورة جديدة</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">رابط الصورة *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">وصف الصورة</Label>
              <Input
                id="caption"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="وصف اختياري للصورة"
              />
            </div>
          </div>
          <Button onClick={handleAddImage} disabled={isLoading || !newImageUrl.trim()}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة الصورة
          </Button>
        </div>

        {/* Gallery Grid */}
        <div className="space-y-4">
          <h4 className="font-semibold">الصور الحالية ({images?.length || 0})</h4>
          {images && images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group rounded-lg overflow-hidden border">
                  <img
                    src={image.image_url}
                    alt={image.caption || "صورة"}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد صور بعد</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryManager;

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  content: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useNewsTicker = () => {
  const queryClient = useQueryClient();

  const { data: newsItems = [], isLoading } = useQuery({
    queryKey: ["news-ticker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_ticker")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const addNews = useMutation({
    mutationFn: async (content: string) => {
      const maxOrder = newsItems.length > 0 
        ? Math.max(...newsItems.map(n => n.display_order)) + 1 
        : 1;
      
      const { error } = await supabase
        .from("news_ticker")
        .insert({ content, display_order: maxOrder });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-ticker"] });
      toast.success("تم إضافة الخبر بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة الخبر");
    },
  });

  const updateNews = useMutation({
    mutationFn: async ({ id, content, is_active }: { id: string; content?: string; is_active?: boolean }) => {
      const updates: Partial<NewsItem> = {};
      if (content !== undefined) updates.content = content;
      if (is_active !== undefined) updates.is_active = is_active;

      const { error } = await supabase
        .from("news_ticker")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-ticker"] });
      toast.success("تم تحديث الخبر بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء تحديث الخبر");
    },
  });

  const deleteNews = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("news_ticker")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["news-ticker"] });
      toast.success("تم حذف الخبر بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف الخبر");
    },
  });

  return {
    newsItems,
    isLoading,
    addNews,
    updateNews,
    deleteNews,
  };
};

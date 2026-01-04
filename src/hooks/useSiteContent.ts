import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SiteContent {
  id: string;
  content_key: string;
  content_value: string;
  content_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const useSiteContent = () => {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("content_key");

      if (error) throw error;
      
      // Convert to a map for easy access
      const contentMap: Record<string, string> = {};
      (data as SiteContent[]).forEach((item) => {
        contentMap[item.content_key] = item.content_value;
      });
      
      return { list: data as SiteContent[], map: contentMap };
    },
  });
};

export const useContent = (key: string, fallback: string = "") => {
  const { data } = useSiteContent();
  return data?.map[key] ?? fallback;
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_content")
        .update({ content_value: value })
        .eq("content_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("تم حفظ المحتوى");
    },
    onError: (error) => {
      console.error("Error updating content:", error);
      toast.error("فشل في حفظ المحتوى");
    },
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value, 
      description 
    }: { 
      key: string; 
      value: string; 
      description?: string;
    }) => {
      const { error } = await supabase
        .from("site_content")
        .insert({
          content_key: key,
          content_value: value,
          description: description || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("تم إضافة المحتوى");
    },
    onError: (error) => {
      console.error("Error creating content:", error);
      toast.error("فشل في إضافة المحتوى");
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase
        .from("site_content")
        .delete()
        .eq("content_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("تم حذف المحتوى");
    },
    onError: (error) => {
      console.error("Error deleting content:", error);
      toast.error("فشل في حذف المحتوى");
    },
  });
};

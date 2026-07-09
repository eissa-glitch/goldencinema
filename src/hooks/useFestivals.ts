import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Festival {
  id: string;
  name: string;
  description: string | null;
  year: number | null;
  edition: string | null;
  poster_url: string | null;
  cover_url: string | null;
  sort_order: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface FestivalGalleryItem {
  id: string;
  festival_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number | null;
}

export interface FestivalArticle {
  id: string;
  festival_id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
}

export interface FestivalVideo {
  id: string;
  festival_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  sort_order: number | null;
}

export const useFestivals = () =>
  useQuery({
    queryKey: ["festivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });
      if (error) throw error;
      return data as Festival[];
    },
  });

export const useAllFestivals = () =>
  useQuery({
    queryKey: ["festivals", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festivals")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });
      if (error) throw error;
      return data as Festival[];
    },
  });

export const useFestival = (id: string | undefined) =>
  useQuery({
    queryKey: ["festival", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("festivals").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Festival | null;
    },
    enabled: !!id,
  });

export const useFestivalGallery = (id: string | undefined) =>
  useQuery({
    queryKey: ["festival_gallery", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("festival_gallery")
        .select("*")
        .eq("festival_id", id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FestivalGalleryItem[];
    },
    enabled: !!id,
  });

export const useFestivalArticles = (id: string | undefined) =>
  useQuery({
    queryKey: ["festival_articles", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("festival_articles")
        .select("*")
        .eq("festival_id", id)
        .order("published_date", { ascending: false });
      if (error) throw error;
      return data as FestivalArticle[];
    },
    enabled: !!id,
  });

export const useFestivalVideos = (id: string | undefined) =>
  useQuery({
    queryKey: ["festival_videos", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("festival_videos")
        .select("*")
        .eq("festival_id", id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as FestivalVideo[];
    },
    enabled: !!id,
  });

// Mutations
export const useSaveFestival = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (f: Partial<Festival> & { id?: string }) => {
      if (f.id) {
        const { id, created_at, updated_at, ...update } = f as any;
        const { data, error } = await supabase.from("festivals").update(update).eq("id", id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from("festivals").insert(f as any).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["festivals"] }),
  });
};

export const useDeleteFestival = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("festivals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["festivals"] }),
  });
};

export const useAddGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<FestivalGalleryItem, "id">) => {
      const { error } = await supabase.from("festival_gallery").insert(item as any);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["festival_gallery", v.festival_id] }),
  });
};

export const useDeleteGalleryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; festival_id: string }) => {
      const { error } = await supabase.from("festival_gallery").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["festival_gallery", v.festival_id] }),
  });
};

export const useSaveArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (a: Partial<FestivalArticle> & { festival_id: string }) => {
      if (a.id) {
        const { id, ...upd } = a as any;
        const { error } = await supabase.from("festival_articles").update(upd).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("festival_articles").insert(a as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["festival_articles", v.festival_id] }),
  });
};

export const useDeleteArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; festival_id: string }) => {
      const { error } = await supabase.from("festival_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["festival_articles", v.festival_id] }),
  });
};

export const useSaveVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: Partial<FestivalVideo> & { festival_id: string }) => {
      if (v.id) {
        const { id, ...upd } = v as any;
        const { error } = await supabase.from("festival_videos").update(upd).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("festival_videos").insert(v as any);
        if (error) throw error;
      }
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["festival_videos", v.festival_id] }),
  });
};

export const useDeleteVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; festival_id: string }) => {
      const { error } = await supabase.from("festival_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: ["festival_videos", v.festival_id] }),
  });
};

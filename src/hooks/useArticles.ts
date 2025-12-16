import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MovieArticle {
  id: string;
  movie_id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistArticle {
  id: string;
  artist_id: string;
  title: string;
  content: string | null;
  source: string | null;
  published_date: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useMovieArticles = (movieId: string | undefined) => {
  return useQuery({
    queryKey: ["movie_articles", movieId],
    queryFn: async () => {
      if (!movieId) return [];
      
      const { data, error } = await supabase
        .from("movie_articles")
        .select("*")
        .eq("movie_id", movieId)
        .order("published_date", { ascending: false });

      if (error) throw error;
      return data as MovieArticle[];
    },
    enabled: !!movieId,
  });
};

export const useArtistArticles = (artistId: string | undefined) => {
  return useQuery({
    queryKey: ["artist_articles", artistId],
    queryFn: async () => {
      if (!artistId) return [];
      
      const { data, error } = await supabase
        .from("artist_articles")
        .select("*")
        .eq("artist_id", artistId)
        .order("published_date", { ascending: false });

      if (error) throw error;
      return data as ArtistArticle[];
    },
    enabled: !!artistId,
  });
};

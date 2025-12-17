import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Movie = Tables<"movies"> & {
  gallery?: Tables<"movie_gallery">[];
  articles?: Tables<"movie_articles">[];
  cast?: string[];
};

export const useMovies = () => {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("*, gallery:movie_gallery(*), articles:movie_articles(*)")
        .order("year", { ascending: false });

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useMovie = (id: string | undefined) => {
  return useQuery({
    queryKey: ["movie", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("movies")
        .select("*, gallery:movie_gallery(*), articles:movie_articles(*)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      // Get cast from movie_artists
      const { data: castData } = await supabase
        .from("movie_artists")
        .select("artists(name)")
        .eq("movie_id", id);
      
      const cast = castData?.map(c => (c.artists as any)?.name).filter(Boolean) || [];
      
      return { ...data, cast } as Movie;
    },
    enabled: !!id,
  });
};

export const useMoviesByYear = (year: number | null) => {
  return useQuery({
    queryKey: ["movies", "year", year],
    queryFn: async () => {
      if (!year) {
        const { data, error } = await supabase
          .from("movies")
          .select("*, gallery:movie_gallery(*)")
          .order("year", { ascending: false });
        if (error) throw error;
        return data as Movie[];
      }
      
      const { data, error } = await supabase
        .from("movies")
        .select("*, gallery:movie_gallery(*)")
        .eq("year", year)
        .order("title");

      if (error) throw error;
      return data as Movie[];
    },
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movie: TablesInsert<"movies">) => {
      const { data, error } = await supabase
        .from("movies")
        .insert(movie)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...movie }: TablesUpdate<"movies"> & { id: string }) => {
      const { data, error } = await supabase
        .from("movies")
        .update(movie)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      queryClient.invalidateQueries({ queryKey: ["movie", id] });
    },
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("movies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};

export const useYears = () => {
  return useQuery({
    queryKey: ["years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("year")
        .order("year", { ascending: false });

      if (error) throw error;
      const years = [...new Set(data.map(m => m.year))];
      return years;
    },
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies")
        .select("genre");

      if (error) throw error;
      const allGenres = data.flatMap(m => m.genre || []);
      const genres = [...new Set(allGenres)];
      return genres;
    },
  });
};

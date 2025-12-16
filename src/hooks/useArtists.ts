import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Artist = Tables<"artists"> & {
  gallery?: Tables<"artist_gallery">[];
  filmography?: string[];
};

export const useArtists = () => {
  return useQuery({
    queryKey: ["artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("*, artist_gallery(*)")
        .order("name");

      if (error) throw error;
      return data as Artist[];
    },
  });
};

export const useArtist = (id: string | undefined) => {
  return useQuery({
    queryKey: ["artist", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("artists")
        .select("*, artist_gallery(*)")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      // Get filmography from movie_artists
      const { data: filmData } = await supabase
        .from("movie_artists")
        .select("movie_id")
        .eq("artist_id", id);
      
      const filmography = filmData?.map(f => f.movie_id) || [];
      
      return { ...data, filmography } as Artist;
    },
    enabled: !!id,
  });
};

export const useArtistMovies = (artistId: string | undefined) => {
  return useQuery({
    queryKey: ["artist", artistId, "movies"],
    queryFn: async () => {
      if (!artistId) return [];
      
      const { data, error } = await supabase
        .from("movie_artists")
        .select("movies(*)")
        .eq("artist_id", artistId);

      if (error) throw error;
      return data.map(d => d.movies).filter(Boolean);
    },
    enabled: !!artistId,
  });
};

export const useCreateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artist: TablesInsert<"artists">) => {
      const { data, error } = await supabase
        .from("artists")
        .insert(artist)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
  });
};

export const useUpdateArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...artist }: TablesUpdate<"artists"> & { id: string }) => {
      const { data, error } = await supabase
        .from("artists")
        .update(artist)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", id] });
    },
  });
};

export const useDeleteArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("artists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
    },
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select("role");

      if (error) throw error;
      const allRoles = data.flatMap(a => a.role || []);
      const roles = [...new Set(allRoles)];
      return roles;
    },
  });
};
